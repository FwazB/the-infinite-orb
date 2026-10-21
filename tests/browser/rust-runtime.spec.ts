import {test,expect} from '@playwright/test';
test('the browser executes the Rust WASM game without loading the TypeScript game or Three.js',async({page})=>{
 const urls:string[]=[];page.on('request',r=>urls.push(r.url()));
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 await expect(page.locator('#world')).toHaveAttribute('data-engine','rust-webassembly');
 expect(urls.some(u=>u.includes('.wasm'))).toBe(true);
 expect(urls.some(u=>/three|src\/main\.ts|src\/simulation\.ts/.test(u))).toBe(false);
 await page.locator('#launch').click();await page.keyboard.down('w');
 await expect.poll(async()=>Number(await page.locator('#distance').getAttribute('data-value'))).toBeGreaterThan(1);
 await page.keyboard.up('w');
});
