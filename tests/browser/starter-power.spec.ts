import {test,expect} from '@playwright/test';
test('fresh Beerus run charges its own starting power with E and can lift',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 await page.selectOption('#destination','beerus');await page.locator('#launch').click();
 await expect(page.locator('#starter-hint')).toContainText('Hold E');
 await page.keyboard.down('e');
 await expect.poll(async()=>Number(await page.locator('#starter-progress').getAttribute('value'))).toBeGreaterThan(0);
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','1',{timeout:5000});
 await page.keyboard.up('e');await expect(page.locator('#starter-hint')).toContainText('Cooling');
 await expect(page.locator('#world')).toHaveAttribute('data-aura','1');
 await page.keyboard.down('Space');
 await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(1);
 await expect(page.locator('#gravity')).toHaveAttribute('data-value','100');
 await page.screenshot({path:'test-results/beerus-starter-1080p.png'});
 await page.keyboard.up('Space');await page.keyboard.press('r');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','0');
 await expect(page.locator('#starter-hint')).toContainText('Hold E');
 expect(errors).toEqual([]);
});

test('starter drive escapes Stock but idle downgrade and cooldown still apply',async({page})=>{
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 await page.selectOption('#destination','beerus');await page.locator('#launch').click();
 await page.keyboard.down('e');await expect(page.locator('#stage')).toHaveAttribute('data-stage','1');await page.keyboard.up('e');
 await page.keyboard.down('w');
 await expect.poll(async()=>Number(await page.locator('#distance').getAttribute('data-value'))).toBeGreaterThan(1);
 await page.keyboard.up('w');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','0',{timeout:7000});
 await page.keyboard.down('e');await page.waitForTimeout(2100);await page.keyboard.up('e');
 await expect(page.locator('#stage')).toHaveAttribute('data-stage','0');
 await expect(page.locator('#starter-hint')).toContainText('Cooling');
});
test('starter UI stays above instruments on short desktops',async({page})=>{
 for(const [width,height] of [[800,600],[1280,720]]){
  await page.setViewportSize({width,height});await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.selectOption('#destination','beerus');await page.locator('#launch').click();
  const bounds=await page.evaluate(()=>{
   const panel=document.querySelector('.powertrain-panel')!.getBoundingClientRect();
   const instruments=document.querySelector('.instruments')!.getBoundingClientRect();
   return {separate:panel.bottom<instruments.top,inside:panel.right<=innerWidth&&panel.left>=0};
  });
  expect(bounds).toEqual({separate:true,inside:true});
  await expect(page.locator('#starter-hint')).toContainText('Hold E');
 }
});
