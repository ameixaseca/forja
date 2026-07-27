import { describe, it, expect } from 'vitest';
import { calcularFicha, type DiaryEvent } from '../src/index';

function evento(tipo: DiaryEvent['tipo'], ocorridoEm: string, payload: Record<string, unknown> = {}): DiaryEvent {
  return { id: `${tipo}-${ocorridoEm}`, tipo, ocorridoEm, payload };
}

describe('calcularFicha', () => {
  it('ADR-0002: replay de dois ciclos projeta ficha final consistente', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 3 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('sessao_registrada', '2026-01-03'),
      evento('sessao_registrada', '2026-01-05'),
      evento('marco_declarado', '2026-01-05', { rotulo: 'agachamento', atributo: 'forca' }),
      evento('ciclo_encerrado', '2026-01-08'),
      evento('sessao_registrada', '2026-01-09'),
      evento('sessao_registrada', '2026-01-11'),
      evento('sessao_registrada', '2026-01-13'),
      evento('marco_declarado', '2026-01-13', { rotulo: 'agachamento', atributo: 'forca' }),
      evento('ciclo_encerrado', '2026-01-15'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.cicloAtual).toBe(3);
    expect(ficha.ciclosCumpridos).toBe(2);
    expect(ficha.vontade).toBe(1); // PRD §4.4: +1 aos 2 ciclos cumpridos
    expect(ficha.folego).toBe(4); // D-044: teto de acúmulo
    expect(ficha.juramento).toEqual({
      diasPorSemana: 3,
      dataInicio: new Date('2026-01-01'),
      dataFim: new Date('2026-01-01'),
    });
    // RF-043/DI-008: segundo Marco no mesmo rótulo cai em cooldown, não contabiliza.
    expect(ficha.atributos.forca).toBe(0);
    expect(ficha.cooldownMarcos.agachamento).toBe(4);
  });

  it('RF-042/RF-049: 3 Marcos contabilizados no mesmo atributo somam +1 ponto', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 1 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('marco_declarado', '2026-01-01', { rotulo: 'agachamento', atributo: 'forca' }),
      evento('ciclo_encerrado', '2026-01-08'),

      evento('sessao_registrada', '2026-01-09'),
      evento('marco_declarado', '2026-01-09', { rotulo: 'supino', atributo: 'forca' }),
      evento('ciclo_encerrado', '2026-01-15'),

      evento('sessao_registrada', '2026-01-16'),
      evento('marco_declarado', '2026-01-16', { rotulo: 'levantamento-terra', atributo: 'forca' }),
      evento('ciclo_encerrado', '2026-01-22'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.atributos.forca).toBe(1);
  });

  it('RF-044: Marco declarado em ciclo não cumprido não é contabilizado', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 5 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('marco_declarado', '2026-01-01', { rotulo: 'agachamento', atributo: 'forca' }),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.ciclosCumpridos).toBe(0);
    expect(ficha.atributos.forca).toBe(0);
  });

  it('é uma função pura: mesma entrada produz mesma saída e não muta o log', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 2 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('sessao_registrada', '2026-01-02'),
    ];
    const copia = JSON.parse(JSON.stringify(eventos));

    const primeira = calcularFicha(eventos);
    const segunda = calcularFicha(eventos);

    expect(primeira).toEqual(segunda);
    expect(eventos).toEqual(copia);
  });

  it('RN-038: Trégua declarada no ciclo impede contagem de cumprido e Fôlego', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 3 }),
      evento('tregua_declarada', '2026-01-01'),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.ciclosCumpridos).toBe(0);
    expect(ficha.folego).toBe(0);
    expect(ficha.cicloAtual).toBe(2);
  });

  it('RF-007A: Trégua de Recuperação declarada no ciclo também não conta como cumprido', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 3 }),
      evento('tregua_recuperacao_declarada', '2026-01-01'),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.ciclosCumpridos).toBe(0);
    expect(ficha.folego).toBe(0);
  });

  it('RF-082: deload declarado no ciclo dobra o teto de Fôlego ganho', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 2 }),
      evento('deload_declarado', '2026-01-01'),
      evento('sessao_registrada', '2026-01-01'),
      evento('sessao_registrada', '2026-01-02'),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.ciclosCumpridos).toBe(1);
    expect(ficha.folego).toBe(4); // teto normal seria 2 (7-2 dias de descanso, limitado a 2)
  });

  it('RF-005: troca de Juramento em ciclo já com sessão registrada é ignorada pelo replay', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 3 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('juramento_declarado', '2026-01-02', { diasPorSemana: 6 }),
      evento('sessao_registrada', '2026-01-03'),
      evento('sessao_registrada', '2026-01-04'),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    // Se a segunda declaração tivesse sido aceita (6 dias), o ciclo com 3
    // sessões não seria cumprido. Fica valendo o Juramento original (3 dias).
    expect(ficha.juramento?.diasPorSemana).toBe(3);
    expect(ficha.ciclosCumpridos).toBe(1);
  });

  it('RN-001: ciclo_encerrado sem Juramento declarado não gera progresso nem Fôlego', () => {
    const eventos: DiaryEvent[] = [evento('ciclo_encerrado', '2026-01-08')];

    const ficha = calcularFicha(eventos);

    expect(ficha.ciclosCumpridos).toBe(0);
    expect(ficha.folego).toBe(0);
    expect(ficha.vontade).toBe(0);
  });

  it('RF-004: juramento_declarado com dias fora de 1-6 é ignorado no replay', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 999 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.juramento).toBeNull();
    expect(ficha.ciclosCumpridos).toBe(0);
  });

  it('marco_declarado com atributo desconhecido aplica cooldown mas não é contabilizado', () => {
    const eventos: DiaryEvent[] = [
      evento('juramento_declarado', '2026-01-01', { diasPorSemana: 1 }),
      evento('sessao_registrada', '2026-01-01'),
      evento('marco_declarado', '2026-01-01', { rotulo: 'agachamento', atributo: 'carisma' }),
      evento('ciclo_encerrado', '2026-01-08'),
    ];

    const ficha = calcularFicha(eventos);

    expect(ficha.ciclosCumpridos).toBe(1);
    expect(ficha.atributos).toEqual({ forca: 0, vigor: 0, destreza: 0 });
    expect(ficha.cooldownMarcos.agachamento).toBe(3);
  });

  it.each(['vigor', 'destreza'] as const)('RF-049: 3 Marcos válidos em %s convertem em ponto (não tratados como atributo desconhecido)', (atributo) => {
    const eventos: DiaryEvent[] = [evento('juramento_declarado', '2026-01-01', { diasPorSemana: 1 })];
    let dia = 1;
    for (const rotulo of ['a', 'b', 'c']) {
      const data = `2026-01-${String(dia).padStart(2, '0')}`;
      eventos.push(evento('sessao_registrada', data));
      eventos.push(evento('marco_declarado', data, { rotulo, atributo }));
      eventos.push(evento('ciclo_encerrado', `2026-01-${String(dia + 6).padStart(2, '0')}`));
      dia += 7;
    }

    const ficha = calcularFicha(eventos);

    expect(ficha.atributos[atributo]).toBe(1);
  });
});
