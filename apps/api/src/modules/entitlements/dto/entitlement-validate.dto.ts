import { createZodDto } from 'nestjs-zod';
import { EntitlementValidateRequestSchema } from '@forja/schema';

export class EntitlementValidateDto extends createZodDto(
  EntitlementValidateRequestSchema,
) {}
