import { AppStoreReceiptValidator } from './app-store-receipt-validator';

describe('AppStoreReceiptValidator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      APP_STORE_BUNDLE_ID: 'com.forja.app',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  function mockVerifyReceiptResponse(bundleId: string) {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: 0,
          receipt: { bundle_id: bundleId },
          latest_receipt_info: [
            {
              product_id: 'forja_campaign_espinha',
              expires_date_ms: undefined,
            },
          ],
        }),
    } as Response);
  }

  it('rejeita recibo válido perante a Apple mas de outro bundle_id', async () => {
    mockVerifyReceiptResponse('com.outro.app');
    const validator = new AppStoreReceiptValidator();

    const resultado = await validator.validate('recibo-base64');

    expect(resultado).toEqual({ valid: false });
  });

  it('aceita recibo válido com bundle_id correto', async () => {
    mockVerifyReceiptResponse('com.forja.app');
    const validator = new AppStoreReceiptValidator();

    const resultado = await validator.validate('recibo-base64');

    expect(resultado).toEqual({
      valid: true,
      productId: 'forja_campaign_espinha',
      expiresAt: null,
    });
  });
});
