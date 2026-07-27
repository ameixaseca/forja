import { describe, expect, it } from 'vitest';

import { resolve } from '../../src/resolve';
import type { Catalog, Inputs, State, Storylet } from '../../src/types';

const baseInputs: Inputs = {
  rolagem: 8,
  atributo: { forca: 1, vigor: 1, destreza: 1 },
  vontade: 1,
  ciclo_cumprido: true,
  tregua: false,
  reencontro: false,
  sessao_secundaria: false,
};

function buildCatalog(count: number): Catalog {
  const storylets: Storylet[] = Array.from({ length: count }, (_, index) => ({
    id: `st_cor_${index}`,
    banda: 'Cor',
    subclasse: null,
    capitulo: null,
    variantes: [{ texto: `texto.cor.${index}`, efeitos: {} }],
  }));
  return { storylets };
}

describe('M-09: Fila K aplicada sobre pool elegível, não sobre total da banda', () => {
  it('esgota a bolsa de 10 storylets sem repetição e, na reposição, exclui os K=4 mais recentes', () => {
    const catalog = buildCatalog(10);
    let state: State = { qualities: { 'cap.atual': 1 } };
    const drawn: string[] = [];

    for (let i = 0; i < 10; i += 1) {
      const result = resolve(catalog, state, baseInputs, i);
      drawn.push(result.storylet.id);
      state = result.newState;
    }

    // Todos os 10 saíram exatamente uma vez (sorteio sem reposição)
    expect(new Set(drawn).size).toBe(10);

    // 11ª resolução: bolsa esgotada, repõe excluindo os últimos K=4 vistos
    const lastFour = new Set(drawn.slice(-4));
    const result = resolve(catalog, state, baseInputs, 999);

    expect(lastFour.has(result.storylet.id)).toBe(false);
  });
});
