/**
 * Event sourcing types — ADR-0002
 * Espelha `diary_events` (docs/database/migrations/20260726120600_diary_events.sql):
 * `tipo` é texto livre no banco (sem enum — contrato real é o schema Zod
 * compartilhado, ADR-0009). O union abaixo é o subconjunto que o projector
 * do pacote `dominio` hoje sabe interpretar; tipos futuros não devem exigir
 * migração de banco, só um novo reducer aqui.
 */
import type { Juramento } from './juramento';
import type { CooldownMarcos } from './marcos';

export type DiaryEventType =
  | 'juramento_declarado'
  | 'sessao_registrada'
  | 'tregua_declarada'
  | 'tregua_recuperacao_declarada'
  | 'deload_declarado'
  | 'marco_declarado'
  | 'ciclo_encerrado';

export interface DiaryEvent {
  id: string;
  tipo: DiaryEventType;
  ocorridoEm: string; // ISO 8601 — base das regras de negócio, não `recebido_em`
  payload: Record<string, unknown>;
}

export type Atributo = 'forca' | 'vigor' | 'destreza';

/**
 * Projeção recalculada a partir de `diary_events` (ADR-0002) — nunca uma
 * fonte de verdade própria.
 */
export interface Ficha {
  atributos: Record<Atributo, number>;
  vontade: number;
  folego: number;
  cicloAtual: number;
  ciclosCumpridos: number;
  juramento: Juramento | null;
  cooldownMarcos: CooldownMarcos;
}
