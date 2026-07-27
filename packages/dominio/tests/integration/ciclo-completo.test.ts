import { describe, it, expect } from 'vitest';
import {
  calcularFolego,
  calcularProgressao,
  isCicloCumprido,
  type Ciclo,
} from '../../src/index';

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

describe('ciclo completo', () => {
  it('RN-001/RN-002/RF-080: juramento 3 dias, treina 3, cumprido, Fôlego=2', () => {
    const ciclo = makeCiclo({ diasJurados: 3, diasTreinados: 3 });

    expect(isCicloCumprido(ciclo)).toBe(true);
    expect(calcularProgressao(ciclo)).toBe(1);
    expect(calcularFolego(ciclo)).toBe(2);
  });

  it('RF-084: juramento 6 dias, treina 6, cumprido, Fôlego=1 (1 dia descanso)', () => {
    const ciclo = makeCiclo({ diasJurados: 6, diasTreinados: 6 });

    expect(isCicloCumprido(ciclo)).toBe(true);
    expect(calcularProgressao(ciclo)).toBe(1);
    expect(calcularFolego(ciclo)).toBe(1);
  });

  it('RF-082: deload, juramento 2, treina 2, cumprido, Fôlego=4', () => {
    const ciclo = makeCiclo({ diasJurados: 2, diasTreinados: 2, deload: true });

    expect(isCicloCumprido(ciclo)).toBe(true);
    expect(calcularProgressao(ciclo)).toBe(1);
    expect(calcularFolego(ciclo)).toBe(4);
  });

  it('RN-006: treina acima do juramento (2 jurado, 5 treinado), Fôlego=2 (capped)', () => {
    const ciclo = makeCiclo({ diasJurados: 2, diasTreinados: 5 });

    expect(isCicloCumprido(ciclo)).toBe(true);
    expect(calcularProgressao(ciclo)).toBe(2.5);
    expect(calcularFolego(ciclo)).toBe(2);
  });

  it('RN-002: juramento 5, treina 3, quebrado, Fôlego=0, progressão=0.6', () => {
    const ciclo = makeCiclo({ diasJurados: 5, diasTreinados: 3 });

    expect(isCicloCumprido(ciclo)).toBe(false);
    expect(calcularProgressao(ciclo)).toBe(0.6);
    expect(calcularFolego(ciclo)).toBe(0);
  });
});
