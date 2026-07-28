import type { State } from '@forja/motor-narrativo';
import type { LocalDiaryEventRow } from '../storage/schema';

/**
 * Reconstrói o `State.qualities` do motor narrativo a partir do log local —
 * mesmo princípio de `calcularFicha` (ADR-0002): nunca guardado como estado
 * mutável à parte, sempre projetado do log. `resolve()` devolve `newState`
 * já cumulativo (spread do state anterior + efeitos novos, ver
 * `packages/motor-narrativo/src/resolve.ts:80`), então o snapshot mais
 * recente já contém tudo — não é preciso ir refazendo o fold efeito a
 * efeito, só ler o último `sessao_registrada` gravado.
 */
export function buildNarrativeState(eventos: LocalDiaryEventRow[]): State {
  for (let i = eventos.length - 1; i >= 0; i -= 1) {
    const evento = eventos[i];
    if (evento.tipo === 'sessao_registrada') {
      const qualities = evento.payload.qualities;
      if (qualities && typeof qualities === 'object') {
        return { qualities: qualities as State['qualities'] };
      }
    }
  }
  return { qualities: {} };
}
