import { describe, expect, it } from 'vitest';

import { ConstantePolicy, ErraticoPolicy, IntermitentePolicy } from '../../src/simulator/policies';

describe('ConstantePolicy', () => {
  it('sempre retorna rolagem=8, atributos=1, vontade=1, ciclo_cumprido=true', () => {
    const policy = new ConstantePolicy();

    const inputs = policy.nextInputs(0, 0);

    expect(inputs).toMatchObject({
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    });
  });
});

describe('ErraticoPolicy', () => {
  it('gera rolagem dentro do intervalo 2..15', () => {
    const policy = new ErraticoPolicy();

    for (let i = 0; i < 50; i += 1) {
      const inputs = policy.nextInputs(i, i);
      expect(inputs.rolagem).toBeGreaterThanOrEqual(2);
      expect(inputs.rolagem).toBeLessThanOrEqual(15);
    }
  });

  it('gera atributos dentro do intervalo 0..5', () => {
    const policy = new ErraticoPolicy();

    const inputs = policy.nextInputs(0, 0);

    for (const value of Object.values(inputs.atributo)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(5);
    }
  });
});

describe('IntermitentePolicy', () => {
  it('ativa trégua a cada 3 ciclos', () => {
    const policy = new IntermitentePolicy();

    expect(policy.nextInputs(3, 0).tregua).toBe(true);
    expect(policy.nextInputs(1, 0).tregua).toBe(false);
  });

  it('ativa reencontro a cada 4 ciclos na primeira resolução do ciclo', () => {
    const policy = new IntermitentePolicy();

    expect(policy.nextInputs(4, 0).reencontro).toBe(true);
    expect(policy.nextInputs(4, 1).reencontro).toBe(false);
    expect(policy.nextInputs(2, 0).reencontro).toBe(false);
  });
});
