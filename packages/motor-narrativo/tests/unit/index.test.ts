import { describe, expect, it } from 'vitest';

import { resolve, simulate } from '../../src/index';
import type { Catalog, Inputs, State } from '../../src/index';

describe('API pública (src/index.ts)', () => {
  it('exporta resolve() e simulate() funcionais', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_cor_fallback',
          banda: 'Cor',
          subclasse: null,
          capitulo: null,
          variantes: [{ texto: 'texto.fallback', efeitos: {} }],
        },
      ],
    };
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

    expect(resolve(catalog, state, inputs, 1).storylet.id).toBe('st_cor_fallback');
    expect(simulate(catalog, 1, 5, 'constante').resolutions).toHaveLength(5);
  });
});
