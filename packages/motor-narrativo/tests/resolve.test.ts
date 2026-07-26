import { describe, it, expect } from 'vitest';
import { resolve } from '../src/index';

describe('resolve', () => {
  it('should be deterministic (M-05)', () => {
    const state = { qualities: {} };
    const inputs = {
      rolagem: 7,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
    const seed = 42;

    // Placeholder test: expect Not implemented error
    expect(() => resolve(state, inputs, seed)).toThrow('Not implemented');
  });

  it('should accept same inputs multiple times (RF-036)', () => {
    const state = { qualities: {} };
    const inputs = {
      rolagem: 10,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
    const seed = 12345;

    // Placeholder: quando implementado, deve retornar mesmo resultado
    expect(() => resolve(state, inputs, seed)).toThrow('Not implemented');
  });
});
