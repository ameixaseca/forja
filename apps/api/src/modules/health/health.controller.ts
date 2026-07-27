import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';

@Controller('health')
export class HealthController {
  constructor(private readonly supabase: SupabaseServiceRoleClient) {}

  @Get()
  async check(@Res() res: FastifyReply) {
    const { error } = await this.supabase.client
      .from('profiles')
      .select('id')
      .limit(1);
    if (error) {
      return res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .send({ status: 'erro', detalhe: error.message });
    }
    return res.status(HttpStatus.OK).send({ status: 'ok' });
  }
}
