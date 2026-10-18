import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';
const localChrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export default defineConfig({
  testDir:'tests/browser', workers:1, timeout:30000,
  use:{baseURL:'http://127.0.0.1:4175',viewport:{width:1920,height:1080},
    launchOptions:{executablePath:process.env.BROWSER_EXECUTABLE||(existsSync(localChrome)?localChrome:undefined)},
    screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4175 --strictPort',url:'http://127.0.0.1:4175',reuseExistingServer:false},
  reporter:[['list'],['json',{outputFile:'test-results/browser.json'}]]
});
