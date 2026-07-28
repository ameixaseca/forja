import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));
const idsMocks = vi.hoisted(() => ({
  newId: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: storageMocks,
}));
vi.mock('./ids', () => idsMocks);

describe('getOrCreateActiveCampaignInstanceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna o id já persistido sem gerar um novo', async () => {
    storageMocks.getItem.mockResolvedValue('campaign-existente');
    const { getOrCreateActiveCampaignInstanceId } = await import('./campaignInstance');

    const id = await getOrCreateActiveCampaignInstanceId();

    expect(id).toBe('campaign-existente');
    expect(idsMocks.newId).not.toHaveBeenCalled();
    expect(storageMocks.setItem).not.toHaveBeenCalled();
  });

  it('gera e persiste um novo id quando não há nenhum salvo', async () => {
    storageMocks.getItem.mockResolvedValue(null);
    idsMocks.newId.mockReturnValue('campaign-novo');
    const { getOrCreateActiveCampaignInstanceId } = await import('./campaignInstance');

    const id = await getOrCreateActiveCampaignInstanceId();

    expect(id).toBe('campaign-novo');
    expect(storageMocks.setItem).toHaveBeenCalledWith(
      'forja.active_campaign_instance_id',
      'campaign-novo',
    );
  });
});
