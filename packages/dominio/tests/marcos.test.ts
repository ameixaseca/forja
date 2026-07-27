import { describe, it, expect } from 'vitest';
import {
  aplicarCooldown,
  calcularPontosAtributo,
  limitarMarcosContabilizados,
  podeDeclararMarco,
  type CooldownMarcos,
} from '../src/index';

describe('podeDeclararMarco / aplicarCooldown', () => {
  it('RF-043: rótulo nunca declarado está livre', () => {
    expect(podeDeclararMarco('agachamento', 1, {})).toBe(true);
  });

  it('DI-008: declarar no ciclo 1 bloqueia o rótulo até o ciclo 3 encerrado', () => {
    const cooldown: CooldownMarcos = aplicarCooldown('agachamento', 1, {});

    expect(podeDeclararMarco('agachamento', 2, cooldown)).toBe(false);
    expect(podeDeclararMarco('agachamento', 3, cooldown)).toBe(false);
    expect(podeDeclararMarco('agachamento', 4, cooldown)).toBe(true);
  });

  it('RF-043: cooldown é isolado por rótulo', () => {
    const cooldown = aplicarCooldown('agachamento', 1, {});

    expect(podeDeclararMarco('supino', 2, cooldown)).toBe(true);
  });

  it('DI-008: nova declaração no mesmo rótulo reinicia o cooldown', () => {
    let cooldown = aplicarCooldown('agachamento', 1, {});
    cooldown = aplicarCooldown('agachamento', 4, cooldown);

    expect(podeDeclararMarco('agachamento', 5, cooldown)).toBe(false);
    expect(podeDeclararMarco('agachamento', 6, cooldown)).toBe(false);
    expect(podeDeclararMarco('agachamento', 7, cooldown)).toBe(true);
  });
});

describe('limitarMarcosContabilizados', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 2],
    [10, 2],
  ])('RF-042: %i Marcos declarados no ciclo contabilizam %i', (declarados, contabilizados) => {
    expect(limitarMarcosContabilizados(declarados)).toBe(contabilizados);
  });
});

describe('calcularPontosAtributo', () => {
  it.each([
    [0, 0],
    [2, 0],
    [3, 1],
    [5, 1],
    [6, 2],
    [9, 3],
  ])('RF-049: %i Marcos contabilizados no atributo somam %i pontos', (marcos, pontos) => {
    expect(calcularPontosAtributo(marcos, 0)).toBe(pontos);
  });

  it('RF-049: conversão respeita teto de 5 no atributo', () => {
    expect(calcularPontosAtributo(30, 0)).toBe(5);
  });

  it('RF-049: soma sobre o valor base do atributo', () => {
    expect(calcularPontosAtributo(3, 2)).toBe(3);
  });
});
