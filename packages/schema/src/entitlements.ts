import { z } from 'zod';

export const EntitlementPlatformSchema = z.enum(['ios', 'android', 'stripe']);
export type EntitlementPlatform = z.infer<typeof EntitlementPlatformSchema>;

export const EntitlementValidateRequestSchema = z.object({
  platform: EntitlementPlatformSchema,
  receipt: z.string().min(1),
});
export type EntitlementValidateRequest = z.infer<typeof EntitlementValidateRequestSchema>;

export const EntitlementValidateResponseSchema = z.object({
  valid: z.boolean(),
  product_id: z.string().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});
export type EntitlementValidateResponse = z.infer<typeof EntitlementValidateResponseSchema>;
