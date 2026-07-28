import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    // tsconfig usa `jsx: "react-native"` (transform clássico, exige `React`
    // em escopo) — necessário só a partir do teste de CampaignContext.tsx
    // (primeiro .tsx importado por um teste; hooks .ts não precisam disso).
    // Runtime automático evita depender de import de React nos módulos
    // testados, sem alterar o transform real do Metro/Expo em produção.
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.integration.spec.ts'],
  },
});
