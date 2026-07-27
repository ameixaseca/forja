import { describe, expect, it } from 'vitest';

import { applyRecognition } from '../../src/recognition';
import type { State } from '../../src/types';

describe('applyRecognition', () => {
  it('inicializa contadores a partir de zero quando ausentes', () => {
    const state: State = { qualities: {} };

    const result = applyRecognition(state, 'st_cor_1');

    expect(result.qualities).toEqual({
      'sys.visto.st_cor_1': 1,
      'sys.resolucoes': 1,
      'cap.resolucoes': 1,
    });
  });

  it('incrementa contadores existentes sem mutar o estado original', () => {
    const state: State = {
      qualities: { 'sys.visto.st_cor_1': 2, 'sys.resolucoes': 5, 'cap.resolucoes': 1 },
    };

    const result = applyRecognition(state, 'st_cor_1');

    expect(result.qualities).toMatchObject({
      'sys.visto.st_cor_1': 3,
      'sys.resolucoes': 6,
      'cap.resolucoes': 2,
    });
    expect(state.qualities).toEqual({ 'sys.visto.st_cor_1': 2, 'sys.resolucoes': 5, 'cap.resolucoes': 1 });
  });
});
