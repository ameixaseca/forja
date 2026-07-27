import { describe, expect, it } from 'vitest';

import { calculateK, drawFromBag } from '../../src/selector/bag';
import { SeededRNG } from '../../src/rng';
import type { State, Storylet } from '../../src/types';

function pool(count: number): Storylet[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `st_cor_${index}`,
    banda: 'Cor',
    subclasse: null,
    capitulo: null,
    variantes: [{ texto: `texto.${index}`, efeitos: {} }],
  }));
}

describe('calculateK', () => {
  it('é min(K_alvo, floor(0.4 * poolSize)) — ESPEC §3.1', () => {
    expect(calculateK(10)).toBe(4); // floor(0.4*10)=4 < K_alvo(18)
    expect(calculateK(3)).toBe(1); // floor(0.4*3)=1
    expect(calculateK(1)).toBe(0); // floor(0.4*1)=0
  });

  it('nunca é maior ou igual ao tamanho do pool (evita bolsa vazia após reposição)', () => {
    for (let size = 1; size <= 200; size += 1) {
      expect(calculateK(size)).toBeLessThan(size);
    }
  });
});

describe('drawFromBag', () => {
  it('sorteia sem reposição: cada storylet sai da bolsa após ser sorteado', () => {
    const items = pool(3);
    let state: State = { qualities: {} };
    const drawn: string[] = [];

    for (let i = 0; i < 3; i += 1) {
      const result = drawFromBag(items, state, new SeededRNG(i));
      drawn.push(result.selected.id);
      state = result.state;
    }

    expect(new Set(drawn).size).toBe(3); // sem repetição dentro da mesma geração
  });

  it('esgotada a bolsa, repõe excluindo os K mais recentemente vistos (ESPEC §3.1)', () => {
    const items = pool(10); // K = calculateK(10) = 4
    let state: State = { qualities: {} };
    const drawOrder: string[] = [];

    // Esgota a bolsa inteira (10 sorteios cobrem os 10 itens)
    for (let i = 0; i < 10; i += 1) {
      const result = drawFromBag(items, state, new SeededRNG(i));
      drawOrder.push(result.selected.id);
      state = result.state;
    }
    expect(new Set(drawOrder)).toEqual(new Set(items.map((s) => s.id)));

    // 11º sorteio: bolsa esgotada, repõe excluindo os últimos 4 vistos
    const lastFour = new Set(drawOrder.slice(-4));
    const result = drawFromBag(items, state, new SeededRNG(999));

    expect(lastFour.has(result.selected.id)).toBe(false);
  });

  it('reinsere os excluídos apenas na reposição seguinte (não na reposição imediata)', () => {
    const items = pool(10);
    let state: State = { qualities: {} };

    for (let i = 0; i < 10; i += 1) {
      const result = drawFromBag(items, state, new SeededRNG(i));
      state = result.state;
    }
    // primeira reposição (geração 2): 6 disponíveis (10 - K=4)
    const secondRoundIds = new Set<string>();
    for (let i = 0; i < 6; i += 1) {
      const result = drawFromBag(items, state, new SeededRNG(100 + i));
      secondRoundIds.add(result.selected.id);
      state = result.state;
    }
    expect(secondRoundIds.size).toBe(6);
  });

  it('é determinístico: mesma sequência de seeds produz mesma sequência de sorteios', () => {
    const items = pool(5);

    function run(): string[] {
      let state: State = { qualities: {} };
      const drawn: string[] = [];
      for (let i = 0; i < 8; i += 1) {
        const result = drawFromBag(items, state, new SeededRNG(i));
        drawn.push(result.selected.id);
        state = result.state;
      }
      return drawn;
    }

    expect(run()).toEqual(run());
  });

  it('não muta o state original (função pura)', () => {
    const items = pool(3);
    const state: State = { qualities: {} };
    const snapshot = { ...state.qualities };

    drawFromBag(items, state, new SeededRNG(1));

    expect(state.qualities).toEqual(snapshot);
  });
});
