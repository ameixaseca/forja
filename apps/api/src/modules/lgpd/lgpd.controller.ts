import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import type { AuthenticatedRequest } from '../../guards/auth.guard';
import { LgpdService } from './lgpd.service';

@Controller()
@UseGuards(AuthGuard)
export class LgpdController {
  constructor(private readonly lgpdService: LgpdService) {}

  @Get('data-export')
  exportarDados(@Req() request: AuthenticatedRequest) {
    return this.lgpdService.exportarDados(request.userId);
  }
}
