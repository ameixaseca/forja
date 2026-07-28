import { getAccessToken } from '../lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * `GET /data-export` de `apps/api`, autenticado com o JWT de sessão do
 * Supabase Auth (ADR-0011 — API valida, não reimplementa auth própria).
 * Implementação mínima exigida pela ConfigScreen (Grupo 5, spec
 * mobile-app-shell "Exportação LGPD via apps/api"); testes unitários e de
 * integração contra `apps/api` real ficam no Grupo 6 (tasks.md 6.3/6.4).
 */
export async function exportarDadosLGPD(): Promise<unknown> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada — faça login novamente para exportar seus dados');
  }
  const response = await fetch(`${API_BASE_URL}/data-export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Falha ao exportar dados (${response.status})`);
  }
  return response.json();
}
