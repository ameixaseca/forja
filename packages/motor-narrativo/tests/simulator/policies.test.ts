import { describe, expect, it } from 'vitest';

import {
  ConstantePolicy,
  EspecialistaPolicy,
  ErraticoPolicy,
  IntermitentePolicy,
  PessimoPolicy,
} from '../../src/simulator/policies';

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

describe('EspecialistaPolicy', () => {
  it('cresce força com o ciclo e mantém vigor/destreza estagnados', () => {
    const policy = new EspecialistaPolicy();

    expect(policy.nextInputs(0, 0).atributo).toMatchObject({ forca: 0, vigor: 0, destreza: 0 });
    expect(policy.nextInputs(3, 0).atributo).toMatchObject({ forca: 3, vigor: 0, destreza: 0 });
  });

  it('satura o crescimento de força em 5', () => {
    const policy = new EspecialistaPolicy();

    expect(policy.nextInputs(10, 0).atributo.forca).toBe(5);
  });
});

describe('PessimoPolicy', () => {
  it('mantém rolagem no piso e atributos parados em todo ciclo', () => {
    const policy = new PessimoPolicy();

    const inputs = policy.nextInputs(5, 2);

    expect(inputs).toMatchObject({
      rolagem: 2,
      atributo: { forca: 0, vigor: 0, destreza: 0 },
      vontade: 0,
      ciclo_cumprido: false,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    });
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
