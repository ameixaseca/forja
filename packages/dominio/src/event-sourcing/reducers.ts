/**
 * Reducers do projector — um por `DiaryEventType` (ADR-0002).
 * Pure TS, no deps (D-033). Cada reducer assume o evento já validado na
 * borda de escrita (ex.: RF-005 — bloqueio de troca de Juramento em ciclo
 * em curso — é responsabilidade de quem grava o evento, não do replay).
 */
import type { Ciclo } from '../ciclo';
import { isCicloCumprido } from '../ciclo';
import { calcularFolego } from '../folego';
import { calcularVontade } from '../vontade';
import { aplicarCooldown, calcularPontosAtributo, limitarMarcosContabilizados, podeDeclararMarco } from '../marcos';
import { validarJuramento } from '../juramento';
import type { Atributo, DiaryEvent, Ficha } from '../types';

const ATRIBUTOS_VALIDOS: readonly Atributo[] = ['forca', 'vigor', 'destreza'];

function isAtributo(valor: unknown): valor is Atributo {
  return typeof valor === 'string' && (ATRIBUTOS_VALIDOS as readonly string[]).includes(valor);
}

interface MarcoPendente {
  atributo: Atributo;
  elegivel: boolean; // cooldown livre no momento da declaração (RF-043/DI-008)
}

export interface EstadoProjecao {
  ficha: Ficha;
  cicloEmAndamento: Ciclo;
  marcosPendentesCiclo: MarcoPendente[];
  marcosContabilizadosAcumulados: Record<Atributo, number>;
}

export function estadoInicial(): EstadoProjecao {
  return {
    ficha: {
      atributos: { forca: 0, vigor: 0, destreza: 0 },
      vontade: 0,
      folego: 0,
      cicloAtual: 1,
      ciclosCumpridos: 0,
      juramento: null,
      cooldownMarcos: {},
    },
    cicloEmAndamento: cicloVazio(1, null),
    marcosPendentesCiclo: [],
    marcosContabilizadosAcumulados: { forca: 0, vigor: 0, destreza: 0 },
  };
}

function cicloVazio(numero: number, juramento: Ciclo['juramento'] | null): Ciclo {
  return {
    numero,
    // Ciclo sem Juramento declarado ainda não progride (RN-001: 0 dias jurados → progressão 0).
    juramento: juramento ?? { diasPorSemana: 0, dataInicio: new Date(0), dataFim: new Date(0) },
    diasTreinados: 0,
    diasJurados: juramento?.diasPorSemana ?? 0,
    // Placeholder: nunca lido pelo projector — a fonte de verdade de
    // conclusão é sempre isCicloCumprido(ciclo), recalculada sob demanda.
    cumprido: false,
    tregua: false,
    treguaRecuperacao: false,
    deload: false,
  };
}

export function aplicarEvento(estado: EstadoProjecao, evento: DiaryEvent): EstadoProjecao {
  switch (evento.tipo) {
    case 'juramento_declarado':
      return reduzJuramentoDeclarado(estado, evento);
    case 'sessao_registrada':
      return reduzSessaoRegistrada(estado);
    case 'tregua_declarada':
      return reduzFlagCiclo(estado, 'tregua');
    case 'tregua_recuperacao_declarada':
      return reduzFlagCiclo(estado, 'treguaRecuperacao');
    case 'deload_declarado':
      return reduzFlagCiclo(estado, 'deload');
    case 'marco_declarado':
      return reduzMarcoDeclarado(estado, evento);
    case 'ciclo_encerrado':
      return reduzCicloEncerrado(estado);
    default:
      return estado;
  }
}

function reduzJuramentoDeclarado(estado: EstadoProjecao, evento: DiaryEvent): EstadoProjecao {
  // RF-005: troca de Juramento em ciclo já em curso é ignorada pelo replay
  // (deveria ter sido rejeitada na escrita do evento).
  if (estado.cicloEmAndamento.diasTreinados > 0) return estado;

  const diasPorSemana = Number(evento.payload.diasPorSemana);
  // RF-004: evento malformado ou fora de 1-6 dias/semana é ignorado no replay
  // em vez de propagar NaN/valor inválido para o cálculo de progressão.
  if (!validarJuramento(diasPorSemana)) return estado;

  const juramento = {
    diasPorSemana,
    dataInicio: new Date(evento.ocorridoEm),
    dataFim: new Date(evento.ocorridoEm),
  };

  return {
    ...estado,
    ficha: { ...estado.ficha, juramento },
    cicloEmAndamento: { ...estado.cicloEmAndamento, juramento, diasJurados: diasPorSemana },
  };
}

function reduzSessaoRegistrada(estado: EstadoProjecao): EstadoProjecao {
  // RF-053: sessão composta por múltiplos blocos ainda conta como 1 dia do Juramento.
  return {
    ...estado,
    cicloEmAndamento: {
      ...estado.cicloEmAndamento,
      diasTreinados: estado.cicloEmAndamento.diasTreinados + 1,
    },
  };
}

function reduzFlagCiclo(estado: EstadoProjecao, flag: 'tregua' | 'treguaRecuperacao' | 'deload'): EstadoProjecao {
  return {
    ...estado,
    cicloEmAndamento: { ...estado.cicloEmAndamento, [flag]: true },
  };
}

function reduzMarcoDeclarado(estado: EstadoProjecao, evento: DiaryEvent): EstadoProjecao {
  const rotulo = String(evento.payload.rotulo);
  const atributo = evento.payload.atributo;
  // Atributo inválido/desconhecido: registra o cooldown do rótulo (DI-008)
  // mas não entra na lista de pendentes de conversão em pontos.
  if (!isAtributo(atributo)) {
    return {
      ...estado,
      ficha: { ...estado.ficha, cooldownMarcos: aplicarCooldown(rotulo, estado.ficha.cicloAtual, estado.ficha.cooldownMarcos) },
    };
  }

  const elegivel = podeDeclararMarco(rotulo, estado.ficha.cicloAtual, estado.ficha.cooldownMarcos);

  // DI-008: cooldown inicia na declaração, contabilizado ou não (RF-044).
  const cooldownMarcos = aplicarCooldown(rotulo, estado.ficha.cicloAtual, estado.ficha.cooldownMarcos);

  return {
    ...estado,
    ficha: { ...estado.ficha, cooldownMarcos },
    marcosPendentesCiclo: [...estado.marcosPendentesCiclo, { atributo, elegivel }],
  };
}

function reduzCicloEncerrado(estado: EstadoProjecao): EstadoProjecao {
  const ciclo = estado.cicloEmAndamento;
  const cumprido = isCicloCumprido(ciclo);
  const folegoGanho = calcularFolego(ciclo);
  const ciclosCumpridos = estado.ficha.ciclosCumpridos + (cumprido ? 1 : 0);

  // RF-044: Marco só é contabilizado em ciclo cumprido; excedente acima do
  // teto (RF-042) e Marcos bloqueados por cooldown ficam registrados, não contabilizados.
  const elegiveisNaOrdem = estado.marcosPendentesCiclo.filter((m) => m.elegivel);
  const quantosContabilizar = cumprido ? limitarMarcosContabilizados(elegiveisNaOrdem.length) : 0;
  const contabilizados = elegiveisNaOrdem.slice(0, quantosContabilizar);

  const marcosContabilizadosAcumulados = { ...estado.marcosContabilizadosAcumulados };
  for (const marco of contabilizados) {
    marcosContabilizadosAcumulados[marco.atributo] += 1;
  }

  // Base sempre 0: calcularPontosAtributo recomputa o bônus inteiro a partir
  // do total acumulado a cada fechamento (idempotente), não incrementa sobre
  // o valor anterior — não há um "atributo base" além dos Marcos rastreado
  // nesta fase. Se isso mudar, esta chamada precisa passar a base real.
  const atributos = {
    forca: calcularPontosAtributo(marcosContabilizadosAcumulados.forca, 0),
    vigor: calcularPontosAtributo(marcosContabilizadosAcumulados.vigor, 0),
    destreza: calcularPontosAtributo(marcosContabilizadosAcumulados.destreza, 0),
  };

  const proximoCicloAtual = estado.ficha.cicloAtual + 1;

  return {
    ficha: {
      ...estado.ficha,
      atributos,
      vontade: calcularVontade(ciclosCumpridos),
      folego: Math.min(estado.ficha.folego + folegoGanho, 4),
      cicloAtual: proximoCicloAtual,
      ciclosCumpridos,
    },
    // Próximo ciclo carrega o mesmo Juramento até nova declaração (RF-005).
    // `numero` deriva de ficha.cicloAtual — fonte única, evita desincronizar
    // os dois contadores.
    cicloEmAndamento: cicloVazio(proximoCicloAtual, ciclo.juramento),
    marcosPendentesCiclo: [],
    marcosContabilizadosAcumulados,
  };
}
