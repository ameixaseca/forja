import { describe, expect, it } from 'vitest';

import { applySafetyNet } from '../../src/safety-net';
import type { Catalog, State } from '../../src/types';

describe('applySafetyNet', () => {
  const catalog: Catalog = {
    storylets: [
      {
        id: 'st_cor_fallback',
        banda: 'Cor',
        subclasse: null,
        capitulo: null,
        variantes: [{ texto: 'texto.fallback', efeitos: {} }],
      },
    ],
  };

  it('retorna a primeira variante do fallback e incrementa contadores a partir de zero', () => {
    const state: State = { qualities: {} };

    const result = applySafetyNet(catalog, state);

    expect(result.storylet.id).toBe('st_cor_fallback');
    expect(result.newState.qualities).toMatchObject({
      'sys.visto.st_cor_fallback': 1,
      'sys.resolucoes': 1,
      'cap.resolucoes': 1,
    });
  });

  it('incrementa contadores existentes ao invés de reiniciá-los', () => {
    const state: State = {
      qualities: {
        'sys.visto.st_cor_fallback': 3,
        'sys.resolucoes': 10,
        'cap.resolucoes': 4,
      },
    };

    const result = applySafetyNet(catalog, state);

    expect(result.newState.qualities).toMatchObject({
      'sys.visto.st_cor_fallback': 4,
      'sys.resolucoes': 11,
      'cap.resolucoes': 5,
    });
  });

  it('lança erro quando st_cor_fallback não existe no catálogo', () => {
    const emptyCatalog: Catalog = { storylets: [] };

    expect(() => applySafetyNet(emptyCatalog, { qualities: {} })).toThrow(
      'st_cor_fallback not found in catalog (required by M-04)',
    );
  });
});
