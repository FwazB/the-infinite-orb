import {test,expect} from '@playwright/test';

test('long destination intros remain separate from status and controls',async({page})=>{
 for(const [width,height] of [[1920,1080],[1206,1212],[1024,768],[800,600],[1280,720]]){
  await page.setViewportSize({width,height});await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.selectOption('#destination','beerus');
  await page.screenshot({path:`test-results/intro-beerus-${width}x${height}.png`});
  // Emulate larger text/font metrics as well as ordinary viewport changes.
  await page.locator('#title').evaluate(el=>{el.style.fontSize='98px';el.style.maxWidth='440px';});
  const bounds=await page.evaluate(()=>{
   const box=(s:string)=>document.querySelector(s)!.getBoundingClientRect();
   return {introBottom:box('.intro').bottom,messageTop:box('#message').top,footerTop:box('footer').top,stageLeft:box('.powertrain-panel').left,introRight:box('.intro').right,stageTop:box('.powertrain-panel').top,noteBottom:box('.scene-note').bottom};
  });
  expect(bounds.introRight).toBeLessThan(bounds.stageLeft);
  expect(bounds.noteBottom).toBeLessThan(bounds.stageTop);
  expect(bounds.introBottom).toBeLessThan(bounds.messageTop);
  expect(bounds.introBottom).toBeLessThan(bounds.footerTop);
  await page.locator('#launch').scrollIntoViewIfNeeded();
  await page.locator('#launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-mode','flying');
 }
});
