import { describe, it, expect } from 'vitest';
import { calcularVontade } from '../src/index';

describe('calcularVontade', () => {
  it.each([
    [0, 0],
    [1, 0],
    [2, 1],
    [5, 1],
    [6, 2],
    [13, 2],
    [14, 3],
    [20, 3],
  ])('PRD §4.4: %i ciclos cumpridos resulta em Vontade %i', (ciclosCumpridos, vontade) => {
    expect(calcularVontade(ciclosCumpridos)).toBe(vontade);
  });

  it('RN-005: Vontade nunca ultrapassa o teto de 3', () => {
    expect(calcularVontade(1000)).toBe(3);
  });
});
