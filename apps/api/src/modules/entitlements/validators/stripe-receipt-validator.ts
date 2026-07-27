import { Injectable } from '@nestjs/common';
import {
  ReceiptValidationResult,
  ReceiptValidator,
} from '../receipt-validator';

interface StripeCheckoutSession {
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  metadata?: { pacote?: string };
  line_items?: { data: Array<{ price?: { product?: string } }> };
}

@Injectable()
export class StripeReceiptValidator implements ReceiptValidator {
  async validate(receipt: string): Promise<ReceiptValidationResult> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurado');
    }

    // `receipt` é o checkout session id (recibo opaco do lado do cliente).
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${receipt}?expand[]=line_items`,
      {
        headers: { authorization: `Bearer ${secretKey}` },
      },
    );

    if (!response.ok) {
      return { valid: false };
    }

    const session = (await response.json()) as StripeCheckoutSession;
    if (session.payment_status !== 'paid') {
      return { valid: false };
    }

    return {
      valid: true,
      productId:
        session.metadata?.pacote ?? session.line_items?.data[0]?.price?.product,
      expiresAt: null,
    };
  }
}
