import { Provider } from '@nestjs/common';
import {
  RECEIPT_VALIDATOR_REGISTRY,
  ReceiptValidatorRegistry,
} from './receipt-validator';
import { AppStoreReceiptValidator } from './validators/app-store-receipt-validator';
import { PlayStoreReceiptValidator } from './validators/play-store-receipt-validator';
import { StripeReceiptValidator } from './validators/stripe-receipt-validator';

export const receiptValidatorRegistryProvider: Provider = {
  provide: RECEIPT_VALIDATOR_REGISTRY,
  useFactory: (
    appStore: AppStoreReceiptValidator,
    playStore: PlayStoreReceiptValidator,
    stripe: StripeReceiptValidator,
  ): ReceiptValidatorRegistry => ({
    ios: appStore,
    android: playStore,
    stripe: stripe,
  }),
  inject: [
    AppStoreReceiptValidator,
    PlayStoreReceiptValidator,
    StripeReceiptValidator,
  ],
};
