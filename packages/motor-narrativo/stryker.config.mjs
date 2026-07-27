// resolve() implemented (Phase 2). break=60 matches @forja/dominio convention (AGENTS.md).
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: ['src/**/*.ts'],
  reporters: ['html', 'clear-text', 'progress'],
  thresholds: {
    break: 60,
    low: 60,
    high: 80,
  },
};
