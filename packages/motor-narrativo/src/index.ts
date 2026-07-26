/**
 * Motor Narrativo — Pure TS, no deps (D-033)
 * Implements ESPEC v2.6
 */

export interface State {
  qualities: Record<string, number | boolean>;
}

export interface Inputs {
  rolagem: number;
  tregua: boolean;
  reencontro: boolean;
  sessao_secundaria: boolean;
}

export interface Storylet {
  id: string;
  titulo: string;
  banda: 'espinha' | 'arco' | 'ambientacao';
  prerequisitos: Record<string, unknown>;
  efeitos: Record<string, number | boolean>;
  peso: number;
}

export interface Resolution {
  storylet: Storylet;
  texto: string;
  effects: Record<string, number | boolean>;
}

/**
 * Função pura (RF-036): estado + inputs + seed → resolução
 * @param state Estado do mundo narrativo
 * @param inputs Entradas da resolução (rolagem, trégua, etc.)
 * @param seed Seed para RNG determinístico (DI-007)
 * @returns Resolução contendo storylet selecionado e efeitos
 */
export function resolve(state: State, inputs: Inputs, seed: number): Resolution {
  // Placeholder: implementar em Fase 2
  throw new Error('Not implemented');
}
