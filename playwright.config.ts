import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		env: {
			DATABASE_URL: 'test.db',
			NODE_ENV: 'test'
		}
	},
	timeout: 5000,
	testDir: 'e2e',
	workers: 1,
	// reporter: 'html',
	globalSetup: resolve(__dirname, 'e2e/global-setup.ts')
});
