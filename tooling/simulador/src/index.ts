#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import type { Catalog } from '@forja/motor-narrativo';
import { Command } from 'commander';

import { POLICIES_VALIDAS, runSimulation } from './core';
import { Reporter } from './reporter';

const program = new Command();

program
  .name('simulate')
  .description('Simula N resoluções de um catálogo com uma política (RF-100 a RF-103)')
  .requiredOption('--catalog <path>', 'Caminho para o catálogo JSON')
  .requiredOption('--runs <n>', 'Número de resoluções', (v) => parseInt(v, 10))
  .requiredOption('--policy <name>', `Política: ${POLICIES_VALIDAS.join('|')}`)
  .option('--seed <n>', 'Seed inicial', (v) => parseInt(v, 10), 42)
  .option('--output <path>', 'Caminho para relatório HTML (opcional)')
  .action((opts: { catalog: string; runs: number; policy: string; seed: number; output?: string }) => {
    let catalog: Catalog;
    try {
      catalog = JSON.parse(readFileSync(opts.catalog, 'utf-8'));
    } catch (e) {
      console.error(`Erro ao carregar catálogo ${opts.catalog}: ${(e as Error).message}`);
      process.exit(1);
    }

    let report;
    try {
      report = runSimulation(catalog, opts.seed, opts.runs, opts.policy);
    } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }

    const reporter = new Reporter(report);
    reporter.printConsole();

    if (opts.output) {
      reporter.saveHTML(opts.output);
    }
  });

program.parse();
