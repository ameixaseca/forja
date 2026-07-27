/**
 * Ciclo — RN-001, RN-002, RN-038, RF-007A
 * Pure TS, no deps (D-033)
 */
import type { Juramento } from './juramento';

export interface Ciclo {
  numero: number;
  juramento: Juramento;
  diasTreinados: number;
  diasJurados: number;
  cumprido: boolean;
  tregua: boolean;
  treguaRecuperacao: boolean;
  deload: boolean;
}

/**
 * RN-001: Progressão de campanha é função exclusiva de dias_treinados / dias_jurados
 * @param ciclo Ciclo a avaliar
 * @returns Razão entre dias treinados e jurados (0..1)
 */
export function calcularProgressao(ciclo: Ciclo): number {
  if (ciclo.diasJurados === 0) return 0;
  return ciclo.diasTreinados / ciclo.diasJurados;
}

/**
 * RN-002: Juramento cumprido avança o arco
 * @param ciclo Ciclo a avaliar
 * @returns True se ciclo foi cumprido (dias_treinados >= dias_jurados)
 */
export function isCicloCumprido(ciclo: Ciclo): boolean {
  // Trégua e Trégua Recuperação não contam como cumprido (RN-038)
  if (ciclo.tregua || ciclo.treguaRecuperacao) return false;

  // Sem Juramento declarado não há o que cumprir (RN-001: progressão é função
  // exclusiva de treinados/jurados — 0/0 não é avanço, é ausência de dado).
  if (ciclo.diasJurados === 0) return false;

  return ciclo.diasTreinados >= ciclo.diasJurados;
}
