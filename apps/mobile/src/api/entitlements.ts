import type { EntitlementPlatform, EntitlementValidateResponse } from '@forja/schema';
import { getAccessToken } from '../lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * `POST /entitlements/validate` de `apps/api`, autenticado com o JWT de
 * sessão do Supabase Auth (ADR-0011 — API valida, não reimplementa auth
 * própria). Contrato de request/response conferido contra
 * `packages/schema/src/entitlements.ts` (fonte de verdade compartilhada).
 */
export async function validarEntitlement(
  platform: EntitlementPlatform,
  receipt: string,
): Promise<EntitlementValidateResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada — faça login novamente para validar sua compra');
  }
  const response = await fetch(`${API_BASE_URL}/entitlements/validate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platform, receipt }),
  });
  if (!response.ok) {
    throw new Error(`Falha ao validar compra (${response.status})`);
  }
  return response.json();
}
