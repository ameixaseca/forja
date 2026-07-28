import { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { validarJuramento } from '@forja/dominio';
import { insertEvent } from '../storage/sqlite';
import { newId, getDeviceId } from '../lib/ids';

export interface UseJuramentoResult {
  declararJuramento: (diasPorSemana: number) => Promise<void>;
  error: Error | null;
}

/**
 * RF-004/RF-005: valida e grava `juramento_declarado`. A regra de negócio
 * (1..6 dias/semana) vive só em `@forja/dominio`; este hook não a duplica,
 * só a invoca antes de escrever no log (D-033).
 */
export function useJuramento(campaignInstanceId: string): UseJuramentoResult {
  const [error, setError] = useState<Error | null>(null);

  const declararJuramento = useCallback(
    async (diasPorSemana: number) => {
      if (!validarJuramento(diasPorSemana)) {
        const err = new Error(`diasPorSemana inválido: ${diasPorSemana} (RF-004: 1..6)`);
        setError(err);
        throw err;
      }

      const deviceId = await getDeviceId();
      try {
        await insertEvent({
          idLocal: newId(),
          campaignInstanceId,
          tipo: 'juramento_declarado',
          payload: { diasPorSemana },
          payloadCifrado: false,
          deviceId,
          idempotencyKey: newId(),
          appVersion: Constants.expoConfig?.version ?? '0.0.0',
          ocorridoEm: new Date().toISOString(),
        });
        setError(null);
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
        throw wrapped;
      }
    },
    [campaignInstanceId],
  );

  return { declararJuramento, error };
}
