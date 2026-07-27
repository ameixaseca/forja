import type { SeededRNG } from '../rng';
import type { State, Storylet } from '../types';

/**
 * Bolsa de Cor (ESPEC v2.6 §6.1 passo 5-6, §3.1): sorteio sem reposição — cada
 * storylet sai da bolsa ao ser sorteado. Ao esgotar, repõe a bolsa excluindo os
 * K storylets mais recentemente vistos; esses são reinseridos apenas na
 * reposição seguinte (não na reposição imediata).
 *
 * K = min(K_alvo, K_teto), K_alvo = 3 × resoluções de Cor por capítulo,
 * K_teto = floor(0.4 × |pool elegível efetivo|).
 */
const K_ALVO_MULTIPLICADOR = 3;
// TODO(Fase 3/4): ritmo real por modalidade em vez de placeholder fixo.
const RESOLUCOES_COR_POR_CAPITULO_PLACEHOLDER = 6;
const K_TETO_FRACAO = 0.4;

export function calculateK(poolSize: number): number {
  const kAlvo = K_ALVO_MULTIPLICADOR * RESOLUCOES_COR_POR_CAPITULO_PLACEHOLDER;
  const kTeto = Math.floor(K_TETO_FRACAO * poolSize);
  return Math.min(kAlvo, kTeto);
}

export function drawFromBag(
  pool: Storylet[],
  state: State,
  rng: SeededRNG,
): { selected: Storylet; state: State } {
  const geracao = Number(state.qualities['sys.cor.geracao']) || 1;

  const available = pool.filter((storylet) => {
    const drawnGen = Number(state.qualities[`sys.cor.geracao.${storylet.id}`]) || 0;
    const excludedGen = Number(state.qualities[`sys.cor.excluido_geracao.${storylet.id}`]) || 0;
    return drawnGen !== geracao && excludedGen !== geracao;
  });

  if (available.length === 0) {
    return drawFromBag(pool, refill(pool, state, geracao), rng);
  }

  const selected = rng.choice(available);
  const ordem = (Number(state.qualities['sys.cor.ordem_global']) || 0) + 1;

  return {
    selected,
    state: {
      qualities: {
        ...state.qualities,
        [`sys.cor.geracao.${selected.id}`]: geracao,
        [`sys.cor.ordem.${selected.id}`]: ordem,
        'sys.cor.ordem_global': ordem,
      },
    },
  };
}

function refill(pool: Storylet[], state: State, geracaoAtual: number): State {
  const novaGeracao = geracaoAtual + 1;
  const k = calculateK(pool.length);

  const maisRecentes = [...pool]
    .sort(
      (a, b) =>
        (Number(state.qualities[`sys.cor.ordem.${b.id}`]) || 0) -
        (Number(state.qualities[`sys.cor.ordem.${a.id}`]) || 0),
    )
    .slice(0, k);

  const qualities: State['qualities'] = { ...state.qualities, 'sys.cor.geracao': novaGeracao };
  for (const storylet of maisRecentes) {
    qualities[`sys.cor.excluido_geracao.${storylet.id}`] = novaGeracao;
  }

  return { qualities };
}
