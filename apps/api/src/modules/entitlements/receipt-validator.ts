export interface ReceiptValidationResult {
  valid: boolean;
  productId?: string;
  expiresAt?: string | null;
}

export interface ReceiptValidator {
  validate(receipt: string): Promise<ReceiptValidationResult>;
}

export const RECEIPT_VALIDATOR_REGISTRY = Symbol('RECEIPT_VALIDATOR_REGISTRY');

export type ReceiptValidatorRegistry = Record<
  'ios' | 'android' | 'stripe',
  ReceiptValidator
>;
