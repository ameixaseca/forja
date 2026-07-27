import { HealthController } from './health.controller';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';

function makeSupabaseStub(error: { message: string } | null) {
  return {
    client: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ error }),
        }),
      }),
    },
  } as unknown as SupabaseServiceRoleClient;
}

function makeResStub() {
  const res: {
    statusCode?: number;
    body?: unknown;
    status: jest.Mock;
    send: jest.Mock;
  } = {
    status: jest.fn(),
    send: jest.fn(),
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.send.mockImplementation((body: unknown) => {
    res.body = body;
    return res;
  });
  return res;
}

describe('HealthController', () => {
  it('retorna 200 quando o banco responde sem erro', async () => {
    const controller = new HealthController(makeSupabaseStub(null));
    const res = makeResStub();

    await controller.check(res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('retorna 503 quando o banco falha', async () => {
    const controller = new HealthController(
      makeSupabaseStub({ message: 'conexão recusada' }),
    );
    const res = makeResStub();

    await controller.check(res as never);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ status: 'erro', detalhe: 'conexão recusada' });
  });
});
