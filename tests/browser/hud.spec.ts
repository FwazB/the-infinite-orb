import {test,expect} from '@playwright/test';
for(const viewport of [{width:1920,height:1080},{width:1280,height:720},{width:800,height:600}]){
 test(`cockpit HUD panels do not overlap at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto('/');
  await page.getByRole('button',{name:'Ride scooter'}).click();await page.keyboard.press('v');
  await expect(page.locator('#world')).toHaveAttribute('data-camera','cockpit');
  const boxes=await page.evaluate(()=>Object.fromEntries(['.instruments','.message','.controls','.options'].map(s=>{const r=document.querySelector(s)!.getBoundingClientRect();return [s,{x:r.x,y:r.y,width:r.width,height:r.height}]})));
  for(const [a,b] of [['.instruments','.message'],['.message','.controls'],['.instruments','.options'],['.controls','.options']]){
   const x=boxes[a],y=boxes[b];
   expect(x.x<y.x+y.width&&x.x+x.width>y.x&&x.y<y.y+y.height&&x.y+x.height>y.y,`${a}/${b}: ${JSON.stringify(boxes)}`).toBe(false);
  }
 });
}
