import { describe, expect, it } from 'vitest';

import { SeededRNG } from '../../src/rng';
import { selectOne } from '../../src/selector/exclusion';
import type { Storylet } from '../../src/types';

const storylet = (id: string): Storylet => ({
  id,
  banda: 'Cor',
  subclasse: null,
  variantes: [{ texto: `texto.${id}`, efeitos: {} }],
});

describe('selectOne', () => {
  it('selects the same storylet from independent RNGs with the same seed', () => {
    const pool = Array.from({ length: 4 }, (_, index) => storylet(`st_cor_${index}`));

    const first = selectOne(pool, new SeededRNG(42));
    const second = selectOne(pool, new SeededRNG(42));

    expect(first).toBe(second);
  });
});
