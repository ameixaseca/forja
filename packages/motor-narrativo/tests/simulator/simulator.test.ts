import { describe, expect, it } from 'vitest';

import { simulate } from '../../src/simulator';
import type { Catalog, Storylet } from '../../src/types';

function buildCatalog(count: number): Catalog {
  const storylets: Storylet[] = [
    {
      id: 'st_cor_fallback',
      banda: 'Cor',
      subclasse: null,
      capitulo: null,
      variantes: [{ texto: 'texto.fallback', efeitos: {} }],
    },
    ...Array.from({ length: count }, (_, index) => ({
      id: `st_cor_${index}`,
      banda: 'Cor' as const,
      subclasse: null,
      capitulo: null,
      variantes: [{ texto: `texto.cor.${index}`, efeitos: {} }],
    })),
  ];
  return { storylets };
}

describe('simulate', () => {
  it('executa n resoluções e retorna relatório com razão vistos/escritos', () => {
    const catalog = buildCatalog(20);

    const report = simulate(catalog, 1, 50, 'constante');

    expect(report.resolutions).toHaveLength(50);
    expect(report.razao_vistos_escritos).toBeGreaterThan(0);
    expect(report.razao_vistos_escritos).toBeLessThanOrEqual(1);
    expect(report.vistos.length + report.nunca_vistos.length).toBe(catalog.storylets.length);
  });

  it.each(['especialista', 'pessimo'] as const)('roda a política %s sem lançar erro', (policy) => {
    const catalog = buildCatalog(5);

    const report = simulate(catalog, 1, 10, policy);

    expect(report.resolutions).toHaveLength(10);
  });
});
