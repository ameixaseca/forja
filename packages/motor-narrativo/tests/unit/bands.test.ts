import { describe, expect, it } from 'vitest';

import { selectBand } from '../../src/selector/bands';
import type { Inputs, State, Storylet } from '../../src/types';

const baseInputs: Inputs = {
  rolagem: 8,
  atributo: { forca: 1, vigor: 1, destreza: 1 },
  vontade: 1,
  ciclo_cumprido: true,
  tregua: false,
  reencontro: false,
  sessao_secundaria: false,
};

function storylet(overrides: Partial<Storylet> = {}): Storylet {
  return {
    id: 'st_generic',
    banda: 'Cor',
    subclasse: null,
    variantes: [{ texto: 'texto.generic', efeitos: {} }],
    ...overrides,
  };
}

function state(qualities: State['qualities'] = {}): State {
  return { qualities: { 'cap.atual': 1, ...qualities } };
}

describe('selectBand', () => {
  it('M-01: retorna apenas Cor quando inputs.tregua é true, mesmo com Espinha elegível', () => {
    const catalog = [
      storylet({ id: 'st_espinha_1', banda: 'Espinha', capitulo: 1 }),
      storylet({ id: 'st_cor_1', banda: 'Cor' }),
    ];

    const result = selectBand(catalog, state(), { ...baseInputs, tregua: true }, []);

    expect(result.band).toBe('Cor');
    expect(result.pool.map((s) => s.id)).toEqual(['st_cor_1']);
  });

  it('M-08: retorna apenas Cor quando inputs.sessao_secundaria é true', () => {
    const catalog = [
      storylet({ id: 'st_espinha_1', banda: 'Espinha', capitulo: 1 }),
      storylet({ id: 'st_cor_1', banda: 'Cor' }),
    ];

    const result = selectBand(catalog, state(), { ...baseInputs, sessao_secundaria: true }, []);

    expect(result.band).toBe('Cor');
  });

  it('prioriza Espinha quando elegível e sem trégua/sessão secundária', () => {
    const catalog = [
      storylet({ id: 'st_espinha_1', banda: 'Espinha', capitulo: 1 }),
      storylet({ id: 'st_arco_1', banda: 'Arco' }),
      storylet({ id: 'st_cor_1', banda: 'Cor' }),
    ];

    const result = selectBand(catalog, state(), baseInputs, []);

    expect(result.band).toBe('Espinha');
  });

  it('cai para Arco quando Espinha vazia', () => {
    const catalog = [storylet({ id: 'st_arco_1', banda: 'Arco' }), storylet({ id: 'st_cor_1', banda: 'Cor' })];

    const result = selectBand(catalog, state(), baseInputs, []);

    expect(result.band).toBe('Arco');
  });

  it('cai para Cor quando Espinha e Arco vazios', () => {
    const catalog = [storylet({ id: 'st_cor_1', banda: 'Cor' })];

    const result = selectBand(catalog, state(), baseInputs, []);

    expect(result.band).toBe('Cor');
  });

  it('M-06: em Arco com cap.estagio = pressao, filtra apenas closures', () => {
    const catalog = [
      storylet({ id: 'st_arco_complicacao_1', banda: 'Arco' }),
      storylet({ id: 'st_arco_closure_1', banda: 'Arco' }),
    ];

    const result = selectBand(catalog, state({ 'cap.estagio': 'pressao' }), baseInputs, []);

    expect(result.band).toBe('Arco');
    expect(result.pool.map((s) => s.id)).toEqual(['st_arco_closure_1']);
  });
});
