import { describe, expect, it } from 'vitest';
import { buildNarrativeState } from './state';
import type { LocalDiaryEventRow } from '../storage/schema';

function makeRow(overrides: Partial<LocalDiaryEventRow> = {}): LocalDiaryEventRow {
  return {
    idLocal: 'local-1',
    serverId: null,
    campaignInstanceId: 'campaign-1',
    tipo: 'sessao_registrada',
    payload: {},
    payloadCifrado: false,
    deviceId: 'device-1',
    idempotencyKey: 'idem-1',
    appVersion: '0.0.1',
    ocorridoEm: '2026-07-27T10:00:00.000Z',
    syncedAt: null,
    ...overrides,
  };
}

describe('buildNarrativeState', () => {
  it('sem eventos, devolve qualities vazio', () => {
    expect(buildNarrativeState([])).toEqual({ qualities: {} });
  });

  it('ignora eventos que não são sessao_registrada', () => {
    const eventos = [makeRow({ tipo: 'juramento_declarado', payload: { diasPorSemana: 3 } })];
    expect(buildNarrativeState(eventos)).toEqual({ qualities: {} });
  });

  it('usa o snapshot de qualities do sessao_registrada mais recente (já cumulativo)', () => {
    const eventos = [
      makeRow({
        idLocal: 'a',
        ocorridoEm: '2026-07-27T10:00:00.000Z',
        payload: { qualities: { 'cap.aberto': true } },
      }),
      makeRow({
        idLocal: 'b',
        ocorridoEm: '2026-07-27T11:00:00.000Z',
        payload: { qualities: { 'cap.aberto': true, 'cap.resolucoes': 1 } },
      }),
    ];
    expect(buildNarrativeState(eventos)).toEqual({
      qualities: { 'cap.aberto': true, 'cap.resolucoes': 1 },
    });
  });

  it('sessao_registrada sem qualities no payload (evento malformado) é ignorado, cai para o anterior', () => {
    const eventos = [
      makeRow({ idLocal: 'a', payload: { qualities: { 'cap.aberto': true } } }),
      makeRow({ idLocal: 'b', payload: {} }),
    ];
    expect(buildNarrativeState(eventos)).toEqual({ qualities: { 'cap.aberto': true } });
  });
});
