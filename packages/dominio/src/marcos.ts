/**
 * Marcos — RF-042, RF-043, RF-049, DI-008
 * Pure TS, no deps (D-033)
 */

/** Rótulo de Marco → ciclo em que o cooldown termina (DI-008). */
export type CooldownMarcos = Record<string, number>;

const COOLDOWN_CICLOS = 2; // RF-043
const TETO_MARCOS_POR_CICLO = 2; // RF-042
const MARCOS_POR_PONTO = 3; // RF-049
const TETO_ATRIBUTO = 5; // RF-049

/**
 * RF-043/DI-008: cooldown de 2 ciclos por rótulo, iniciado na declaração
 * (não na contabilização nem no encerramento do ciclo).
 *
 * @param rotulo Rótulo livre do Marco (RF-045)
 * @param cicloAtual Ciclo em que a declaração seria feita
 * @param cooldown Mapa de cooldowns vigentes por rótulo
 * @returns True se o rótulo está livre para novo Marco
 */
export function podeDeclararMarco(rotulo: string, cicloAtual: number, cooldown: CooldownMarcos): boolean {
  const fimCooldown = cooldown[rotulo];
  if (fimCooldown === undefined) return true;
  return cicloAtual > fimCooldown;
}

/**
 * DI-008: cooldown inicia imediatamente após a declaração, independente
 * do Marco ser contabilizado (RF-044) ou o ciclo estar cumprido.
 *
 * @param rotulo Rótulo declarado
 * @param cicloAtual Ciclo da declaração
 * @param cooldown Mapa de cooldowns vigentes por rótulo
 * @returns Novo mapa com o rótulo bloqueado até `cicloAtual + 2`
 */
export function aplicarCooldown(rotulo: string, cicloAtual: number, cooldown: CooldownMarcos): CooldownMarcos {
  return {
    ...cooldown,
    [rotulo]: cicloAtual + COOLDOWN_CICLOS,
  };
}

/**
 * RF-042: no máximo 2 Marcos contabilizados por ciclo — o excedente é
 * registrado (RF-044) mas não entra na conversão em pontos de atributo.
 *
 * @param marcosDeclaradosNoCiclo Total de Marcos declarados no ciclo
 * @returns Marcos efetivamente contabilizados (0..2)
 */
export function limitarMarcosContabilizados(marcosDeclaradosNoCiclo: number): number {
  return Math.min(marcosDeclaradosNoCiclo, TETO_MARCOS_POR_CICLO);
}

/**
 * RF-049: 3 Marcos contabilizados no mesmo atributo convertem em +1 ponto,
 * com teto de 5 no atributo.
 *
 * @param marcosContabilizadosNoAtributo Total histórico de Marcos contabilizados nesse atributo
 * @param atributoAtual Valor atual do atributo, antes da conversão
 * @returns Novo valor do atributo (nunca acima do teto)
 */
export function calcularPontosAtributo(marcosContabilizadosNoAtributo: number, atributoAtual: number): number {
  const pontosGanhos = Math.floor(marcosContabilizadosNoAtributo / MARCOS_POR_PONTO);
  return Math.min(atributoAtual + pontosGanhos, TETO_ATRIBUTO);
}
