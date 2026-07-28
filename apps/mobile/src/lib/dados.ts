/** 2d6 físico simulado pelo app — fora de `@forja/motor-narrativo` (RF-036: motor não tem RNG ambiente, só o `seed` que recebe). */
export function rolar2d6(): number {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2;
}
