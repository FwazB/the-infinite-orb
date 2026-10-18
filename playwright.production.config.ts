import {defineConfig} from '@playwright/test';
import base from './playwright.config.ts';
export default defineConfig({
  ...base,use:{...base.use,baseURL:'http://127.0.0.1:4176'},
  webServer:{command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4176 --strictPort',url:'http://127.0.0.1:4176',reuseExistingServer:false},
  reporter:[['list'],['json',{outputFile:'test-results/browser-production.json'}]]
});
