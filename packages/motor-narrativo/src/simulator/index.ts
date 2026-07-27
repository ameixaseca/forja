import { resolve } from '../resolve';
import type { Catalog, Policy, ResolutionResult, State } from '../types';
import { ConstantePolicy, ErraticoPolicy, IntermitentePolicy, type PolicyGenerator } from './policies';

export interface SimulationReport {
  resolutions: ResolutionResult[];
  vistos: string[];
  nunca_vistos: string[];
  razao_vistos_escritos: number;
}

const RESOLUTIONS_PER_CICLO = 4;

export function simulate(catalog: Catalog, seed: number, n: number, policy: Policy): SimulationReport {
  const policyGen = createPolicyGenerator(policy);

  let state: State = {
    qualities: {
      'cap.atual': 1,
      'cap.resolucoes': 0,
      'cap.estagio': 'exploracao',
      'sys.resolucoes': 0,
    },
  };

  const resolutions: ResolutionResult[] = [];
  let currentSeed = seed;

  for (let i = 0; i < n; i += 1) {
    const ciclo = Math.floor(i / RESOLUTIONS_PER_CICLO);
    const inputs = policyGen.nextInputs(ciclo, i % RESOLUTIONS_PER_CICLO);

    const result = resolve(catalog, state, inputs, currentSeed);
    resolutions.push(result);

    state = result.newState;
    currentSeed += 1;
  }

  const uniqueVistos = Array.from(new Set(resolutions.map((r) => r.storylet.id)));
  const todosIds = catalog.storylets.map((st) => st.id);
  const nuncaVistos = todosIds.filter((id) => !uniqueVistos.includes(id));

  return {
    resolutions,
    vistos: uniqueVistos,
    nunca_vistos: nuncaVistos,
    razao_vistos_escritos: uniqueVistos.length / todosIds.length,
  };
}

function createPolicyGenerator(policy: Policy): PolicyGenerator {
  switch (policy) {
    case 'constante':
      return new ConstantePolicy();
    case 'erratico':
      return new ErraticoPolicy();
    case 'intermitente':
      return new IntermitentePolicy();
    default:
      throw new Error(`Policy ${policy} not implemented`);
  }
}
