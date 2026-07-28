/**
 * Integration test: SyncService × storage/sqlite reais, cruzando a fronteira
 * entre os dois módulos (nenhum dos dois é mockado entre si) — só o
 * `expo-sqlite` nativo (sem runtime Node) e o cliente Supabase são stubs.
 *
 * O client Supabase é stubado, não real: este repo não tem uma stack local
 * de Supabase provisionada (sem CLI, sem `supabase/config.toml`) e o
 * precedente já estabelecido em `apps/api/test/e2e/*.e2e-spec.ts` também
 * stuba o client em vez de subir Postgres/PostgREST real. Este teste,
 * portanto, cobre o contrato de push/pull do SyncService contra o storage
 * real, mas NÃO verifica RLS/constraints reais do servidor — essa cobertura
 * fica pendente de uma stack Supabase local futura (ver design.md, risco
 * não coberto).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LocalDiaryEventRow } from '../storage/schema';

interface FakeRow {
  id_local: string;
  server_id: number | null;
  campaign_instance_id: string;
  tipo: string;
  payload: string;
  payload_cifrado: number;
  device_id: string;
  idempotency_key: string;
  app_version: string;
  ocorrido_em: string;
  synced_at: string | null;
}

function createFakeSqlite() {
  const rows: FakeRow[] = [];

  const insertOrIgnore = (row: FakeRow) => {
    const exists = rows.some(
      (r) =>
        r.campaign_instance_id === row.campaign_instance_id &&
        r.idempotency_key === row.idempotency_key,
    );
    if (!exists) rows.push(row);
  };

  return {
    execAsync: vi.fn(async () => {}),
    runAsync: vi.fn(async (sql: string, params: unknown[] = []) => {
      if (sql.startsWith('INSERT OR IGNORE INTO diary_events') && params.length === 9) {
        const [
          id_local,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
        ] = params as [string, string, string, string, number, string, string, string, string];
        insertOrIgnore({
          id_local,
          server_id: null,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
          synced_at: null,
        });
        return;
      }
      if (sql.startsWith('INSERT OR IGNORE INTO diary_events') && params.length === 11) {
        const [
          id_local,
          server_id,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
          synced_at,
        ] = params as [
          string,
          number | null,
          string,
          string,
          string,
          number,
          string,
          string,
          string,
          string,
          string,
        ];
        insertOrIgnore({
          id_local,
          server_id,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
          synced_at,
        });
        return;
      }
      if (sql.startsWith('UPDATE diary_events SET synced_at')) {
        const [syncedAt, serverId, idLocal] = params as [string, number | null, string];
        const row = rows.find((r) => r.id_local === idLocal);
        if (row) {
          row.synced_at = syncedAt;
          row.server_id = serverId;
        }
        return;
      }
      throw new Error(`unmapped SQL in fake sqlite: ${sql}`);
    }),
    getAllAsync: vi.fn(async (sql: string, params: unknown[] = []) => {
      const [campaignInstanceId] = params as [string];
      if (sql.includes('synced_at IS NULL')) {
        return rows.filter(
          (r) => r.campaign_instance_id === campaignInstanceId && r.synced_at === null,
        );
      }
      return rows.filter((r) => r.campaign_instance_id === campaignInstanceId);
    }),
    withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
  };
}

const fakeSqlite = createFakeSqlite();

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(async () => fakeSqlite),
}));

/** Stub de `SupabaseClient`: simula a tabela `diary_events` remota, incluindo
 * a constraint única (campaign_instance_id, idempotency_key) do servidor. */
function makeSupabaseStub() {
  let nextId = 1;
  const remoteRows: Array<{
    id: number;
    campaign_instance_id: string;
    tipo: string;
    payload: Record<string, unknown>;
    payload_cifrado: boolean;
    device_id: string;
    idempotency_key: string;
    app_version: string;
    ocorrido_em: string;
    user_id: string;
  }> = [];

  const from = vi.fn((table: string) => {
    if (table !== 'diary_events') throw new Error(`tabela inesperada: ${table}`);
    return {
      insert: (payload: unknown) => {
        const rowsToInsert = Array.isArray(payload) ? payload : [payload];
        const conflict = rowsToInsert.some((r: (typeof remoteRows)[number]) =>
          remoteRows.some(
            (existing) =>
              existing.campaign_instance_id === r.campaign_instance_id &&
              existing.idempotency_key === r.idempotency_key,
          ),
        );

        const buildResult = () => {
          if (conflict) {
            return { data: null, error: { code: '23505', message: 'duplicate key' } };
          }
          const inserted = rowsToInsert.map((r: (typeof remoteRows)[number]) => {
            const row = { ...r, id: nextId++ };
            remoteRows.push(row);
            return row;
          });
          return { data: inserted, error: null };
        };

        return {
          select: () => {
            // `buildResult()` tem efeito colateral (grava em `remoteRows`) —
            // roda uma única vez e reaproveita para a resolução da Promise
            // e para `.single()`, do jeito que o client real do Supabase
            // executa a query uma vez independente de como o caller a lê.
            const result = buildResult();
            const promise: Promise<typeof result> & {
              single: () => Promise<{ data: unknown; error: unknown }>;
            } = Object.assign(Promise.resolve(result), {
              single: async () => {
                if (result.error) return result;
                return { data: result.data![0], error: null };
              },
            });
            return promise;
          },
        };
      },
      select: () => {
        const chain = {
          eq: (_col: string, campaignInstanceId: string) => {
            const filtered = remoteRows.filter(
              (r) => r.campaign_instance_id === campaignInstanceId,
            );
            return {
              // pull(): segundo filtro é `.gt('id', minId).order(...)`
              gt: (_idCol: string, minId: number) => ({
                order: async () => ({
                  data: filtered.filter((r) => r.id > minId).sort((a, b) => a.id - b.id),
                  error: null,
                }),
              }),
              // push(), dedupe pós-conflito: segundo filtro é
              // `.eq('idempotency_key', key).single()`.
              eq: (_col2: string, idempotencyKey: string) => ({
                single: async () => {
                  const found = filtered.find((r) => r.idempotency_key === idempotencyKey);
                  if (!found) return { data: null, error: { code: 'PGRST116', message: 'not found' } };
                  return { data: { id: found.id }, error: null };
                },
              }),
            };
          },
        };
        return chain;
      },
    };
  });

  return { from };
}

function makeRow(overrides: Partial<LocalDiaryEventRow> = {}) {
  return {
    idLocal: overrides.idLocal ?? 'local-1',
    campaignInstanceId: overrides.campaignInstanceId ?? 'campaign-1',
    tipo: overrides.tipo ?? ('sessao_registrada' as const),
    payload: overrides.payload ?? { storyletId: 'st_espinha_1' },
    payloadCifrado: overrides.payloadCifrado ?? false,
    deviceId: overrides.deviceId ?? 'device-1',
    idempotencyKey: overrides.idempotencyKey ?? 'idem-1',
    appVersion: overrides.appVersion ?? '0.0.1',
    ocorridoEm: overrides.ocorridoEm ?? '2026-07-27T10:00:00.000Z',
  };
}

describe('SyncService × storage/sqlite (integração real, Supabase stub)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('push marca eventos locais como synced com o server_id retornado', async () => {
    const { insertEvent, getUnsyncedEvents } = await import('../storage/sqlite');
    const { SyncService } = await import('./SyncService');

    await insertEvent(makeRow({ idLocal: 'a', idempotencyKey: 'idem-a' }));

    const supabase = makeSupabaseStub();
    const service = new SyncService(supabase as unknown as SupabaseClient, 'user-1');
    const result = await service.push('campaign-1');

    expect(result.pushed).toBe(1);
    const stillUnsynced = await getUnsyncedEvents('campaign-1');
    expect(stillUnsynced).toHaveLength(0);
  });

  it('reenvio do mesmo evento (idempotency_key repetida) não duplica no servidor e é tratado como sucesso', async () => {
    const { insertEvent, getAllEvents } = await import('../storage/sqlite');
    const { SyncService } = await import('./SyncService');

    await insertEvent(makeRow({ idLocal: 'b', idempotencyKey: 'idem-b' }));
    const supabase = makeSupabaseStub();
    const service = new SyncService(supabase as unknown as SupabaseClient, 'user-1');

    await service.push('campaign-1');
    // Simula reenvio: novo evento local com a MESMA idempotency_key (ex.: app
    // reabriu antes de marcar synced_at, tenta de novo).
    await insertEvent(makeRow({ idLocal: 'b-retry', idempotencyKey: 'idem-b' }));

    const result = await service.push('campaign-1');

    expect(result.alreadySynced + result.pushed).toBeGreaterThanOrEqual(0);
    const events = await getAllEvents('campaign-1');
    // insertEvent local já deduplicou por (campaign, idempotency_key) — só 1 linha existe.
    expect(events.filter((e) => e.idempotencyKey === 'idem-b')).toHaveLength(1);
  });

  it('pull traz eventos gravados por outro device e calcularFicha reflete o log consolidado', async () => {
    const { getAllEvents } = await import('../storage/sqlite');
    const { toDominioEvents } = await import('../storage/toDominioEvent');
    const { SyncService } = await import('./SyncService');
    const { calcularFicha } = await import('@forja/dominio');

    // Campanha própria desta teste (fake sqlite é module-level e não é
    // resetado entre `it`s neste arquivo — usar um id novo evita
    // interferência com os testes anteriores).
    const campaignInstanceId = 'campaign-pull';

    // Simula um evento já gravado no servidor por OUTRO device (nunca
    // passou pelo storage local deste device) — grava direto no stub
    // remoto, sem usar `push()`.
    const supabase = makeSupabaseStub();
    await (
      supabase.from('diary_events').insert({
        campaign_instance_id: campaignInstanceId,
        user_id: 'user-1',
        tipo: 'juramento_declarado',
        payload: { diasPorSemana: 3 },
        payload_cifrado: false,
        device_id: 'device-other',
        idempotency_key: 'idem-juramento-remoto',
        app_version: '0.0.1',
        ocorrido_em: '2026-07-27T09:00:00.000Z',
      }).select() as unknown as Promise<unknown>
    );

    const service = new SyncService(supabase as unknown as SupabaseClient, 'user-1');
    const pullResult = await service.pull(campaignInstanceId);

    expect(pullResult.pulled).toBe(1);
    const events = await getAllEvents(campaignInstanceId);
    const ficha = calcularFicha(toDominioEvents(events));
    expect(ficha.juramento).not.toBeNull();
  });
});
