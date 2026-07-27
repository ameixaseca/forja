import { LgpdService } from './lgpd.service';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';

interface StubData {
  diary_events?: unknown[];
  consent_events?: unknown[];
  profile?: unknown;
  entitlements?: unknown[];
  purchase_receipts?: unknown[];
}

function makeSupabaseStub(data: StubData) {
  const eqCalls: Record<string, Array<[string, string]>> = {};
  const selectCalls: Record<string, string> = {};

  const from = jest.fn((table: string) => {
    const eq = jest.fn((field: string, value: string) => {
      eqCalls[table] = eqCalls[table] ?? [];
      eqCalls[table].push([field, value]);

      if (table === 'profiles') {
        return {
          maybeSingle: () => Promise.resolve({ data: data.profile ?? null }),
        };
      }
      const rows = (data as Record<string, unknown[]>)[table] ?? [];
      return Promise.resolve({ data: rows });
    });
    const select = jest.fn((columns: string) => {
      selectCalls[table] = columns;
      return { eq };
    });
    return { select };
  });

  const supabase = { client: { from } } as unknown as SupabaseServiceRoleClient;
  return { supabase, from, eqCalls, selectCalls };
}

describe('LgpdService', () => {
  it('agrega as 5 coleções filtradas pelo usuário autenticado', async () => {
    const { supabase } = makeSupabaseStub({
      diary_events: [{ id: 1, tipo: 'sessao_registrada' }],
      consent_events: [{ id: 'c1', tipo: 'backup_nuvem' }],
      profile: { id: 'user-1', idioma: 'pt-BR' },
      entitlements: [{ id: 'e1', pacote: 'forja_campaign_espinha' }],
      purchase_receipts: [{ id: 'p1', origem: 'app_store' }],
    });
    const service = new LgpdService(supabase);

    const resultado = await service.exportarDados('user-1');

    expect(resultado).toEqual({
      diary_events: [{ id: 1, tipo: 'sessao_registrada' }],
      consent_events: [{ id: 'c1', tipo: 'backup_nuvem' }],
      profile: { id: 'user-1', idioma: 'pt-BR' },
      entitlements: [{ id: 'e1', pacote: 'forja_campaign_espinha' }],
      purchase_receipts: [{ id: 'p1', origem: 'app_store' }],
    });
  });

  it('usuário sem entitlements/recibos recebe coleções vazias, sem erro', async () => {
    const { supabase } = makeSupabaseStub({ profile: null });
    const service = new LgpdService(supabase);

    const resultado = await service.exportarDados('user-2');

    expect(resultado).toEqual({
      diary_events: [],
      consent_events: [],
      profile: null,
      entitlements: [],
      purchase_receipts: [],
    });
  });

  it('filtra purchase_receipts explicitamente por user_id (única defesa fora do RLS, ADR-0011)', async () => {
    const { supabase, eqCalls } = makeSupabaseStub({});
    const service = new LgpdService(supabase);

    await service.exportarDados('user-3');

    expect(eqCalls['purchase_receipts']).toEqual([['user_id', 'user-3']]);
  });

  it('seleciona todas as colunas (*) e filtra profiles por id, não por user_id', async () => {
    const { supabase, eqCalls, selectCalls } = makeSupabaseStub({});
    const service = new LgpdService(supabase);

    await service.exportarDados('user-4');

    expect(selectCalls).toEqual({
      diary_events: '*',
      consent_events: '*',
      profiles: '*',
      entitlements: '*',
      purchase_receipts: '*',
    });
    expect(eqCalls['profiles']).toEqual([['id', 'user-4']]);
    expect(eqCalls['diary_events']).toEqual([['user_id', 'user-4']]);
    expect(eqCalls['consent_events']).toEqual([['user_id', 'user-4']]);
    expect(eqCalls['entitlements']).toEqual([['user_id', 'user-4']]);
  });

  it('isola dados entre dois usuários diferentes', async () => {
    const stubA = makeSupabaseStub({ entitlements: [{ id: 'e-a' }] });
    const stubB = makeSupabaseStub({ entitlements: [{ id: 'e-b' }] });
    const serviceA = new LgpdService(stubA.supabase);
    const serviceB = new LgpdService(stubB.supabase);

    const exportA = await serviceA.exportarDados('user-a');
    const exportB = await serviceB.exportarDados('user-b');

    expect(exportA.entitlements).toEqual([{ id: 'e-a' }]);
    expect(exportB.entitlements).toEqual([{ id: 'e-b' }]);
    expect(stubA.eqCalls['entitlements']).toEqual([['user_id', 'user-a']]);
    expect(stubB.eqCalls['entitlements']).toEqual([['user_id', 'user-b']]);
  });
});
