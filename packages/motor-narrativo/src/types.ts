export interface State {
  /**
   * `string` values exist only for system-managed qualities under the `cap.`/`sys.`
   * prefixes (e.g. `cap.estagio`), set internally (see selector/bands.ts) — not by
   * authored storylet effects. `Variant.efeitos` and `Predicate.valor` intentionally
   * stay `number | boolean` only: authors cannot set or compare string qualities yet.
   */
  qualities: Record<string, number | boolean | string>;
}

export interface Inputs {
  rolagem: number;
  atributo: { forca: number; vigor: number; destreza: number };
  vontade: number;
  ciclo_cumprido: boolean;
  tregua: boolean;
  reencontro: boolean;
  sessao_secundaria: boolean;
}

export type Band = 'Espinha' | 'Arco' | 'Cor';

export type Subclass = 'ausencia' | 'marco' | 'sessao' | null;

export interface Predicate {
  qual: string;
  op: '==' | '!=' | '>' | '<' | '>=' | '<=';
  valor: number | boolean;
  e?: Predicate;
  ou?: Predicate;
}

export interface Variant {
  quando?: Predicate;
  texto: string;
  efeitos: Record<string, number | boolean>;
}

export interface Storylet {
  id: string;
  banda: Band;
  subclasse: Subclass;
  capitulo?: number;
  requer?: Predicate;
  variantes: Variant[];
}

export interface Catalog {
  storylets: Storylet[];
}

export interface ResolutionResult {
  storylet: Storylet;
  variant: Variant;
  texto: string;
  efeitos: Record<string, number | boolean>;
  newState: State;
}

export type Policy = 'constante' | 'erratico' | 'especialista' | 'pessimo' | 'intermitente';
