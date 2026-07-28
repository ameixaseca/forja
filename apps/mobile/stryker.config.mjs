export default {
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
  },
  plugins: ['@stryker-mutator/vitest-runner'],
  // Só código com lógica testável sem simulador (storage/sync). Telas React
  // Native e navegação (Expo Router) ficam fora — sem Detox nesta fase
  // (design.md, Non-Goals), mutar JSX sem esse harness não agrega sinal.
  mutate: [
    'src/storage/**/*.ts',
    'src/sync/**/*.ts',
    'src/narrative/**/*.ts',
    'src/hooks/**/*.ts',
    'src/lib/campaignInstance.ts',
    'src/api/**/*.ts',
    '!src/**/*.spec.ts',
    // ids.ts/dados.ts/supabase.ts ficam fora: wrappers finos de binding
    // nativo (expo-crypto, Math.random, supabase-js client) sem lógica
    // própria a mutar — mesmo racional de excluir telas/JSX.
  ],
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },
  thresholds: {
    break: 60,
    low: 70,
    high: 80,
  },
};
