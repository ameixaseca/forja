import { describe, expect, it } from 'vitest';

import { resolve } from '../../src/resolve';
import type { Catalog, Inputs, State } from '../../src/types';

const baseInputs: Inputs = {
  rolagem: 8,
  atributo: { forca: 1, vigor: 1, destreza: 1 },
  vontade: 1,
  ciclo_cumprido: true,
  tregua: false,
  reencontro: false,
  sessao_secundaria: false,
};

describe('M-04: Safety-net → st_cor_fallback quando pool vazio', () => {
  it('retorna st_cor_fallback quando nenhum storylet elegível', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_cor_fallback',
          banda: 'Cor',
          subclasse: null,
          capitulo: null,
          variantes: [{ texto: 'texto.cor.fallback', efeitos: {} }],
        },
      ],
    };
    const state: State = { qualities: { 'cap.atual': 1 } };

    const result = resolve(catalog, state, baseInputs, 42);

    expect(result.storylet.id).toBe('st_cor_fallback');
  });

  it('lança erro se st_cor_fallback não existe no catálogo e pool está vazio', () => {
    const catalog: Catalog = { storylets: [] };
    const state: State = { qualities: { 'cap.atual': 1 } };

    expect(() => resolve(catalog, state, baseInputs, 42)).toThrow(
      'st_cor_fallback not found in catalog',
    );
  });
});
