import * as SQLite from 'expo-sqlite';
import type { LocalDiaryEventRow, NewLocalDiaryEvent } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('forja.db');
  }
  return dbPromise;
}

export async function initDB(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS diary_events (
      id_local TEXT PRIMARY KEY,
      server_id INTEGER,
      campaign_instance_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      payload TEXT NOT NULL,
      payload_cifrado INTEGER NOT NULL DEFAULT 0,
      device_id TEXT NOT NULL,
      idempotency_key TEXT NOT NULL,
      app_version TEXT NOT NULL,
      ocorrido_em TEXT NOT NULL,
      synced_at TEXT,
      UNIQUE (campaign_instance_id, idempotency_key)
    );
    CREATE INDEX IF NOT EXISTS idx_diary_events_campaign
      ON diary_events (campaign_instance_id, ocorrido_em, id_local);
  `);
}

interface RawRow {
  id_local: string;
  server_id: number | null;
  campaign_instance_id: string;
  tipo: string;
  payload: string;
  payload_cifrado: number;
  device_id: string;
  idempotency_key: string;
  app_version: string;
  ocorrido_em: string;
  synced_at: string | null;
}

function fromRawRow(row: RawRow): LocalDiaryEventRow {
  return {
    idLocal: row.id_local,
    serverId: row.server_id,
    campaignInstanceId: row.campaign_instance_id,
    tipo: row.tipo as LocalDiaryEventRow['tipo'],
    payload: JSON.parse(row.payload) as Record<string, unknown>,
    payloadCifrado: row.payload_cifrado === 1,
    deviceId: row.device_id,
    idempotencyKey: row.idempotency_key,
    appVersion: row.app_version,
    ocorridoEm: row.ocorrido_em,
    syncedAt: row.synced_at,
  };
}

/**
 * `INSERT OR IGNORE` porque `insertEvent` pode ser chamado de novo com o
 * mesmo `idempotencyKey` (retry do chamador após falha local não confirmada)
 * — grava no máximo uma vez por (campaign_instance_id, idempotency_key),
 * espelhando a constraint única do servidor (ver design.md D2/D3).
 */
export async function insertEvent(event: NewLocalDiaryEvent): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR IGNORE INTO diary_events
      (id_local, campaign_instance_id, tipo, payload, payload_cifrado, device_id, idempotency_key, app_version, ocorrido_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.idLocal,
      event.campaignInstanceId,
      event.tipo,
      JSON.stringify(event.payload),
      event.payloadCifrado ? 1 : 0,
      event.deviceId,
      event.idempotencyKey,
      event.appVersion,
      event.ocorridoEm,
    ],
  );
}

export async function getAllEvents(campaignInstanceId: string): Promise<LocalDiaryEventRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RawRow>(
    'SELECT * FROM diary_events WHERE campaign_instance_id = ? ORDER BY ocorrido_em ASC, id_local ASC',
    [campaignInstanceId],
  );
  return rows.map(fromRawRow);
}

export async function getUnsyncedEvents(
  campaignInstanceId: string,
): Promise<LocalDiaryEventRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RawRow>(
    'SELECT * FROM diary_events WHERE campaign_instance_id = ? AND synced_at IS NULL ORDER BY ocorrido_em ASC, id_local ASC',
    [campaignInstanceId],
  );
  return rows.map(fromRawRow);
}

export async function markSynced(
  updates: Array<{ idLocal: string; serverId: number }>,
): Promise<void> {
  if (updates.length === 0) return;
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const { idLocal, serverId } of updates) {
      await db.runAsync(
        'UPDATE diary_events SET synced_at = ?, server_id = ? WHERE id_local = ?',
        [now, serverId, idLocal],
      );
    }
  });
}

export async function insertRemoteEvent(
  row: Omit<LocalDiaryEventRow, 'syncedAt'> & { idLocal: string },
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO diary_events
      (id_local, server_id, campaign_instance_id, tipo, payload, payload_cifrado, device_id, idempotency_key, app_version, ocorrido_em, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.idLocal,
      row.serverId,
      row.campaignInstanceId,
      row.tipo,
      JSON.stringify(row.payload),
      row.payloadCifrado ? 1 : 0,
      row.deviceId,
      row.idempotencyKey,
      row.appVersion,
      row.ocorridoEm,
      now,
    ],
  );
}
