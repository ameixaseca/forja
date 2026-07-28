import type { Catalog } from '@forja/motor-narrativo';
import catalogJson from './catalog.json';

/**
 * PLACEHOLDER: não existe catálogo de storylets real em `content/` neste
 * monorepo ainda — só fixtures de teste (`packages/motor-narrativo/tests/fixtures`,
 * `tooling/*\/testes/fixtures`). `catalog.json` é uma cópia do fixture mínimo
 * válido usado nos testes do motor, embarcada aqui só para o app compilar e
 * rodar fim-a-fim (D-036: catálogo estático no binário, sem fetch).
 * SUBSTITUIR pelo catálogo real assim que a equipe de conteúdo entregar
 * (ver design.md de `fase-6-mobile-mvp`, decisão D6 — flag registrada lá).
 */
export const catalog: Catalog = catalogJson as Catalog;
