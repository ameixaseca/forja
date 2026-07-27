import { describe, it, expect } from 'vitest';
import { calcularFolego, calcularProgressao, isCicloCumprido, type Ciclo } from '../src/index';

function makeCiclo(overrides: Partial<Ciclo> = {}): Ciclo {
  return {
    numero: 1,
    juramento: {
      diasPorSemana: 3,
      dataInicio: new Date('2026-01-06'),
      dataFim: new Date('2026-01-12'),
    },
    diasTreinados: 3,
    diasJurados: 3,
    cumprido: true,
    tregua: false,
    treguaRecuperacao: false,
    deload: false,
    ...overrides,
  };
}

describe('calcularProgressao', () => {
  it('RN-001: calcula a razão entre dias treinados e jurados', () => {
    expect(calcularProgressao(makeCiclo({ diasTreinados: 2, diasJurados: 3 }))).toBeCloseTo(0.667, 2);
  });

  it('RN-001: retorna zero quando não há dias jurados', () => {
    expect(calcularProgressao(makeCiclo({ diasTreinados: 0, diasJurados: 0 }))).toBe(0);
  });
});

describe('isCicloCumprido', () => {
  it('RN-002: considera cumprido o ciclo no limite do juramento', () => {
    expect(isCicloCumprido(makeCiclo({ diasTreinados: 3, diasJurados: 3 }))).toBe(true);
  });

  it('RN-002: considera cumprido o ciclo acima do juramento', () => {
    expect(isCicloCumprido(makeCiclo({ diasTreinados: 6, diasJurados: 3 }))).toBe(true);
  });

  it('RN-002: considera quebrado ciclo abaixo do juramento sem Trégua', () => {
    expect(isCicloCumprido(makeCiclo({ diasTreinados: 2, diasJurados: 3 }))).toBe(false);
  });

  it('RN-001: sem Juramento declarado (0 dias jurados) nunca é cumprido, mesmo com 0 treinados', () => {
    expect(isCicloCumprido(makeCiclo({ diasTreinados: 0, diasJurados: 0 }))).toBe(false);
  });

  it('RN-038: Trégua não classifica ciclo como cumprido', () => {
    expect(isCicloCumprido(makeCiclo({ diasTreinados: 3, tregua: true }))).toBe(false);
  });

  it('RF-007A: Trégua de Recuperação não classifica ciclo como cumprido', () => {
    expect(isCicloCumprido(makeCiclo({ diasTreinados: 3, treguaRecuperacao: true }))).toBe(false);
  });
});

describe('calcularFolego', () => {
  it.each([
    [1, 1, 2],
    [2, 2, 2],
    [3, 3, 2],
    [5, 5, 2],
    [6, 6, 1],
    [3, 6, 1],
    [3, 7, 0],
  ])(
    'RF-080/RF-084: juramento %i, treino %i gera %i Fôlego',
    (diasJurados, diasTreinados, folego) => {
      expect(calcularFolego(makeCiclo({ diasJurados, diasTreinados }))).toBe(folego);
    },
  );

  it.each([
    ['quebrado', { diasJurados: 5, diasTreinados: 2 }],
    ['Trégua', { diasJurados: 3, diasTreinados: 0, tregua: true }],
    ['Trégua de Recuperação', { diasJurados: 3, diasTreinados: 0, treguaRecuperacao: true }],
  ])('RF-080: ciclo %s não gera Fôlego', (_tipo, overrides) => {
    expect(calcularFolego(makeCiclo(overrides))).toBe(0);
  });

  it('RF-082: deload dobra o teto de Fôlego para quatro', () => {
    expect(calcularFolego(makeCiclo({ diasJurados: 2, diasTreinados: 2, deload: true }))).toBe(4);
  });

  it('RN-006/RF-080: treino acima do juramento não gera Fôlego adicional', () => {
    expect(calcularFolego(makeCiclo({ diasJurados: 2, diasTreinados: 5 }))).toBe(2);
  });

  it('RF-080: sete dias treinados deixam Fôlego em zero', () => {
    expect(calcularFolego(makeCiclo({ diasJurados: 3, diasTreinados: 7 }))).toBe(0);
  });
});
