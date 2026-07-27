/**
 * Juramento — RF-004, RF-005
 * Pure TS, no deps (D-033)
 */

export interface Juramento {
  diasPorSemana: number; // 1-6 (RF-004)
  dataInicio: Date;
  dataFim: Date;
}

/**
 * RF-004: Juramento aceita entre 1 e 6 dias por semana.
 * @param diasPorSemana Valor declarado pelo usuário
 * @returns True se dentro do intervalo aceito
 */
export function validarJuramento(diasPorSemana: number): boolean {
  return Number.isInteger(diasPorSemana) && diasPorSemana >= 1 && diasPorSemana <= 6;
}
