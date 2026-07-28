/**
 * Regressão do achado do code review final do Grupo 7: `useResolution`
 * mantém sua própria instância interna de `useFicha` (só para recalcular
 * `vontade` entre rolagens, ver useResolution.ts:30) — inteiramente
 * separada do `ficha` de nível superior que `CampaignProvider` expõe para
 * Home/Histórico/Compartilhar. `SessaoScreen` registrava sessão só através
 * de `resolution.registrarSessao()` sem nunca chamar `ficha.refresh()` do
 * contexto, deixando essas telas com dados desatualizados após qualquer
 * sessão registrada (bug real, não achado por testes anteriores porque
 * `hooks/session-flow.integration.spec.ts` compõe seus próprios hooks à mão
 * e nunca passa por `CampaignProvider`/`useCampaign()`).
 *
 * Este teste cruza a fronteira real: `CampaignProvider` real, hooks reais
 * (`useFicha`/`useResolution`/`useJuramento` via `useCampaign()`), storage
 * SQLite real, `@forja/dominio`/`@forja/motor-narrativo` reais — só
 * bindings nativos sem equivalente em Node são stubados (mesmo precedente
 * de `hooks/session-flow.integration.spec.ts`).
 */
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const fakeSqliteRows: FakeRow[] = [];
const asyncStorageStore = new Map<string, string>();

function createFakeSqlite() {
  const rows = fakeSqliteRows;

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
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => asyncStorageStore.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      asyncStorageStore.set(key, value);
    }),
  },
}));

function renderCampaignProvider() {
  const result: { current: ReturnType<(typeof import('./CampaignContext'))['useCampaign']> } = {
    current: undefined as never,
  };

  let renderer!: ReactTestRenderer;
  return {
    mount: async () => {
      const { CampaignProvider, useCampaign } = await import('./CampaignContext');
      function Consumer() {
        result.current = useCampaign();
        return null;
      }
      act(() => {
        renderer = create(
          createElement(CampaignProvider, null, createElement(Consumer)),
        );
      });
      return result;
    },
    unmount: () => act(() => renderer.unmount()),
  };
}

describe('CampaignContext × SessaoScreen (regressão: ficha desatualizada após sessão)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    fakeSqliteRows.length = 0;
    asyncStorageStore.clear();
  });

  it('ficha de nível superior (consumida por Home/Histórico/Compartilhar) reflete sessão registrada quando refresh() é chamado após registrarSessao(), replicando o fluxo real de SessaoScreen', async () => {
    const provider = renderCampaignProvider();
    const result = await provider.mount();

    // boot: initDB() + getOrCreateActiveCampaignInstanceId() são assíncronos
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.campaignInstanceId).toEqual(expect.any(String));
    expect(result.current.ficha.eventos).toHaveLength(0);

    // Exatamente o que `app/sessao.tsx` faz após o fix: chama a instância
    // interna de useFicha via resolution.registrarSessao(), depois refresca
    // explicitamente o `ficha` de nível superior do contexto.
    await act(async () => {
      await result.current.resolution.registrarSessao();
      await result.current.ficha.refresh();
    });

    expect(result.current.ficha.eventos.map((e) => e.tipo)).toEqual(['sessao_registrada']);
    expect(result.current.resolution.ultimoResultado).not.toBeNull();

    provider.unmount();
  });

  it('sem o refresh() do ficha de nível superior, a dessincronia reaparece (documenta o bug corrigido)', async () => {
    const provider = renderCampaignProvider();
    const result = await provider.mount();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.resolution.registrarSessao();
      // Propositalmente NÃO chama result.current.ficha.refresh() aqui —
      // reproduz o bug original de SessaoScreen antes do fix do Grupo 7.
    });

    // resolution enxerga o evento (sua própria instância interna de useFicha
    // já se auto-atualiza dentro de registrarSessao), mas o ficha de nível
    // superior do contexto — o que Home/Histórico/Compartilhar realmente
    // consomem — continua desatualizado sem o refresh() explícito.
    expect(result.current.ficha.eventos).toHaveLength(0);

    provider.unmount();
  });
});
