import type { Predicate, State } from '../types';

export function evaluatePredicate(pred: Predicate | undefined, state: State): boolean {
  if (!pred) return true;

  const value = state.qualities[pred.qual];
  let result: boolean;

  switch (pred.op) {
    case '==':
      result = value === pred.valor;
      break;
    case '!=':
      result = value !== pred.valor;
      break;
    case '>':
      result = Number(value) > Number(pred.valor);
      break;
    case '<':
      result = Number(value) < Number(pred.valor);
      break;
    case '>=':
      result = Number(value) >= Number(pred.valor);
      break;
    case '<=':
      result = Number(value) <= Number(pred.valor);
      break;
  }

  if (pred.e) {
    result = result && evaluatePredicate(pred.e, state);
  }

  if (pred.ou) {
    result = result || evaluatePredicate(pred.ou, state);
  }

  return result;
}
