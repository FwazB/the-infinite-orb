import {test,expect} from '@playwright/test';
for(const world of ['king-kai','earth','namek','beerus'])test(`Rust ${world} renders its real scene and cockpit`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
 if(world!=='king-kai')await page.locator('#destination').selectOption(world);
 await page.locator('#launch').click();await expect(page.locator('#world')).toHaveAttribute('data-destination',world);
 await page.screenshot({path:info.outputPath(`${world}-overview-1080p.png`)});
 await page.keyboard.press('v');await expect(page.locator('#world')).toHaveAttribute('data-camera','cockpit');
 await page.screenshot({path:info.outputPath(`${world}-cockpit-1080p.png`)});
 expect(errors).toEqual([]);
});
