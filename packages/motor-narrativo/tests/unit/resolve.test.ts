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

describe('resolve — seleção de variante', () => {
  it('seleciona variante cujo `quando` é satisfeito pelo estado', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_cor_variantes',
          banda: 'Cor',
          subclasse: null,
          capitulo: null,
          variantes: [
            { quando: { qual: 'flag', op: '==', valor: true }, texto: 'texto.a', efeitos: {} },
            { texto: 'texto.fallback', efeitos: {} },
          ],
        },
      ],
    };
    const state: State = { qualities: { 'cap.atual': 1, flag: true } };

    const result = resolve(catalog, state, baseInputs, 42);

    expect(result.texto).toBe('texto.a');
  });

  it('usa variante fallback (sem `quando`) quando nenhuma condicional é satisfeita', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_cor_variantes',
          banda: 'Cor',
          subclasse: null,
          capitulo: null,
          variantes: [
            { quando: { qual: 'flag', op: '==', valor: true }, texto: 'texto.a', efeitos: {} },
            { texto: 'texto.fallback', efeitos: {} },
          ],
        },
      ],
    };
    const state: State = { qualities: { 'cap.atual': 1, flag: false } };

    const result = resolve(catalog, state, baseInputs, 42);

    expect(result.texto).toBe('texto.fallback');
  });
});

describe('resolve — variante inválida', () => {
  it('lança erro quando nenhuma variante é elegível e não há variante fallback sem `quando`', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_cor_sem_fallback',
          banda: 'Cor',
          subclasse: null,
          capitulo: null,
          variantes: [
            { quando: { qual: 'flag', op: '==', valor: true }, texto: 'texto.a', efeitos: {} },
          ],
        },
      ],
    };
    const state: State = { qualities: { 'cap.atual': 1, flag: false } };

    expect(() => resolve(catalog, state, baseInputs, 42)).toThrow(
      'No eligible variant and no fallback variant without `quando`',
    );
  });
});

describe('resolve — aplicação de efeitos e reconhecimento', () => {
  it('incrementa sys.visto, sys.resolucoes e cap.resolucoes no newState', () => {
    const catalog: Catalog = {
      storylets: [
        {
          id: 'st_cor_efeitos',
          banda: 'Cor',
          subclasse: null,
          capitulo: null,
          variantes: [{ texto: 'texto.efeitos', efeitos: { humor: 5 } }],
        },
      ],
    };
    const state: State = { qualities: { 'cap.atual': 1 } };

    const result = resolve(catalog, state, baseInputs, 42);

    expect(result.newState.qualities).toMatchObject({
      humor: 5,
      'sys.visto.st_cor_efeitos': 1,
      'sys.resolucoes': 1,
      'cap.resolucoes': 1,
    });
  });
});
