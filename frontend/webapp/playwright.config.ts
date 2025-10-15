import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    headless: true
  },
  webServer: {
    command: 'npm run start -- --host 0.0.0.0 --port 4200',
    url: 'http://127.0.0.1:4200',
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
});
