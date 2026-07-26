import { describe, it, expect } from 'vitest';
import { calcularProgressao, isCicloCumprido, calcularFolego } from '../src/index';

describe('calcularProgressao', () => {
  it('should calculate RN-001 correctly', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 3, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 2,
      diasJurados: 3,
      cumprido: false,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    expect(calcularProgressao(ciclo)).toBeCloseTo(0.667, 2);
  });

  it('should return 0 when diasJurados is 0', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 0, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 0,
      diasJurados: 0,
      cumprido: false,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    expect(calcularProgressao(ciclo)).toBe(0);
  });
});

describe('isCicloCumprido', () => {
  it('should return true when dias_treinados >= dias_jurados (RN-002)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 3, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 3,
      diasJurados: 3,
      cumprido: true,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    expect(isCicloCumprido(ciclo)).toBe(true);
  });

  it('should return false for Trégua (RN-038)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 3, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 0,
      diasJurados: 3,
      cumprido: false,
      tregua: true,
      treguaRecuperacao: false,
      deload: false,
    };

    expect(isCicloCumprido(ciclo)).toBe(false);
  });

  it('should return false for Trégua Recuperação (RF-007A)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 3, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 0,
      diasJurados: 3,
      cumprido: false,
      tregua: false,
      treguaRecuperacao: true,
      deload: false,
    };

    expect(isCicloCumprido(ciclo)).toBe(false);
  });
});

describe('calcularFolego', () => {
  it('should generate Fôlego from dias sem treino (PRD §4.5)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 3, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 3,
      diasJurados: 3,
      cumprido: true,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    // Jurou 3, treinou 3 → cumprido
    // Dias sem treino = 7 - 3 = 4 dias
    // Teto 2 → Fôlego = 2
    expect(calcularFolego(ciclo)).toBe(2);
  });

  it('should cap Fôlego at 2 for normal cycle (D-044)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 1, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 1,
      diasJurados: 1,
      cumprido: true,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    // Jurou 1, treinou 1 → cumprido
    // Dias sem treino = 7 - 1 = 6 dias
    // Teto 2 → Fôlego = 2 (capped)
    expect(calcularFolego(ciclo)).toBe(2);
  });

  it('should give 1 Fôlego for 6-day oath (PRD §4.5)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 6, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 6,
      diasJurados: 6,
      cumprido: true,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    // Jurou 6, treinou 6 → cumprido
    // Dias sem treino = 7 - 6 = 1 dia
    // Fôlego = 1 (PRD: "todo jurador de 1 a 5 dias recebe 2 por ciclo e o de 6 dias recebe 1")
    expect(calcularFolego(ciclo)).toBe(1);
  });

  it('should double cap for deload cycle (RF-082)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 1, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 1,
      diasJurados: 1,
      cumprido: true,
      tregua: false,
      treguaRecuperacao: false,
      deload: true,
    };

    // Jurou 1, treinou 1, deload → cumprido
    // Dias sem treino = 7 - 1 = 6 dias
    // Teto deload = 4 → Fôlego = 4
    expect(calcularFolego(ciclo)).toBe(4);
  });

  it('should return 0 for non-cumprido cycle (RF-080)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 5, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 2,
      diasJurados: 5,
      cumprido: false,
      tregua: false,
      treguaRecuperacao: false,
      deload: false,
    };

    expect(calcularFolego(ciclo)).toBe(0);
  });

  it('should return 0 for Trégua Recuperação (D-042)', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 5, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 0,
      diasJurados: 5,
      cumprido: false,
      tregua: false,
      treguaRecuperacao: true,
      deload: false,
    };

    expect(calcularFolego(ciclo)).toBe(0);
  });
});
