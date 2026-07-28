import { useCallback, useEffect, useMemo, useState } from 'react';
import { calcularFicha, type Ficha } from '@forja/dominio';
import { getAllEvents } from '../storage/sqlite';
import { toDominioEvents } from '../storage/toDominioEvent';
import type { LocalDiaryEventRow } from '../storage/schema';

export interface UseFichaResult {
  /** Projeção de `calcularFicha(eventos)` — nunca estado próprio (ADR-0002). */
  ficha: Ficha;
  eventos: LocalDiaryEventRow[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Única porta de entrada de `@forja/dominio` nas telas (D-033/D1 de
 * design.md): carrega o log local da campanha e recalcula a ficha —
 * nunca lê/escreve estado de ficha diretamente.
 */
export function useFicha(campaignInstanceId: string | null): UseFichaResult {
  const [eventos, setEventos] = useState<LocalDiaryEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!campaignInstanceId) {
      setEventos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await getAllEvents(campaignInstanceId);
      setEventos(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [campaignInstanceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ficha = useMemo(() => calcularFicha(toDominioEvents(eventos)), [eventos]);

  return { ficha, eventos, loading, error, refresh };
}
