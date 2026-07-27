/**
 * Domínio — Regras de negócio (RN-001 a RN-039)
 * Implementa: Juramento, Ciclo, Fôlego, Vontade, Marcos, event sourcing da ficha
 * Pure TS, no deps (D-033)
 */

export type { Juramento } from './juramento';
export { validarJuramento } from './juramento';

export type { Ciclo } from './ciclo';
export { calcularProgressao, isCicloCumprido } from './ciclo';

export { calcularFolego } from './folego';

export { calcularVontade } from './vontade';

export type { CooldownMarcos } from './marcos';
export {
  podeDeclararMarco,
  aplicarCooldown,
  limitarMarcosContabilizados,
  calcularPontosAtributo,
} from './marcos';

export type { Atributo, DiaryEvent, DiaryEventType, Ficha } from './types';
export { calcularFicha } from './event-sourcing/projector';
