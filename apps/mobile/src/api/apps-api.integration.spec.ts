import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EntitlementValidateRequestSchema } from '@forja/schema';

/**
 * Integration test: `src/api/entitlements.ts` e `src/api/lgpd.ts` reais
 * (fetch real, parsing real) cruzando a fronteira de rede contra um
 * servidor HTTP local que reimplementa o contrato de `apps/api`
 * validado contra `@forja/schema` (fonte de verdade compartilhada) e
 * contra `apps/api/test/e2e/{entitlements,lgpd}.e2e-spec.ts` (formas de
 * response conferidas manualmente).
 *
 * Não sobe o NestJS real: o repo não tem docker-compose nem stack local
 * provisionada para `apps/api` (mesmo gap já registrado em 3.5 para
 * Supabase) — servidor HTTP puro aqui evita também acoplar o typecheck
 * de `apps/mobile` ao código-fonte de `apps/api` (rootDir/tsconfig
 * distintos). Não verifica AuthGuard/RLS/DB reais — gap registrado,
 * mesmo racional de 3.5.
 */

const supabaseMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../lib/supabase', () => supabaseMocks);

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
      res.writeHead(401).end();
      return;
    }

    if (req.method === 'POST' && req.url === '/entitlements/validate') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const parsed = EntitlementValidateRequestSchema.safeParse(JSON.parse(body));
        if (!parsed.success) {
          res.writeHead(400).end();
          return;
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: true, product_id: 'forja_campaign_espinha', expires_at: null }));
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/data-export') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          diary_events: [],
          consent_events: [],
          profile: null,
          entitlements: [],
          purchase_receipts: [],
        }),
      );
      return;
    }

    res.writeHead(404).end();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('endereço de teste inválido');
  baseUrl = `http://127.0.0.1:${address.port}`;
  process.env.EXPO_PUBLIC_API_URL = baseUrl;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetModules();
});

describe('validarEntitlement × servidor HTTP real', () => {
  it('envia o corpo no formato validado por EntitlementValidateRequestSchema e recebe a resposta real', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-integration');
    const { validarEntitlement } = await import('./entitlements');

    const resultado = await validarEntitlement('ios', 'recibo-base64');

    expect(resultado).toEqual({
      valid: true,
      product_id: 'forja_campaign_espinha',
      expires_at: null,
    });
  });

  it('servidor rejeita requisição sem Authorization com 401 (contrato real do AuthGuard)', async () => {
    const response = await fetch(`${baseUrl}/entitlements/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'ios', receipt: 'recibo-base64' }),
    });

    expect(response.status).toBe(401);
  });
});

describe('exportarDadosLGPD × servidor HTTP real', () => {
  it('busca /data-export real e retorna o export vazio no formato do e2e de apps/api', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-integration');
    const { exportarDadosLGPD } = await import('./lgpd');

    const dados = await exportarDadosLGPD();

    expect(dados).toEqual({
      diary_events: [],
      consent_events: [],
      profile: null,
      entitlements: [],
      purchase_receipts: [],
    });
  });
});
