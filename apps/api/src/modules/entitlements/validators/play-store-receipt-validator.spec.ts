import { PlayStoreReceiptValidator } from './play-store-receipt-validator';

describe('PlayStoreReceiptValidator', () => {
  const receiptEnvelope = (packageName: string) =>
    JSON.stringify({
      packageName,
      productId: 'forja_campaign_espinha',
      purchaseToken: 'token-1',
    });

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PLAY_STORE_PACKAGE_NAME: 'com.forja.app',
      GOOGLE_PLAY_ACCESS_TOKEN: 'access-token',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('rejeita recibo cujo packageName não é o do app FORJA, sem chamar a API do Google', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const validator = new PlayStoreReceiptValidator();

    const resultado = await validator.validate(
      receiptEnvelope('com.outro.app'),
    );

    expect(resultado).toEqual({ valid: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('aceita recibo com packageName correto e compra confirmada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ purchaseState: 0, expiryTimeMillis: undefined }),
    } as Response);
    const validator = new PlayStoreReceiptValidator();

    const resultado = await validator.validate(
      receiptEnvelope('com.forja.app'),
    );

    expect(resultado).toEqual({
      valid: true,
      productId: 'forja_campaign_espinha',
      expiresAt: null,
    });
  });
});
