/**
 * Projector — ADR-0002
 * `calcularFicha` é a única forma de obter o estado da ficha: sempre uma
 * projeção recalculada a partir do log de eventos, nunca uma fonte de
 * verdade própria. Função pura: mesma entrada → mesma saída (RF-036 aplica
 * ao motor narrativo, mas o princípio de pureza vale aqui igualmente).
 */
import { aplicarEvento, estadoInicial } from './reducers';
import type { DiaryEvent, Ficha } from '../types';

/**
 * Recalcula a ficha (atributos, Vontade, Fôlego, ciclo, cooldowns de Marco)
 * a partir do log completo de eventos do diário, em ordem de ocorrência.
 *
 * @param eventos Log de `diary_events` do usuário, em ordem cronológica
 * @returns Ficha projetada
 */
export function calcularFicha(eventos: DiaryEvent[]): Ficha {
  let estado = estadoInicial();

  for (const evento of eventos) {
    estado = aplicarEvento(estado, evento);
  }

  return estado.ficha;
}
