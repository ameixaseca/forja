import { describe, it, expect } from 'vitest';
import { calcularProgressao, isCicloCumprido, type Ciclo } from '../src/index';

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

describe('progressão de ciclo', () => {
  it.each([
    [0, 5, 0, false],
    [4, 5, 0.8, false],
    [5, 5, 1, true],
  ])('RN-001/RN-002: fronteira %i/%i classifica progresso %f como cumprido=%s', (treinados, jurados, progresso, cumprido) => {
    const ciclo = makeCiclo({ diasTreinados: treinados, diasJurados: jurados });

    expect(calcularProgressao(ciclo)).toBe(progresso);
    expect(isCicloCumprido(ciclo)).toBe(cumprido);
  });

  it.each([
    [5, 4],
    [2, 1],
  ])('RN-002: ciclo %i/%i é quebrado', (jurados, treinados) => {
    expect(isCicloCumprido(makeCiclo({ diasJurados: jurados, diasTreinados: treinados }))).toBe(false);
  });
});

describe('ciclos quebrados consecutivos', () => {
  it('RN-008: Trégua pausa contagem e preserva três quebrados no total', () => {
    const ciclos = [
      makeCiclo({ numero: 1, diasJurados: 5, diasTreinados: 4 }),
      makeCiclo({ numero: 2, diasJurados: 5, diasTreinados: 4 }),
      makeCiclo({ numero: 3, tregua: true, diasJurados: 5, diasTreinados: 0 }),
      makeCiclo({ numero: 4, diasJurados: 5, diasTreinados: 4 }),
    ];

    const quebrados = ciclos.filter((ciclo) => !ciclo.tregua && !ciclo.treguaRecuperacao && !isCicloCumprido(ciclo));

    expect(quebrados).toHaveLength(3);
    expect(isCicloCumprido(ciclos[2])).toBe(false);
  });

  it('RN-008: Trégua de Recuperação também não entra na contagem', () => {
    const quebrado = makeCiclo({ diasJurados: 5, diasTreinados: 4 });
    const recuperacao = makeCiclo({ treguaRecuperacao: true, diasJurados: 5, diasTreinados: 0 });

    expect(isCicloCumprido(quebrado)).toBe(false);
    expect(isCicloCumprido(recuperacao)).toBe(false);
  });
});
