import { describe, expect, it } from 'vitest';

import { resolve } from '../../src/resolve';
import arcoClosures from '../fixtures/arco-closures.json';
import type { Catalog, Inputs, State } from '../../src/types';

describe('M-06: Pressão → apenas closures elegíveis em Arco', () => {
  it('quando cap.estagio é pressao, seleciona somente storylet closure', () => {
    const state: State = { qualities: { 'cap.atual': 1, 'cap.estagio': 'pressao' } };
    const inputs: Inputs = {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };

    const result = resolve(arcoClosures as Catalog, state, inputs, 42);

    expect(result.storylet.id).toBe('st_arco_closure_1');
  });
});
