import { describe, expect, it } from 'vitest';

import { resolve } from '../../src/resolve';
import minimalCatalog from '../fixtures/minimal-catalog.json';
import type { Catalog, Inputs, State } from '../../src/types';

describe('M-08: Sessão secundária → apenas banda Cor', () => {
  it('retorna storylet da banda Cor quando inputs.sessao_secundaria é true', () => {
    const state: State = { qualities: { 'cap.atual': 1 } };
    const inputs: Inputs = {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: false,
      tregua: false,
      reencontro: false,
      sessao_secundaria: true,
    };

    const result = resolve(minimalCatalog as Catalog, state, inputs, 42);

    expect(result.storylet.banda).toBe('Cor');
  });
});
