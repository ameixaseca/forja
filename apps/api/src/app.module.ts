import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { EntitlementsModule } from './modules/entitlements/entitlements.module';
import { LgpdModule } from './modules/lgpd/lgpd.module';

@Module({
  imports: [HealthModule, EntitlementsModule, LgpdModule],
})
export class AppModule {}
