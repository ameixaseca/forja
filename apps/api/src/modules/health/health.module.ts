import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';

@Module({
  controllers: [HealthController],
  providers: [SupabaseServiceRoleClient],
})
export class HealthModule {}
