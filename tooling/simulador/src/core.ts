import { simulate, type Catalog, type Policy } from '@forja/motor-narrativo';

export const POLICIES_VALIDAS: Policy[] = ['constante', 'erratico', 'especialista', 'pessimo', 'intermitente'];

export function isValidPolicy(value: string): value is Policy {
  return (POLICIES_VALIDAS as string[]).includes(value);
}

export function runSimulation(catalog: Catalog, seed: number, runs: number, policy: string) {
  if (!isValidPolicy(policy)) {
    throw new Error(`Política inválida: "${policy}". Válidas: ${POLICIES_VALIDAS.join('|')}`);
  }
  return simulate(catalog, seed, runs, policy);
}
