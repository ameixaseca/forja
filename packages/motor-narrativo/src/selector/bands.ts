import type { Band, Inputs, State, Storylet } from '../types';
import { filterEligible } from './eligibility';

export function selectBand(
  catalog: Storylet[],
  state: State,
  inputs: Inputs,
  killSwitch: string[],
): { band: Band; pool: Storylet[] } {
  if (inputs.tregua || inputs.sessao_secundaria) {
    return { band: 'Cor', pool: filterByBand(catalog, 'Cor', state, inputs, killSwitch) };
  }

  const poolEspinha = filterByBand(catalog, 'Espinha', state, inputs, killSwitch);
  if (poolEspinha.length > 0) {
    return { band: 'Espinha', pool: poolEspinha };
  }

  const poolArco = filterByBand(catalog, 'Arco', state, inputs, killSwitch);
  if (poolArco.length > 0) {
    if (state.qualities['cap.estagio'] === 'pressao') {
      const closures = poolArco.filter((storylet) => storylet.id.includes('closure'));
      if (closures.length > 0) {
        return { band: 'Arco', pool: closures };
      }
    }
    return { band: 'Arco', pool: poolArco };
  }

  return { band: 'Cor', pool: filterByBand(catalog, 'Cor', state, inputs, killSwitch) };
}

function filterByBand(
  catalog: Storylet[],
  band: Band,
  state: State,
  inputs: Inputs,
  killSwitch: string[],
): Storylet[] {
  return filterEligible(
    catalog.filter((storylet) => storylet.banda === band),
    state,
    inputs,
    killSwitch,
  );
}
