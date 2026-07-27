/**
 * Vontade — RN-005, PRD §4.4
 * Único atributo que modifica rolagem (2d6 + Vontade), teto +3.
 * Pure TS, no deps (D-033)
 */

/**
 * PRD §4.4: +1 aos 2 ciclos cumpridos, +2 aos 6, +3 aos 14.
 * Ciclo quebrado nunca reduz (RN-003); ciclo de Trégua não conta —
 * o chamador deve passar apenas a contagem de ciclos com Juramento
 * cumprido (isCicloCumprido), nunca o total de ciclos decorridos.
 *
 * @param ciclosCumpridos Quantidade de ciclos com Juramento cumprido
 * @returns Modificador de Vontade (0..3)
 */
export function calcularVontade(ciclosCumpridos: number): number {
  if (ciclosCumpridos >= 14) return 3;
  if (ciclosCumpridos >= 6) return 2;
  if (ciclosCumpridos >= 2) return 1;
  return 0;
}
