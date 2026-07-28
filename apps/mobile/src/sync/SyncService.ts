import type { SupabaseClient } from '@supabase/supabase-js';
import type { LocalDiaryEventRow, NewLocalDiaryEvent } from '../storage/schema';
import {
  getAllEvents,
  getUnsyncedEvents,
  insertRemoteEvent,
  markSynced,
} from '../storage/sqlite';

const UNIQUE_VIOLATION = '23505';
const PUSH_CHUNK_SIZE = 50;

interface RemoteDiaryEventRow {
  id: number;
  campaign_instance_id: string;
  tipo: string;
  payload: Record<string, unknown>;
  payload_cifrado: boolean;
  device_id: string;
  idempotency_key: string;
  app_version: string;
  ocorrido_em: string;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function toInsertPayload(row: LocalDiaryEventRow | NewLocalDiaryEvent, userId: string) {
  return {
    campaign_instance_id: row.campaignInstanceId,
    user_id: userId,
    tipo: row.tipo,
    payload: row.payload,
    payload_cifrado: row.payloadCifrado,
    device_id: row.deviceId,
    idempotency_key: row.idempotencyKey,
    app_version: row.appVersion,
    ocorrido_em: row.ocorridoEm,
  };
}

/**
 * Sincroniza `diary_events` direto contra o Supabase (PostgREST, sob RLS
 * `auth.uid()`), sem depender de nenhum endpoint de `apps/api` (ADR-0011,
 * ver design.md decisão D1). "Sync" aqui é só push de eventos locais
 * pendentes + pull de eventos novos — o log é append-only, então nunca há
 * conflito de escrita a resolver.
 */
export class SyncService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string,
  ) {}

  /**
   * Envia eventos locais ainda não sincronizados. Reenvio de um evento já
   * gravado no servidor (mesma idempotency_key) é tratado como sucesso —
   * a constraint única do servidor rejeita a duplicata, e buscamos o
   * `server_id` real já existente para marcar `synced_at` corretamente
   * (ver spec mobile-offline-diary, cenário "Reenvio após falha parcial").
   */
  async push(campaignInstanceId: string): Promise<{ pushed: number; alreadySynced: number }> {
    const pending = await getUnsyncedEvents(campaignInstanceId);
    let pushed = 0;
    let alreadySynced = 0;

    for (const batch of chunk(pending, PUSH_CHUNK_SIZE)) {
      const payloads = batch.map((row) => toInsertPayload(row, this.userId));
      const { data, error } = await this.supabase
        .from('diary_events')
        .insert(payloads)
        .select('id, idempotency_key');

      if (!error && data) {
        const byIdempotencyKey = new Map(data.map((r) => [r.idempotency_key, r.id as number]));
        const updates = batch
          .map((row) => {
            const serverId = byIdempotencyKey.get(row.idempotencyKey);
            return serverId !== undefined ? { idLocal: row.idLocal, serverId } : null;
          })
          .filter((u): u is { idLocal: string; serverId: number } => u !== null);
        await markSynced(updates);
        pushed += updates.length;
        continue;
      }

      if (error?.code !== UNIQUE_VIOLATION) {
        throw error ?? new Error('push: resposta inesperada do Supabase');
      }

      // Conflito no lote inteiro: reenvia evento a evento para isolar duplicatas.
      for (const row of batch) {
        const single = await this.supabase
          .from('diary_events')
          .insert(toInsertPayload(row, this.userId))
          .select('id')
          .single();

        if (!single.error && single.data) {
          await markSynced([{ idLocal: row.idLocal, serverId: single.data.id as number }]);
          pushed += 1;
        } else if (single.error?.code === UNIQUE_VIOLATION) {
          // Já existe no servidor (reenvio pós-falha) — busca o server_id real
          // em vez de gravar null: um `serverId` null aqui faria `pull()`
          // recalcular `lastServerId` como se este evento nunca tivesse sido
          // visto, refetchando-o (e tudo depois dele) para sempre.
          const existing = await this.supabase
            .from('diary_events')
            .select('id')
            .eq('campaign_instance_id', row.campaignInstanceId)
            .eq('idempotency_key', row.idempotencyKey)
            .single();
          if (existing.error) throw existing.error;
          await markSynced([{ idLocal: row.idLocal, serverId: existing.data.id as number }]);
          alreadySynced += 1;
        } else {
          throw single.error;
        }
      }
    }

    return { pushed, alreadySynced };
  }

  /**
   * Busca eventos novos da mesma campanha gravados por outro device,
   * inserindo localmente os que ainda não existem (dedupe por
   * idempotency_key via `INSERT OR IGNORE`, ver sqlite.ts).
   */
  async pull(campaignInstanceId: string): Promise<{ pulled: number }> {
    const localEvents = await getAllEvents(campaignInstanceId);
    const lastServerId = localEvents.reduce(
      (max, row) => (row.serverId !== null && row.serverId > max ? row.serverId : max),
      0,
    );

    const { data, error } = await this.supabase
      .from('diary_events')
      .select(
        'id, campaign_instance_id, tipo, payload, payload_cifrado, device_id, idempotency_key, app_version, ocorrido_em',
      )
      .eq('campaign_instance_id', campaignInstanceId)
      .gt('id', lastServerId)
      .order('id', { ascending: true });

    if (error) throw error;

    const remoteRows = (data ?? []) as RemoteDiaryEventRow[];
    for (const row of remoteRows) {
      await insertRemoteEvent({
        idLocal: `remote-${row.id}`,
        serverId: row.id,
        campaignInstanceId: row.campaign_instance_id,
        tipo: row.tipo as LocalDiaryEventRow['tipo'],
        payload: row.payload,
        payloadCifrado: row.payload_cifrado,
        deviceId: row.device_id,
        idempotencyKey: row.idempotency_key,
        appVersion: row.app_version,
        ocorridoEm: row.ocorrido_em,
      });
    }

    return { pulled: remoteRows.length };
  }

  async sync(campaignInstanceId: string) {
    const pushResult = await this.push(campaignInstanceId);
    const pullResult = await this.pull(campaignInstanceId);
    return { ...pushResult, ...pullResult };
  }
}
