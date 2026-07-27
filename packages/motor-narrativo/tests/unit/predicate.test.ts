import { describe, expect, it } from 'vitest';
import { evaluatePredicate } from '../../src/selector/predicate';
import type { Predicate, State } from '../../src/types';

describe('evaluatePredicate', () => {
  const numericState: State = { qualities: { progresso: 3 } };
  const booleanState: State = { qualities: { ativo: true, encerrado: false } };

  const numericCases: readonly [Predicate['op'], number, boolean][] = [
    ['==', 3, true],
    ['!=', 3, false],
    ['>', 2, true],
    ['<', 2, false],
    ['>=', 3, true],
    ['<=', 2, false],
  ];

  it.each(numericCases)('avalia %s com qualidades numéricas', (op, valor, expected) => {
    const predicate: Predicate = { qual: 'progresso', op, valor };

    const result = evaluatePredicate(predicate, numericState);

    expect(result).toBe(expected);
  });

  const booleanCases: readonly [Predicate['op'], string, boolean, boolean][] = [
    ['==', 'ativo', true, true],
    ['!=', 'ativo', true, false],
    ['>', 'ativo', false, true],
    ['<', 'encerrado', true, true],
    ['>=', 'ativo', true, true],
    ['<=', 'ativo', false, false],
  ];

  it.each(booleanCases)(
    'avalia %s com qualidades booleanas',
    (op, qual, valor, expected) => {
      const predicate: Predicate = { qual, op, valor };

      const result = evaluatePredicate(predicate, booleanState);

      expect(result).toBe(expected);
    },
  );

  it('retorna true quando predicado é undefined', () => {
    const result = evaluatePredicate(undefined, numericState);

    expect(result).toBe(true);
  });

  it('avalia predicados e aninhados como conjunção', () => {
    const predicate: Predicate = {
      qual: 'progresso',
      op: '>=',
      valor: 3,
      e: { qual: 'ativo', op: '==', valor: false },
    };
    const state: State = { qualities: { progresso: 3, ativo: true } };

    const result = evaluatePredicate(predicate, state);

    expect(result).toBe(false);
  });

  it('avalia predicados ou aninhados como disjunção', () => {
    const predicate: Predicate = {
      qual: 'progresso',
      op: '>',
      valor: 3,
      ou: { qual: 'ativo', op: '==', valor: true },
    };
    const state: State = { qualities: { progresso: 3, ativo: true } };

    const result = evaluatePredicate(predicate, state);

    expect(result).toBe(true);
  });

  it('aplica e antes de ou em predicado combinado', () => {
    const predicate: Predicate = {
      qual: 'progresso',
      op: '>=',
      valor: 3,
      e: { qual: 'ativo', op: '==', valor: false },
      ou: { qual: 'alternativa', op: '==', valor: true },
    };
    const state: State = {
      qualities: { progresso: 3, ativo: true, alternativa: true },
    };

    const result = evaluatePredicate(predicate, state);

    expect(result).toBe(true);
  });

  const missingQualityCases: readonly [Predicate['op'], boolean][] = [
    ['==', false],
    ['!=', true],
    ['>', false],
    ['<', false],
    ['>=', false],
    ['<=', false],
  ];

  it.each(missingQualityCases)(
    'compara qualidade ausente com operador %s',
    (op, expected) => {
      const predicate: Predicate = { qual: 'ausente', op, valor: 1 };

      const result = evaluatePredicate(predicate, numericState);

      expect(result).toBe(expected);
    },
  );
});
