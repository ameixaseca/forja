import { describe, expect, it } from 'vitest';

import { filterEligible, isEligible } from '../../src/selector/eligibility';
import type { Inputs, State, Storylet } from '../../src/types';

const inputs: Inputs = {
  rolagem: 8,
  atributo: { forca: 1, vigor: 1, destreza: 1 },
  vontade: 1,
  ciclo_cumprido: true,
  tregua: false,
  reencontro: false,
  sessao_secundaria: false,
};

function createStorylet(overrides: Partial<Storylet> = {}): Storylet {
  return {
    id: 'st_cor_comum',
    banda: 'Cor',
    subclasse: null,
    capitulo: 1,
    variantes: [{ texto: 'texto.cor.comum', efeitos: {} }],
    ...overrides,
  };
}

function createState(qualities: State['qualities'] = {}): State {
  return { qualities: { 'cap.atual': 1, requisito: true, ...qualities } };
}

describe('isEligible', () => {
  it.each([
    createStorylet({ id: 'st_espinha', banda: 'Espinha' }),
    createStorylet({ id: 'st_cor_fallback' }),
  ])('mantém $id elegível mesmo quando kill-switch contém seu ID', (storylet) => {
    const result = isEligible(storylet, createState(), inputs, [storylet.id]);

    expect(result).toBe(true);
  });

  it('exclui storylet comum quando kill-switch contém seu ID', () => {
    const storylet = createStorylet();

    const result = isEligible(storylet, createState(), inputs, [storylet.id]);

    expect(result).toBe(false);
  });

  it('exclui storylet de capítulo diferente do capítulo atual', () => {
    const storylet = createStorylet({ capitulo: 2 });

    const result = isEligible(storylet, createState(), inputs, []);

    expect(result).toBe(false);
  });

  it('exclui storylet cujo predicado requer não é satisfeito', () => {
    const storylet = createStorylet({
      requer: { qual: 'requisito', op: '==', valor: true },
    });

    const result = isEligible(storylet, createState({ requisito: false }), inputs, []);

    expect(result).toBe(false);
  });

  it('exclui storylet de Arco/Espinha já visto', () => {
    const storylet = createStorylet({ banda: 'Arco', capitulo: undefined });
    const state = createState({ [`sys.visto.${storylet.id}`]: 1 });

    const result = isEligible(storylet, state, inputs, []);

    expect(result).toBe(false);
  });

  it('mantém storylet de Cor elegível mesmo já visto — repetição é controlada pela bolsa', () => {
    const storylet = createStorylet({ banda: 'Cor', capitulo: undefined });
    const state = createState({ [`sys.visto.${storylet.id}`]: 1 });

    const result = isEligible(storylet, state, inputs, []);

    expect(result).toBe(true);
  });

  it.each([
    createStorylet({ id: 'st_espinha', banda: 'Espinha' }),
    createStorylet({ id: 'st_cor_fallback' }),
  ])('mantém $id elegível mesmo quando já visto', (storylet) => {
    const state = createState({ [`sys.visto.${storylet.id}`]: 1 });

    const result = isEligible(storylet, state, inputs, []);

    expect(result).toBe(true);
  });

  it('mantém storylet elegível quando todas as condições passam', () => {
    const storylet = createStorylet({
      requer: { qual: 'requisito', op: '==', valor: true },
    });

    const result = isEligible(storylet, createState(), inputs, []);

    expect(result).toBe(true);
  });
});

describe('filterEligible', () => {
  it('retorna somente storylets que passam por todas as condições', () => {
    const eligible = createStorylet({ id: 'st_cor_elegivel' });
    const disabled = createStorylet({ id: 'st_cor_desativado' });
    const wrongChapter = createStorylet({ id: 'st_cor_capitulo_2', capitulo: 2 });

    const result = filterEligible(
      [eligible, disabled, wrongChapter],
      createState(),
      inputs,
      [disabled.id],
    );

    expect(result).toEqual([eligible]);
  });
});
