import { z } from 'zod';

export const DiaryEventExportSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  payload: z.record(z.unknown()),
  payload_cifrado: z.boolean(),
  device_id: z.string(),
  app_version: z.string(),
  ocorrido_em: z.string().datetime(),
  recebido_em: z.string().datetime(),
});

export const ConsentEventExportSchema = z.object({
  id: z.string().uuid(),
  tipo: z.string(),
  acao: z.string(),
  politica_versao: z.string(),
  ocorrido_em: z.string().datetime(),
});

export const ProfileExportSchema = z.object({
  id: z.string().uuid(),
  faixa_etaria_confirmada_em: z.string().datetime(),
  idioma: z.string(),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

export const EntitlementExportSchema = z.object({
  id: z.string().uuid(),
  pacote: z.string(),
  origem: z.string(),
  status: z.string(),
  valido_ate: z.string().datetime().nullable(),
  transacao_externa_id: z.string().nullable(),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

export const PurchaseReceiptExportSchema = z.object({
  id: z.string().uuid(),
  origem: z.string(),
  payload_bruto: z.record(z.unknown()),
  status_verificacao: z.string(),
  verificado_em: z.string().datetime().nullable(),
  entitlement_id: z.string().uuid().nullable(),
  criado_em: z.string().datetime(),
});

export const DataExportResponseSchema = z.object({
  diary_events: z.array(DiaryEventExportSchema),
  consent_events: z.array(ConsentEventExportSchema),
  profile: ProfileExportSchema.nullable(),
  entitlements: z.array(EntitlementExportSchema),
  purchase_receipts: z.array(PurchaseReceiptExportSchema),
});
export type DataExportResponse = z.infer<typeof DataExportResponseSchema>;
