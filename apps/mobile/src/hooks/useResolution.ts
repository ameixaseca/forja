import { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { resolve, type Catalog, type Inputs, type ResolutionResult } from '@forja/motor-narrativo';
import { insertEvent } from '../storage/sqlite';
import { newId, getDeviceId } from '../lib/ids';
import { rolar2d6 } from '../lib/dados';
import { buildNarrativeState } from '../narrative/state';
import { useFicha } from './useFicha';

export interface UseResolutionResult {
  registrarSessao: (inputsOverride?: Partial<Inputs>) => Promise<ResolutionResult>;
  ultimoResultado: ResolutionResult | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Monta `Inputs` a partir da ficha corrente (D-033: app traduz seu domínio
 * em qualidades de entrada antes de invocar a resolução — PRD D-033),
 * chama `resolve()` puro do motor e grava o resultado como `sessao_registrada`.
 *
 * Simplificação MVP (registrada em design.md/tasks.md, Grupo 4): `ciclo_cumprido`,
 * `tregua`, `reencontro` e `sessao_secundaria` ainda não têm derivação real a
 * partir do log — `Ficha` não carrega esses campos, e a definição completa
 * (DEC-011, DEC-033) exige olhar o histórico de sessões do dia/ciclo, fora do
 * escopo dos hooks desta fase. Default `false`, sobrescrevível via `inputsOverride`.
 */
export function useResolution(campaignInstanceId: string, catalog: Catalog): UseResolutionResult {
  const { ficha, eventos, loading, refresh } = useFicha(campaignInstanceId);
  const [ultimoResultado, setUltimoResultado] = useState<ResolutionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const registrarSessao = useCallback(
    async (inputsOverride: Partial<Inputs> = {}) => {
      try {
        const state = buildNarrativeState(eventos);
        const inputs: Inputs = {
          rolagem: rolar2d6() + ficha.vontade,
          atributo: ficha.atributos,
          vontade: ficha.vontade,
          ciclo_cumprido: false,
          tregua: false,
          reencontro: false,
          sessao_secundaria: false,
          ...inputsOverride,
        };
        const seed = Date.now();
        const resolution = resolve(catalog, state, inputs, seed);

        const deviceId = await getDeviceId();
        await insertEvent({
          idLocal: newId(),
          campaignInstanceId,
          tipo: 'sessao_registrada',
          payload: {
            storyletId: resolution.storylet.id,
            texto: resolution.texto,
            efeitos: resolution.efeitos,
            qualities: resolution.newState.qualities,
          },
          payloadCifrado: false,
          deviceId,
          idempotencyKey: newId(),
          appVersion: Constants.expoConfig?.version ?? '0.0.0',
          ocorridoEm: new Date().toISOString(),
        });

        setUltimoResultado(resolution);
        setError(null);
        await refresh();
        return resolution;
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
        throw wrapped;
      }
    },
    [eventos, ficha, campaignInstanceId, catalog, refresh],
  );

  return { registrarSessao, ultimoResultado, loading, error, refresh };
}
