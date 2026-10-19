import {test,expect} from '@playwright/test';

test('earned stages drive the aura, cloud exhaust, grace timer and reset with real controls',async({page})=>{
 test.setTimeout(60000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 await expect(page.locator('#stage')).toHaveText('Stock · ×1');
 await page.locator('#launch').click();await page.keyboard.down('w');
 for(const stage of ['1','2','3']){
  await expect(page.locator('#stage')).toHaveAttribute('data-stage',stage,{timeout:12000});
  await expect(page.locator('#world')).toHaveAttribute('data-aura',stage);
  await page.screenshot({path:`test-results/powertrain-stage-${stage}-1080p.png`});
 }
 await page.keyboard.up('w');await page.keyboard.down('Space');
 await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-plumes'))).toBeGreaterThan(0);
 await page.waitForTimeout(800);
 await page.screenshot({path:'test-results/powertrain-clouds-1080p.png'});
 await page.keyboard.up('Space');
 await page.selectOption('#destination','beerus');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','3');
 await page.locator('#launch').click();await page.keyboard.down('Space');
 await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(1);
 await page.keyboard.up('Space');await page.keyboard.press('r');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','0');
 await expect(page.locator('#world')).toHaveAttribute('data-aura','0');
 await page.selectOption('#destination','king-kai');await page.locator('#launch').click();await page.keyboard.down('w');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','1',{timeout:10000});await page.keyboard.up('w');
 await page.keyboard.down('s');await page.waitForTimeout(2500);await page.keyboard.up('s');
 await expect(page.locator('#stage-hint')).toContainText('Drop in');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','0',{timeout:7000});
 expect(errors).toEqual([]);
});
