import { describe, expect, it } from 'vitest';
import { toDominioEvent, toDominioEvents } from './toDominioEvent';
import type { LocalDiaryEventRow } from './schema';

function makeRow(overrides: Partial<LocalDiaryEventRow> = {}): LocalDiaryEventRow {
  return {
    idLocal: 'local-1',
    serverId: null,
    campaignInstanceId: 'campaign-1',
    tipo: 'juramento_declarado',
    payload: { diasPorSemana: 3 },
    payloadCifrado: false,
    deviceId: 'device-1',
    idempotencyKey: 'idem-1',
    appVersion: '0.0.1',
    ocorridoEm: '2026-07-27T10:00:00.000Z',
    syncedAt: null,
    ...overrides,
  };
}

describe('toDominioEvent', () => {
  it('maps storage row to the domain DiaryEvent shape, dropping transport metadata', () => {
    const row = makeRow();

    expect(toDominioEvent(row)).toEqual({
      id: 'local-1',
      tipo: 'juramento_declarado',
      ocorridoEm: '2026-07-27T10:00:00.000Z',
      payload: { diasPorSemana: 3 },
    });
  });

  it('maps a list preserving order', () => {
    const rows = [
      makeRow({ idLocal: 'a', ocorridoEm: '2026-07-27T10:00:00.000Z' }),
      makeRow({ idLocal: 'b', ocorridoEm: '2026-07-28T10:00:00.000Z' }),
    ];

    expect(toDominioEvents(rows).map((e) => e.id)).toEqual(['a', 'b']);
  });
});
