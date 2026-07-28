/**
 * Linha local de `diary_events` — superset do `DiaryEvent` de domínio
 * (`@forja/dominio`), incluindo os campos de transporte exigidos pelo
 * schema do servidor (`docs/database/migrations/20260726120600_diary_events.sql`).
 * Ver design.md da mudança `fase-6-mobile-mvp`, decisão D2.
 */
import type { DiaryEventType } from '@forja/dominio';

export interface LocalDiaryEventRow {
  idLocal: string;
  serverId: number | null;
  campaignInstanceId: string;
  tipo: DiaryEventType;
  payload: Record<string, unknown>;
  payloadCifrado: boolean;
  deviceId: string;
  idempotencyKey: string;
  appVersion: string;
  ocorridoEm: string;
  syncedAt: string | null;
}

export type NewLocalDiaryEvent = Omit<LocalDiaryEventRow, 'serverId' | 'syncedAt'>;
