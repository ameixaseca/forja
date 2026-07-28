/**
 * Integration test: hooks × storage/sqlite × @forja/dominio × @forja/motor-narrativo
 * reais, cruzando a fronteira entre todos eles (nenhum mockado entre si) —
 * só bindings nativos sem equivalente em Node são stubados: `expo-sqlite`
 * (mesmo fake usado em SyncService.integration.spec.ts), `expo-crypto`,
 * `expo-constants` e `@react-native-async-storage/async-storage`. Mesmo
 * precedente: sem simulador/dispositivo real neste ambiente, mockar só o
 * binding nativo é o que resta para testar o fluxo real de ponta a ponta
 * (ver design.md, Non-Goals: sem Detox nesta fase).
 *
 * Cobre o fluxo Juramento → Sessão → Resolução (tarefa 4.6): grava eventos
 * reais no storage local e confirma que `useFicha` reflete o log consolidado
 * após cada passo — sem recalcular nada fora de `calcularFicha`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Catalog } from '@forja/motor-narrativo';

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
        const exists = rows.some(
          (r) => r.campaign_instance_id === campaign_instance_id && r.idempotency_key === idempotency_key,
        );
        if (!exists) {
          rows.push({
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
        }
        return;
      }
      throw new Error(`unmapped SQL in fake sqlite: ${sql}`);
    }),
    getAllAsync: vi.fn(async (sql: string, params: unknown[] = []) => {
      const [campaignInstanceId] = params as [string];
      return rows
        .filter((r) => r.campaign_instance_id === campaignInstanceId)
        .sort((a, b) => a.ocorrido_em.localeCompare(b.ocorrido_em) || a.id_local.localeCompare(b.id_local));
    }),
    withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
  };
}

const fakeSqlite = createFakeSqlite();

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(async () => fakeSqlite),
}));
vi.mock('expo-crypto', () => ({
  randomUUID: vi.fn(() => `id-${Math.random().toString(36).slice(2)}`),
}));
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '0.0.1-teste' } } }));
vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
    },
  };
});

const catalog: Catalog = {
  storylets: [
    {
      id: 'st_cor_fallback',
      banda: 'Cor',
      subclasse: null,
      variantes: [{ texto: 'texto.cor.fallback', efeitos: { 'cap.aberto': true } }],
    },
  ],
};

const CAMPAIGN_ID = 'campaign-fluxo-completo';

describe('Fluxo Juramento → Sessão → Resolução (integração real)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cada evento gravado é refletido pela ficha recalculada em @forja/dominio', async () => {
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useJuramento } = await import('./useJuramento');
    const { useResolution } = await import('./useResolution');
    const { useFicha } = await import('./useFicha');

    const useFluxo = () => ({
      juramento: useJuramento(CAMPAIGN_ID),
      resolucao: useResolution(CAMPAIGN_ID, catalog),
      ficha: useFicha(CAMPAIGN_ID),
    });

    const { result } = renderHook(useFluxo, {});
    await act(async () => {
      await Promise.resolve();
    });

    // Antes de qualquer evento: ficha inicial, sem Juramento.
    expect(result.current.ficha.ficha.juramento).toBeNull();

    // 1. Juramento
    await act(async () => {
      await result.current.juramento.declararJuramento(4);
      await result.current.ficha.refresh();
    });
    expect(result.current.ficha.ficha.juramento).toEqual({
      diasPorSemana: 4,
      dataInicio: expect.any(Date),
      dataFim: expect.any(Date),
    });

    // 2. Sessão → Resolução (motor real decide o storylet, grava sessao_registrada)
    let resolucao;
    await act(async () => {
      resolucao = await result.current.resolucao.registrarSessao();
      await result.current.ficha.refresh();
    });
    expect(resolucao).toMatchObject({ storylet: { id: 'st_cor_fallback' } });

    // Ficha reflete o log consolidado: Juramento declarado + 1 dia treinado.
    const eventos = result.current.ficha.eventos;
    expect(eventos.map((e) => e.tipo)).toEqual(['juramento_declarado', 'sessao_registrada']);
    expect(result.current.ficha.ficha.juramento?.diasPorSemana).toBe(4);

    // 3. Segunda sessão: state narrativo acumula sobre o snapshot anterior.
    await act(async () => {
      await result.current.resolucao.registrarSessao();
      await result.current.ficha.refresh();
    });
    const eventosFinais = result.current.ficha.eventos;
    expect(eventosFinais).toHaveLength(3);
    expect(eventosFinais.filter((e) => e.tipo === 'sessao_registrada')).toHaveLength(2);
  });

  it('RF-004: Juramento inválido não é gravado e não altera a ficha', async () => {
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useJuramento } = await import('./useJuramento');
    const { useFicha } = await import('./useFicha');

    const CAMPAIGN_ID_2 = 'campaign-juramento-invalido';
    const useFluxo = () => ({
      juramento: useJuramento(CAMPAIGN_ID_2),
      ficha: useFicha(CAMPAIGN_ID_2),
    });

    const { result } = renderHook(useFluxo, {});
    await act(async () => {
      await Promise.resolve();
    });

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.juramento.declararJuramento(0);
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBeInstanceOf(Error);
    expect(result.current.ficha.eventos).toHaveLength(0);
    expect(result.current.ficha.ficha.juramento).toBeNull();
  });
});
