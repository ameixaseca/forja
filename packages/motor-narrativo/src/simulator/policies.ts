import type { Inputs } from '../types';

export interface PolicyGenerator {
  nextInputs(ciclo: number, resolucao: number): Inputs;
}

export class ConstantePolicy implements PolicyGenerator {
  nextInputs(): Inputs {
    return {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
  }
}

export class ErraticoPolicy implements PolicyGenerator {
  nextInputs(): Inputs {
    return {
      rolagem: Math.floor(Math.random() * 14) + 2,
      atributo: {
        forca: Math.floor(Math.random() * 6),
        vigor: Math.floor(Math.random() * 6),
        destreza: Math.floor(Math.random() * 6),
      },
      vontade: Math.floor(Math.random() * 4),
      ciclo_cumprido: Math.random() > 0.4,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
  }
}

export class EspecialistaPolicy implements PolicyGenerator {
  nextInputs(ciclo: number): Inputs {
    return {
      rolagem: 8,
      atributo: { forca: Math.min(ciclo, 5), vigor: 0, destreza: 0 },
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
  }
}

export class PessimoPolicy implements PolicyGenerator {
  nextInputs(): Inputs {
    return {
      rolagem: 2,
      atributo: { forca: 0, vigor: 0, destreza: 0 },
      vontade: 0,
      ciclo_cumprido: false,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
  }
}

export class IntermitentePolicy implements PolicyGenerator {
  nextInputs(ciclo: number, resolucao: number): Inputs {
    const tregua = ciclo > 0 && ciclo % 3 === 0;
    const reencontro = resolucao === 0 && ciclo > 0 && ciclo % 4 === 0;

    return {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: !tregua,
      tregua,
      reencontro,
      sessao_secundaria: false,
    };
  }
}
