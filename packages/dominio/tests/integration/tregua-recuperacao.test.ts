import { describe, it, expect } from 'vitest';
import { calcularFolego, isCicloCumprido, type Ciclo } from '../../src/index';

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

describe('trégua de recuperação', () => {
  it('RF-007A: treguaRecuperacao=true → isCicloCumprido=false', () => {
    const ciclo = makeCiclo({ treguaRecuperacao: true });

    expect(isCicloCumprido(ciclo)).toBe(false);
    expect(calcularFolego(ciclo)).toBe(0);
  });

  it('D-042: treguaRecuperacao=true → calcularFolego=0', () => {
    const ciclo = makeCiclo({ diasJurados: 6, diasTreinados: 6, treguaRecuperacao: true });

    expect(isCicloCumprido(ciclo)).toBe(false);
    expect(calcularFolego(ciclo)).toBe(0);
  });

  it('RN-038: tregua=true → isCicloCumprido=false, calcularFolego=0', () => {
    const ciclo = makeCiclo({ tregua: true });

    expect(isCicloCumprido(ciclo)).toBe(false);
    expect(calcularFolego(ciclo)).toBe(0);
  });

  it('RF-080: sequência cumprido→treguaRecuperacao: Fôlego total = 2+0 = 2', () => {
    const cicloCumprido = makeCiclo({ numero: 1 });
    const cicloTregua = makeCiclo({ numero: 2, treguaRecuperacao: true });

    expect(isCicloCumprido(cicloCumprido)).toBe(true);
    expect(isCicloCumprido(cicloTregua)).toBe(false);
    expect(calcularFolego(cicloCumprido) + calcularFolego(cicloTregua)).toBe(2);
  });
});
