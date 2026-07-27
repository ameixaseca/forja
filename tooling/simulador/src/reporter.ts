import { writeFileSync } from 'node:fs';

import type { SimulationReport } from '@forja/motor-narrativo';
import chalk from 'chalk';

const RATIO_MIN = 0.15;
const RATIO_MAX = 0.3;

export class Reporter {
  constructor(private report: SimulationReport) {}

  printConsole(): void {
    const { vistos, nunca_vistos, razao_vistos_escritos, resolutions } = this.report;

    console.log(chalk.bold('\nRelatório de Simulação\n'));
    console.log(`Resoluções: ${resolutions.length}`);
    console.log(`Vistos: ${vistos.length}`);
    console.log(`Nunca vistos: ${nunca_vistos.length}`);
    console.log(`Razão vistos/escritos: ${(razao_vistos_escritos * 100).toFixed(1)}%`);

    if (razao_vistos_escritos < RATIO_MIN || razao_vistos_escritos > RATIO_MAX) {
      console.log(chalk.yellow('\n⚠ Razão fora do intervalo esperado (15%-30%)'));
    } else {
      console.log(chalk.green('\n✔ Razão dentro do esperado'));
    }

    if (nunca_vistos.length > 0) {
      console.log(chalk.dim(`\nNunca vistos: ${nunca_vistos.join(', ')}`));
    }
  }

  buildHTML(): string {
    const { nunca_vistos, razao_vistos_escritos } = this.report;
    return `<!DOCTYPE html>
<html>
<head><title>Relatório de Simulação</title></head>
<body>
  <h1>Relatório</h1>
  <p>Razão vistos/escritos: ${(razao_vistos_escritos * 100).toFixed(1)}%</p>
  <h2>Nunca vistos (${nunca_vistos.length})</h2>
  <ul>${nunca_vistos.map((id) => `<li>${id}</li>`).join('')}</ul>
</body>
</html>
`;
  }

  saveHTML(path: string): void {
    writeFileSync(path, this.buildHTML());
    console.log(chalk.green(`\nRelatório salvo: ${path}`));
  }
}

export function isRatioInBand(razao: number): boolean {
  return razao >= RATIO_MIN && razao <= RATIO_MAX;
}
