/**
 * Domínio — Regras de negócio (RN-001 a RN-039)
 * Implementa: Juramento, Ciclo, Fôlego, Superação, Modalidades
 * Pure TS, no deps (D-033)
 */

export interface Juramento {
  diasPorSemana: number; // 1-6 (RF-004)
  dataInicio: Date;
  dataFim: Date;
}

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

  return ciclo.diasTreinados >= ciclo.diasJurados;
}

/**
 * D-044: Fôlego tem teto de 2 por ciclo, acúmulo máximo de 4
 * PRD §4.5: "Dia sem treino em ciclo cumprido gera Fôlego"
 * Ciclo cumprido = diasTreinados >= diasJurados
 * Dias sem treino = 7 - diasTreinados (semana tem 7 dias)
 *
 * @param ciclo Ciclo encerrado
 * @returns Fôlego gerado (0, 1 ou 2)
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

// ... outras funções (implementar em Fase 3)
