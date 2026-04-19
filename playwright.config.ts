import { defineConfig, devices } from '@playwright/test';

/**
 * URLA wizard E2E — run against a local dev server with DB + auth configured.
 *
 *   DISABLE_RATE_LIMIT=1 npm run dev
 *   npm run seed
 *   npm run e2e:playwright
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: /.*\.e2e\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 240_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
