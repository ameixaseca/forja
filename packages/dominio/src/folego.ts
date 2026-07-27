/**
 * Fôlego — D-044, RF-080, RF-082, RF-084
 * Pure TS, no deps (D-033)
 */
import type { Ciclo } from './ciclo';
import { isCicloCumprido } from './ciclo';

/**
 * D-044: Fôlego tem teto de 2 por ciclo, acúmulo máximo de 4
 * PRD §4.5: "Dia sem treino em ciclo cumprido gera Fôlego"
 * Ciclo cumprido = diasTreinados >= diasJurados
 * Dias sem treino = 7 - diasTreinados (semana tem 7 dias)
 *
 * @param ciclo Ciclo encerrado
 * @returns Fôlego gerado (0, 1 ou 2; até 4 em deload)
 */
export function calcularFolego(ciclo: Ciclo): number {
  // Ciclo não cumprido, Trégua ou Recuperação não gera Fôlego (RN-006, RF-080)
  if (!isCicloCumprido(ciclo) || ciclo.tregua || ciclo.treguaRecuperacao) {
    return 0;
  }

  // Dias sem treino no ciclo (semana = 7 dias)
  const diasDescanso = 7 - ciclo.diasTreinados;

  // Deload dobra o teto (D-044, RF-082)
  const teto = ciclo.deload ? 4 : 2;

  // Mínimo entre dias descanso e teto
  return Math.min(diasDescanso, teto);
}
