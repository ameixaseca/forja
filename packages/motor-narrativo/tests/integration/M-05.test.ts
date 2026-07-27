import { describe, expect, it } from 'vitest';

import { resolve } from '../../src/resolve';
import espinhaOnly from '../fixtures/espinha-only.json';
import type { Catalog, Inputs, State } from '../../src/types';

describe('M-05: Determinismo — mesma seed produz mesma sequência', () => {
  it('duas execuções com seed 42 produzem resultado idêntico', () => {
    const state: State = { qualities: { 'cap.atual': 1 } };
    const inputs: Inputs = {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };

    const first = resolve(espinhaOnly as Catalog, state, inputs, 42);
    const second = resolve(espinhaOnly as Catalog, state, inputs, 42);

    expect(second).toEqual(first);
  });
});
