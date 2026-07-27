import { Module } from '@nestjs/common';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';
import { LgpdController } from './lgpd.controller';
import { LgpdService } from './lgpd.service';

@Module({
  controllers: [LgpdController],
  providers: [SupabaseServiceRoleClient, LgpdService],
})
export class LgpdModule {}
