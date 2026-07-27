/**
 * Contrato de schema compartilhado cliente↔API (ADR-0009).
 * Pure Zod, sem deps de runtime de plataforma.
 */

export {
  EntitlementPlatformSchema,
  EntitlementValidateRequestSchema,
  EntitlementValidateResponseSchema,
} from './entitlements';
export type {
  EntitlementPlatform,
  EntitlementValidateRequest,
  EntitlementValidateResponse,
} from './entitlements';

export {
  DiaryEventExportSchema,
  ConsentEventExportSchema,
  ProfileExportSchema,
  EntitlementExportSchema,
  PurchaseReceiptExportSchema,
  DataExportResponseSchema,
} from './data-export';
export type { DataExportResponse } from './data-export';
