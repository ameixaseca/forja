import type { DiaryEvent } from '@forja/dominio';
import type { LocalDiaryEventRow } from './schema';

/**
 * Mapeia uma linha de storage local (superset com metadados de transporte)
 * para o `DiaryEvent` de domínio consumido por `calcularFicha` — que só
 * conhece `{ id, tipo, ocorridoEm, payload }` (ver design.md, decisão D2).
 */
export function toDominioEvent(row: LocalDiaryEventRow): DiaryEvent {
  return {
    id: row.idLocal,
    tipo: row.tipo,
    ocorridoEm: row.ocorridoEm,
    payload: row.payload,
  };
}

export function toDominioEvents(rows: LocalDiaryEventRow[]): DiaryEvent[] {
  return rows.map(toDominioEvent);
}
