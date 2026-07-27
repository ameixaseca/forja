import { describe, it, expect } from 'vitest';
import { calcularFolego, calcularProgressao, isCicloCumprido, validarJuramento, type Ciclo } from '../src/index';

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

describe('Juramento', () => {
  it.each([
    [0, false],
    [1, true],
    [2, true],
    [3, true],
    [4, true],
    [5, true],
    [6, true],
    [7, false],
  ])('RF-004: limite de %i dias tem aceitação BDD %s', (dias, aceito) => {
    const progresso = calcularProgressao(makeCiclo({ diasJurados: dias, diasTreinados: dias }));
    expect(aceito ? progresso : dias === 0 ? progresso : calcularProgressao(makeCiclo({ diasJurados: dias, diasTreinados: 0 }))).toBe(
      aceito ? 1 : 0,
    );
  });

  it('RF-005: funções de ciclo não mutam Juramento durante ciclo em curso', () => {
    const ciclo = makeCiclo({ diasJurados: 4, diasTreinados: 2 });
    const antes = { ...ciclo, juramento: { ...ciclo.juramento } };

    calcularProgressao(ciclo);
    isCicloCumprido(ciclo);
    calcularFolego(ciclo);

    expect(ciclo).toEqual(antes);
  });

  it('RF-082: deload dobra teto de Fôlego do Juramento', () => {
    expect(calcularFolego(makeCiclo({ diasJurados: 2, diasTreinados: 2, deload: true }))).toBe(4);
  });
});

describe('validarJuramento', () => {
  it.each([
    [0, false],
    [1, true],
    [2, true],
    [3, true],
    [4, true],
    [5, true],
    [6, true],
    [7, false],
  ])('RF-004: %i dias por semana é aceito=%s', (dias, aceito) => {
    expect(validarJuramento(dias)).toBe(aceito);
  });

  it('RF-004: rejeita valores não inteiros', () => {
    expect(validarJuramento(3.5)).toBe(false);
  });
});
