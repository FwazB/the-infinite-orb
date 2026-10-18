import {test,expect} from '@playwright/test';
test('destination picker switches geography and real gravity, resets safely, and distinguishes assumed values',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 const picker=page.getByRole('combobox',{name:'Destination'});
 await expect(picker).toBeVisible();
 for(const [id,g,basis] of [['earth','1','reference'],['namek','1.5','assumed'],['beerus','100','assumed'],['king-kai','10','canon']]){
  await picker.selectOption(id);await expect(page.locator('#world')).toHaveAttribute('data-destination',id);
  await expect(page.locator('#gravity')).toHaveAttribute('data-value',g);
  await expect(page.locator('#gravity-note')).toHaveAttribute('data-basis',basis);
  if(basis==='assumed')await expect(page.locator('#gravity-note')).toContainText('not canon');
  if(id==='beerus')await expect(page.locator('#gravity-note')).toContainText('Whis training');
  await expect(page.locator('#distance')).toHaveAttribute('data-value','0.000');
  await page.getByRole('button',{name:'Ride scooter',exact:true}).click();
  await page.keyboard.down('Space');
  if(id==='beerus'){
   await expect(page.locator('#world-summary')).toContainText('lift cannot overcome');
   await expect(page.locator('#message')).not.toContainText('Space lifts');
   await page.waitForTimeout(1200);
   await expect(page.locator('#altitude')).toHaveAttribute('data-value','0.000');
   await expect(page.locator('#fuel')).toHaveAttribute('data-value','80.000');
  }else await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(1);
  await page.keyboard.up('Space');
  await page.keyboard.press('v');await expect(page.locator('#world')).toHaveAttribute('data-camera','cockpit');
  await page.keyboard.press('r');await expect(page.locator('#altitude')).toHaveAttribute('data-value','0.000');
  await page.keyboard.press('v');await page.waitForTimeout(350);await page.screenshot({path:`test-results/world-${id}-1080p.png`});
 }
 expect(errors).toEqual([]);
});
test('world selector, gravity disclosure and launch stay usable at short desktop sizes',async({page})=>{
 for(const [width,height] of [[800,600],[1280,720]]){
  await page.setViewportSize({width,height});await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.getByRole('combobox',{name:'Destination'}).selectOption('beerus');
  const result=await page.evaluate(()=>{
   const box=(s:string)=>document.querySelector(s)!.getBoundingClientRect();
   const a=box('.wordmark'),b=box('.world-picker'),c=box('#pause'),button=box('#launch'),footer=box('footer');
   return {header:a.right<=b.left&&b.right<=c.left,launch:button.bottom<footer.top,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  expect(result).toEqual({header:true,launch:true,overflow:false});
  await expect(page.locator('#gravity-note')).toContainText('not canon');
 }
});
