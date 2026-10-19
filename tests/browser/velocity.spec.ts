import {test,expect} from '@playwright/test';
for(const world of ['king-kai','beerus'])test(`${world}: drive velocity changes sign when braking through zero into reverse`,async({page})=>{
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 await page.selectOption('#destination',world);await page.locator('#launch').click();
 if(world==='beerus'){await page.keyboard.down('e');await expect(page.locator('#stage')).toHaveAttribute('data-stage','1');await page.keyboard.up('e');}
 await expect(page.locator('#speed')).toHaveText('00');
 await page.keyboard.down('w');
 await expect.poll(async()=>Number(await page.locator('#speed').textContent())).toBeGreaterThan(2);
 await page.keyboard.up('w');await page.keyboard.down('s');
 await expect.poll(async()=>Number(await page.locator('#speed').textContent())).toBeLessThan(-1);
 await expect(page.locator('#stage')).toHaveAttribute('data-stage',world==='beerus'?'1':'0');
 await page.screenshot({path:`test-results/negative-velocity-${world}-1080p.png`});
 for(const [width,height] of [[1280,720],[800,600]]){
  await page.setViewportSize({width,height});
  const fits=await page.locator('#speed').evaluate(el=>{const r=el.getBoundingClientRect(),unit=el.nextElementSibling!.getBoundingClientRect();return r.right<=unit.left&&r.left>=0;});
  expect(fits).toBe(true);
 }
 await page.keyboard.up('s');await page.keyboard.press('r');
 await expect(page.locator('#speed')).toHaveText('00');
});
