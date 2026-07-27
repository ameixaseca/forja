import { applyRecognition } from './recognition';
import { SeededRNG } from './rng';
import { applySafetyNet } from './safety-net';
import { evaluatePredicate } from './selector/predicate';
import { selectBand } from './selector/bands';
import { drawFromBag } from './selector/bag';
import { selectOne } from './selector/exclusion';
import type { Catalog, ResolutionResult, State, Storylet, Variant, Inputs } from './types';

export function resolve(
  catalog: Catalog,
  state: State,
  inputs: Inputs,
  seed: number,
  killSwitch: string[] = [],
): ResolutionResult {
  const rng = new SeededRNG(seed);

  const { band, pool } = selectBand(catalog.storylets, state, inputs, killSwitch);

  if (pool.length === 0) {
    return applySafetyNet(catalog, state);
  }

  let finalPool = pool;
  if (inputs.reencontro) {
    const ausencia = finalPool.filter((storylet) => storylet.subclasse === 'ausencia');
    if (ausencia.length > 0) {
      finalPool = ausencia;
    }
  }

  if (finalPool.length === 0) {
    return applySafetyNet(catalog, state);
  }

  let selected: Storylet;
  let stateAfterDraw: State;

  if (band === 'Cor') {
    const draw = drawFromBag(finalPool, state, rng);
    selected = draw.selected;
    stateAfterDraw = draw.state;
  } else {
    selected = selectOne(finalPool, rng);
    stateAfterDraw = state;
  }

  const variant = selectVariant(selected.variantes, state, rng);
  const newState = applyEffects(stateAfterDraw, variant.efeitos, selected.id);

  return {
    storylet: selected,
    variant,
    texto: variant.texto,
    efeitos: variant.efeitos,
    newState,
  };
}

function selectVariant(variants: Variant[], state: State, rng: SeededRNG): Variant {
  const eligible = variants.filter((variant) => evaluatePredicate(variant.quando, state));

  if (eligible.length > 0) {
    return rng.choice(eligible);
  }

  const fallback = variants.find((variant) => !variant.quando);
  if (!fallback) {
    throw new Error('No eligible variant and no fallback variant without `quando`');
  }
  return fallback;
}

function applyEffects(
  state: State,
  effects: Record<string, number | boolean>,
  storyletId: string,
): State {
  return applyRecognition({ qualities: { ...state.qualities, ...effects } }, storyletId);
}
