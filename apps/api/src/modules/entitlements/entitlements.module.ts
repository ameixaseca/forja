import { Module } from '@nestjs/common';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';
import { EntitlementsController } from './entitlements.controller';
import { EntitlementsService } from './entitlements.service';
import { receiptValidatorRegistryProvider } from './receipt-validator.registry.provider';
import { AppStoreReceiptValidator } from './validators/app-store-receipt-validator';
import { PlayStoreReceiptValidator } from './validators/play-store-receipt-validator';
import { StripeReceiptValidator } from './validators/stripe-receipt-validator';

@Module({
  controllers: [EntitlementsController],
  providers: [
    SupabaseServiceRoleClient,
    EntitlementsService,
    AppStoreReceiptValidator,
    PlayStoreReceiptValidator,
    StripeReceiptValidator,
    receiptValidatorRegistryProvider,
  ],
})
export class EntitlementsModule {}
