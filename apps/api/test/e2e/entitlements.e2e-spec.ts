import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { EntitlementsModule } from '../../src/modules/entitlements/entitlements.module';
import { SupabaseServiceRoleClient } from '../../src/supabase/supabase-service-role.provider';
import { AuthGuard, AuthenticatedRequest } from '../../src/guards/auth.guard';
import {
  RECEIPT_VALIDATOR_REGISTRY,
  ReceiptValidatorRegistry,
} from '../../src/modules/entitlements/receipt-validator';

function makeAuthenticatedGuardStub(userId: string) {
  return {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      request.userId = userId;
      return true;
    },
  };
}

function makeSupabaseStub() {
  const insertSingle = jest
    .fn()
    .mockResolvedValue({ data: { id: 'recibo-1' } });
  const insert = jest
    .fn()
    .mockReturnValue({ select: () => ({ single: insertSingle }) });

  const upsertSingle = jest
    .fn()
    .mockResolvedValue({ data: { id: 'entitlement-1' } });
  const upsert = jest
    .fn()
    .mockReturnValue({ select: () => ({ single: upsertSingle }) });

  const update = jest
    .fn()
    .mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

  const from = jest.fn((table: string) => {
    if (table === 'purchase_receipts') return { insert, update };
    if (table === 'entitlements') return { upsert };
    throw new Error(`tabela inesperada: ${table}`);
  });

  return { client: { from } } as unknown as SupabaseServiceRoleClient;
}

function makeValidatorsStub(valid: boolean): ReceiptValidatorRegistry {
  const result = valid
    ? { valid: true, productId: 'forja_campaign_espinha', expiresAt: null }
    : { valid: false };
  const validate = jest.fn().mockResolvedValue(result);
  return { ios: { validate }, android: { validate }, stripe: { validate } };
}

describe('POST /entitlements/validate (e2e)', () => {
  let app: NestFastifyApplication;

  async function buildApp(options: {
    authenticated: boolean;
    receiptValid?: boolean;
  }) {
    const builder = Test.createTestingModule({ imports: [EntitlementsModule] })
      .overrideProvider(SupabaseServiceRoleClient)
      .useValue(makeSupabaseStub())
      .overrideProvider(RECEIPT_VALIDATOR_REGISTRY)
      .useValue(makeValidatorsStub(options.receiptValid ?? true));

    if (options.authenticated) {
      builder
        .overrideGuard(AuthGuard)
        .useValue(makeAuthenticatedGuardStub('user-1'));
    }

    const moduleRef: TestingModule = await builder.compile();
    const application = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await application.init();
    await application.getHttpAdapter().getInstance().ready();
    return application;
  }

  afterEach(async () => {
    await app?.close();
  });

  it('recibo válido de usuário autenticado retorna entitlement concedido', async () => {
    app = await buildApp({ authenticated: true, receiptValid: true });

    const response = await app.inject({
      method: 'POST',
      url: '/entitlements/validate',
      payload: { platform: 'ios', receipt: 'recibo-base64' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      valid: true,
      product_id: 'forja_campaign_espinha',
      expires_at: null,
    });
  });

  it('recibo inválido retorna valid: false, sem entitlement', async () => {
    app = await buildApp({ authenticated: true, receiptValid: false });

    const response = await app.inject({
      method: 'POST',
      url: '/entitlements/validate',
      payload: { platform: 'android', receipt: 'recibo-invalido' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ valid: false });
  });

  it('request sem autenticação retorna 401', async () => {
    app = await buildApp({ authenticated: false });

    const response = await app.inject({
      method: 'POST',
      url: '/entitlements/validate',
      payload: { platform: 'ios', receipt: 'recibo-base64' },
    });

    expect(response.statusCode).toBe(401);
  });
});
