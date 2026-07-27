import type { State } from './types';

/**
 * Reconhecimento (ESPEC §5): incrementa sys.visto.{id}, sys.resolucoes, cap.resolucoes.
 * Compartilhado por resolve() e applySafetyNet() — mesma contabilidade em ambos os caminhos.
 */
export function applyRecognition(state: State, storyletId: string): State {
  const qualities = { ...state.qualities };

  const vistoKey = `sys.visto.${storyletId}`;
  qualities[vistoKey] = (Number(qualities[vistoKey]) || 0) + 1;
  qualities['sys.resolucoes'] = (Number(qualities['sys.resolucoes']) || 0) + 1;
  qualities['cap.resolucoes'] = (Number(qualities['cap.resolucoes']) || 0) + 1;

  return { qualities };
}
