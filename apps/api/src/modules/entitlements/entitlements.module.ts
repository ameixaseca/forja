import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';
import { EntitlementsController } from './entitlements.controller';
import { EntitlementsService } from './entitlements.service';
import { receiptValidatorRegistryProvider } from './receipt-validator.registry.provider';
import { AppStoreReceiptValidator } from './validators/app-store-receipt-validator';
import { PlayStoreReceiptValidator } from './validators/play-store-receipt-validator';
import { StripeReceiptValidator } from './validators/stripe-receipt-validator';

@Module({
  imports: [
    // /entitlements/validate chama APIs pagas de terceiros (Apple/Google/Stripe)
    // por request; limite conservador para conter abuso e proteger cota externa.
    // ThrottlerGuard é aplicado só no EntitlementsController (@UseGuards), não via
    // APP_GUARD — esse token é sempre global no Nest independente do módulo que o
    // registra, o que afetaria /health e /data-export indevidamente.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
  ],
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
