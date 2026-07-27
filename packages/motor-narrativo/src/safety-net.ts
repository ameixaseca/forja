import { applyRecognition } from './recognition';
import type { Catalog, ResolutionResult, State } from './types';

export function applySafetyNet(catalog: Catalog, state: State): ResolutionResult {
  const fallback = catalog.storylets.find((storylet) => storylet.id === 'st_cor_fallback');

  if (!fallback) {
    throw new Error('st_cor_fallback not found in catalog (required by M-04)');
  }

  const variant = fallback.variantes[0];
  const newState = applyRecognition(state, fallback.id);

  return {
    storylet: fallback,
    variant,
    texto: variant.texto,
    efeitos: variant.efeitos,
    newState,
  };
}
