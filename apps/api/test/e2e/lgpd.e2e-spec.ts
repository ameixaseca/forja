import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { LgpdModule } from '../../src/modules/lgpd/lgpd.module';
import { SupabaseServiceRoleClient } from '../../src/supabase/supabase-service-role.provider';
import { AuthGuard, AuthenticatedRequest } from '../../src/guards/auth.guard';

function makeAuthenticatedGuardStub(userId: string) {
  return {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      request.userId = userId;
      return true;
    },
  };
}

function makeSupabaseStub(
  usersData: Record<string, { purchase_receipts: Array<{ id: string }> }>,
) {
  const from = jest.fn((table: string) => ({
    select: () => ({
      eq: (_field: string, userId: string) => {
        if (table === 'profiles') {
          return { maybeSingle: () => Promise.resolve({ data: null }) };
        }
        if (table === 'purchase_receipts') {
          return Promise.resolve({
            data: usersData[userId]?.purchase_receipts ?? [],
          });
        }
        return Promise.resolve({ data: [] });
      },
    }),
  }));
  return { client: { from } } as unknown as SupabaseServiceRoleClient;
}

describe('GET /data-export (e2e)', () => {
  let app: NestFastifyApplication;

  async function buildApp(options: {
    authenticated?: string;
    usersData: Record<string, { purchase_receipts: Array<{ id: string }> }>;
  }) {
    const builder = Test.createTestingModule({ imports: [LgpdModule] })
      .overrideProvider(SupabaseServiceRoleClient)
      .useValue(makeSupabaseStub(options.usersData));

    if (options.authenticated) {
      builder
        .overrideGuard(AuthGuard)
        .useValue(makeAuthenticatedGuardStub(options.authenticated));
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

  it('isola purchase_receipts entre dois usuários diferentes', async () => {
    const usersData = {
      'user-a': { purchase_receipts: [{ id: 'recibo-a' }] },
      'user-b': { purchase_receipts: [{ id: 'recibo-b' }] },
    };

    app = await buildApp({ authenticated: 'user-a', usersData });
    const responseA = await app.inject({ method: 'GET', url: '/data-export' });
    await app.close();

    app = await buildApp({ authenticated: 'user-b', usersData });
    const responseB = await app.inject({ method: 'GET', url: '/data-export' });

    const bodyA = responseA.json<{
      purchase_receipts: Array<{ id: string }>;
    }>();
    const bodyB = responseB.json<{
      purchase_receipts: Array<{ id: string }>;
    }>();
    expect(bodyA.purchase_receipts).toEqual([{ id: 'recibo-a' }]);
    expect(bodyB.purchase_receipts).toEqual([{ id: 'recibo-b' }]);
  });

  it('usuário sem entitlements/recibos recebe coleções vazias, sem erro', async () => {
    app = await buildApp({ authenticated: 'user-sem-compras', usersData: {} });

    const response = await app.inject({ method: 'GET', url: '/data-export' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      diary_events: [],
      consent_events: [],
      profile: null,
      entitlements: [],
      purchase_receipts: [],
    });
  });

  it('request sem autenticação retorna 401', async () => {
    app = await buildApp({ usersData: {} });

    const response = await app.inject({ method: 'GET', url: '/data-export' });

    expect(response.statusCode).toBe(401);
  });
});
