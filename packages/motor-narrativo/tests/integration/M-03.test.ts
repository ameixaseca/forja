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

describe('M-03: Kill-switch nunca desativa Espinha nem st_cor_fallback', () => {
  it('Espinha é selecionada mesmo com seu ID no kill-switch', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_espinha_abertura_cap1',
          banda: 'Espinha',
          subclasse: null,
          capitulo: 1,
          variantes: [{ texto: 'texto.espinha', efeitos: {} }],
        },
      ],
    };
    const state: State = { qualities: { 'cap.atual': 1 } };

    const result = resolve(catalog, state, baseInputs, 42, ['st_espinha_abertura_cap1']);

    expect(result.storylet.id).toBe('st_espinha_abertura_cap1');
  });

  it('st_cor_fallback é selecionado mesmo com seu ID no kill-switch', () => {
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

    const result = resolve(catalog, state, baseInputs, 42, ['st_cor_fallback']);

    expect(result.storylet.id).toBe('st_cor_fallback');
  });
});
