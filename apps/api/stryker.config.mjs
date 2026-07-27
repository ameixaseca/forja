export default {
  testRunner: 'jest',
  plugins: ['@stryker-mutator/jest-runner'],
  jest: {
    configFile: 'package.json',
  },
  mutate: ['src/modules/entitlements/entitlements.service.ts', 'src/modules/lgpd/lgpd.service.ts'],
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
