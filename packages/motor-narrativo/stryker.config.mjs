// Thresholds: break=0 because resolve() is unimplemented (Phase 2). Raise to break=60 when implemented.
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: ['src/**/*.ts'],
  reporters: ['html', 'clear-text', 'progress'],
  thresholds: {
    break: 0,
    low: 50,
    high: 80,
  },
};
