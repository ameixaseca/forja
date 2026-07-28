import { createElement, type FC } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

/**
 * `@testing-library/react-hooks` está descontinuado e RTL completo traria
 * dependência de renderização de UI que este pacote ainda não precisa
 * (7 telas ainda não existem — Grupo 5). Harness mínimo equivalente,
 * usado só para testar os hooks isoladamente (D-033: hooks são a única
 * camada de integração com motor/domínio, testável sem tela).
 */
export function renderHook<TProps, TResult>(
  callback: (props: TProps) => TResult,
  initialProps: TProps,
) {
  const result: { current: TResult } = { current: undefined as unknown as TResult };

  const TestComponent: FC<TProps> = (props) => {
    result.current = callback(props);
    return null;
  };

  // `createElement`'s overloads não conseguem inferir `TProps` genérico contra
  // a assinatura fixa de `FunctionComponent<{}>` — cast local, tipagem pública
  // do harness (`renderHook<TProps, TResult>`) continua forte.
  const element = createElement as (
    component: FC<TProps>,
    props: TProps,
  ) => ReturnType<typeof createElement>;

  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element(TestComponent, initialProps));
  });

  return {
    result,
    rerender: (props: TProps) =>
      act(() => {
        renderer.update(element(TestComponent, props));
      }),
    unmount: () => act(() => renderer.unmount()),
  };
}

export { act };
