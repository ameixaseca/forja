import { describe, expect, it } from 'vitest';

import { resolve } from '../../src/resolve';
import corAusencia from '../fixtures/cor-ausencia.json';
import type { Catalog, Inputs, State } from '../../src/types';

describe('M-02: Reencontro → seleciona subclasse ausencia', () => {
  it('quando inputs.reencontro é true e há storylet ausencia elegível, seleciona ausencia', () => {
    const state: State = { qualities: { 'cap.atual': 1 } };
    const inputs: Inputs = {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: true,
      sessao_secundaria: false,
    };

    const result = resolve(corAusencia as Catalog, state, inputs, 42);

    expect(result.storylet.subclasse).toBe('ausencia');
  });
});
