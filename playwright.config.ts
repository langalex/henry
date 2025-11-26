import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		env: {
			DATABASE_URL: 'test.db',
			NODE_ENV: 'test'
		}
	},
	testDir: 'e2e',
	globalSetup: resolve(__dirname, 'e2e/global-setup.ts')
});
