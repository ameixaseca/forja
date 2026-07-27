import { Injectable } from '@nestjs/common';
import {
  ReceiptValidationResult,
  ReceiptValidator,
} from '../receipt-validator';

interface PlayStoreReceiptPayload {
  packageName: string;
  productId: string;
  purchaseToken: string;
}

interface PlayStoreProductPurchase {
  purchaseState: number; // 0 = comprado
  expiryTimeMillis?: string;
}

function parseReceipt(receipt: string): PlayStoreReceiptPayload {
  const parsed = JSON.parse(receipt) as Partial<PlayStoreReceiptPayload>;
  if (!parsed.packageName || !parsed.productId || !parsed.purchaseToken) {
    throw new Error(
      'recibo Play Store incompleto: esperado packageName, productId, purchaseToken',
    );
  }
  return parsed as PlayStoreReceiptPayload;
}

function getAccessToken(): string {
  const token = process.env.GOOGLE_PLAY_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'GOOGLE_PLAY_ACCESS_TOKEN não configurado (troca de service account por OAuth2 access token)',
    );
  }
  return token;
}

@Injectable()
export class PlayStoreReceiptValidator implements ReceiptValidator {
  async validate(receipt: string): Promise<ReceiptValidationResult> {
    const { packageName, productId, purchaseToken } = parseReceipt(receipt);
    const accessToken = getAccessToken();

    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return { valid: false };
    }

    const purchase = (await response.json()) as PlayStoreProductPurchase;
    if (purchase.purchaseState !== 0) {
      return { valid: false };
    }

    return {
      valid: true,
      productId,
      expiresAt: purchase.expiryTimeMillis
        ? new Date(Number(purchase.expiryTimeMillis)).toISOString()
        : null,
    };
  }
}
