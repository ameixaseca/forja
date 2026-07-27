import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HealthModule } from '../../src/modules/health/health.module';
import { SupabaseServiceRoleClient } from '../../src/supabase/supabase-service-role.provider';

describe('GET /health (e2e)', () => {
  let app: NestFastifyApplication;

  async function buildApp(error: { message: string } | null) {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(SupabaseServiceRoleClient)
      .useValue({
        client: {
          from: () => ({
            select: () => ({
              limit: () => Promise.resolve({ error }),
            }),
          }),
        },
      })
      .compile();

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

  it('retorna 200 quando a API e o banco estão disponíveis', async () => {
    app = await buildApp(null);

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('retorna 503 quando o banco está indisponível', async () => {
    app = await buildApp({ message: 'timeout' });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(503);
  });
});
