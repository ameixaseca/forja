import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '../../guards/auth.guard';
import type { AuthenticatedRequest } from '../../guards/auth.guard';
import { EntitlementValidateRequestSchema } from '@forja/schema';
import { EntitlementValidateDto } from './dto/entitlement-validate.dto';
import { EntitlementsService } from './entitlements.service';

@Controller('entitlements')
@UseGuards(AuthGuard, ThrottlerGuard)
export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Post('validate')
  @UsePipes(ZodValidationPipe)
  validate(
    @Req() request: AuthenticatedRequest,
    @Body() body: EntitlementValidateDto,
  ) {
    const { platform, receipt } = EntitlementValidateRequestSchema.parse(body);
    return this.entitlementsService.validate(request.userId, platform, receipt);
  }
}
