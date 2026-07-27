import { Injectable } from '@nestjs/common';
import {
  ReceiptValidationResult,
  ReceiptValidator,
} from '../receipt-validator';

const PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
const SANDBOX_RECEIPT_STATUS = 21007;

interface AppStoreVerifyReceiptResponse {
  status: number;
  receipt?: { bundle_id?: string };
  latest_receipt_info?: Array<{ product_id: string; expires_date_ms?: string }>;
}

async function callVerifyReceipt(
  url: string,
  receiptData: string,
): Promise<AppStoreVerifyReceiptResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      password: process.env.APP_STORE_SHARED_SECRET,
    }),
  });
  return (await response.json()) as AppStoreVerifyReceiptResponse;
}

@Injectable()
export class AppStoreReceiptValidator implements ReceiptValidator {
  async validate(receipt: string): Promise<ReceiptValidationResult> {
    let result = await callVerifyReceipt(PRODUCTION_URL, receipt);
    // Recibo de sandbox enviado por engano na produção: Apple exige reenviar ao endpoint de sandbox (status 21007).
    if (result.status === SANDBOX_RECEIPT_STATUS) {
      result = await callVerifyReceipt(SANDBOX_URL, receipt);
    }

    const latest = result.latest_receipt_info?.[0];
    if (result.status !== 0 || !latest) {
      return { valid: false };
    }
    // Sem essa checagem, um recibo válido de QUALQUER app da App Store
    // (mesmo de outro desenvolvedor) passaria adiante e viraria entitlement FORJA.
    if (result.receipt?.bundle_id !== process.env.APP_STORE_BUNDLE_ID) {
      return { valid: false };
    }

    return {
      valid: true,
      productId: latest.product_id,
      expiresAt: latest.expires_date_ms
        ? new Date(Number(latest.expires_date_ms)).toISOString()
        : null,
    };
  }
}
