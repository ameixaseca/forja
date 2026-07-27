import type { SeededRNG } from '../rng';
import type { Storylet } from '../types';

/**
 * Tie-breaker (DI-007): sorteio seeded entre elegíveis.
 * Usado por Espinha/Arco, que não têm mecânica de bolsa (ver selector/bag.ts para Cor).
 */
export function selectOne(pool: Storylet[], rng: SeededRNG): Storylet {
  return rng.choice(pool);
}
