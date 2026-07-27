import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Catalog } from '@forja/motor-narrativo';
import { describe, expect, it, afterEach } from 'vitest';

import { POLICIES_VALIDAS, runSimulation } from '../src/core';
import { Reporter } from '../src/reporter';

const catalog: Catalog = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'catalogo-sintetico.json'), 'utf-8'),
);

describe('runSimulation', () => {
  it.each(POLICIES_VALIDAS)('roda a política %s com runs=50 e razão dentro de 15%%-30%%', (policy) => {
    const report = runSimulation(catalog, 42, 50, policy);

    expect(report.resolutions).toHaveLength(50);
    expect(report.razao_vistos_escritos).toBeGreaterThanOrEqual(0.15);
    expect(report.razao_vistos_escritos).toBeLessThanOrEqual(0.3);
  });

  it('rejeita política inválida antes de simular', () => {
    expect(() => runSimulation(catalog, 42, 50, 'inexistente')).toThrow(/Política inválida/);
  });
});

describe('Reporter', () => {
  const outputPath = join(__dirname, 'relatorio-teste.html');

  afterEach(() => {
    if (existsSync(outputPath)) unlinkSync(outputPath);
  });

  it('gera HTML com razão e lista de nunca vistos', () => {
    const report = runSimulation(catalog, 42, 50, 'constante');
    const reporter = new Reporter(report);

    reporter.saveHTML(outputPath);

    const html = readFileSync(outputPath, 'utf-8');
    expect(html).toContain('Razão vistos/escritos');
    for (const id of report.nunca_vistos) {
      expect(html).toContain(id);
    }
  });
});
