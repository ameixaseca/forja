import type { Inputs, State, Storylet } from '../types';
import { evaluatePredicate } from './predicate';

export function isEligible(
  storylet: Storylet,
  state: State,
  inputs: Inputs,
  killSwitch: string[],
): boolean {
  const isProtected = storylet.banda === 'Espinha' || storylet.id === 'st_cor_fallback';

  if (!isProtected && killSwitch.includes(storylet.id)) {
    return false;
  }

  const currentChapter = state.qualities['cap.atual'];
  if (storylet.capitulo != null && storylet.capitulo !== currentChapter) {
    return false;
  }

  if (!evaluatePredicate(storylet.requer, state)) {
    return false;
  }

  // Cor não é excluída aqui por já ter sido vista: sua repetição é controlada
  // pela bolsa (selector/bag.ts, ESPEC §6.1 passo 5-6), que faz sorteio sem
  // reposição com reposição periódica — não exclusão permanente.
  if (storylet.banda !== 'Cor') {
    const seen = state.qualities[`sys.visto.${storylet.id}`];
    if (!isProtected && typeof seen === 'number' && seen > 0) {
      return false;
    }
  }

  return true;
}

export function filterEligible(
  storylets: Storylet[],
  state: State,
  inputs: Inputs,
  killSwitch: string[],
): Storylet[] {
  return storylets.filter((storylet) => isEligible(storylet, state, inputs, killSwitch));
}
