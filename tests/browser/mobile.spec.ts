import {test,expect,type Page,type CDPSession} from '@playwright/test';
// Real touch input through Chrome's touch pipeline (CDP), not synthetic DOM events.
const screens=[
 {name:'portrait-390',width:390,height:844},
 {name:'small-320',width:320,height:568},
 {name:'landscape-844',width:844,height:390},
];
async function centre(page:Page,selector:string){
 const box=(await page.locator(selector).boundingBox())!;return {x:box.x+box.width/2,y:box.y+box.height/2};
}
async function touch(cdp:CDPSession,type:'touchStart'|'touchMove'|'touchEnd',points:{x:number,y:number,id:number}[]){
 await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({x:p.x,y:p.y,id:p.id,radiusX:4,radiusY:4,force:1}))});
}
const value=(page:Page,id:string)=>page.locator(id).getAttribute('data-value').then(Number);
function overlaps(a:DOMRect,b:DOMRect){return a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;}
for(const screen of screens){
 test.describe(screen.name,()=>{
  test.use({viewport:{width:screen.width,height:screen.height},hasTouch:true,isMobile:true,deviceScaleFactor:3});
  test(`touch play works and the HUD fits (${screen.name})`,async({page})=>{
   const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
   await page.goto('/');
   const body=page.locator('body');
   await expect(body).toHaveAttribute('data-mode','ready');
   await expect(body).toHaveAttribute('data-input','touch');
   await expect(body).toHaveAttribute('data-layout','compact');
   const launch=page.locator('#launch');
   await expect(launch).toBeInViewport({ratio:1});
   await page.screenshot({path:`test-results/mobile-${screen.name}-intro.png`});
   await launch.tap();
   await expect(body).toHaveAttribute('data-mode','flying');
   await expect(page.locator('.touchpad')).toBeVisible();
   const cdp=await page.context().newCDPSession(page);
   // Hold drive and steer together with two fingers.
   const gas=await centre(page,'[data-key=KeyW]'),right=await centre(page,'[data-key=KeyD]');
   await touch(cdp,'touchStart',[{...gas,id:1}]);
   await touch(cdp,'touchStart',[{...gas,id:1},{...right,id:2}]);
   await expect(page.locator('[data-key=KeyW]')).toHaveAttribute('data-pressed','');
   await expect(page.locator('[data-key=KeyD]')).toHaveAttribute('data-pressed','');
   await expect.poll(()=>value(page,'#distance'),{timeout:8000}).toBeGreaterThan(1);
   await touch(cdp,'touchEnd',[]);
   await expect(page.locator('[data-pressed]')).toHaveCount(0);
   // Lift with the gas pad.
   const lift=await centre(page,'[data-key=Space]');
   await touch(cdp,'touchStart',[{...lift,id:3}]);
   await expect.poll(()=>value(page,'#altitude'),{timeout:8000}).toBeGreaterThan(0.5);
   await touch(cdp,'touchEnd',[]);
   // Dragging the sky orbits the camera instead of scrolling or zooming the page.
   await touch(cdp,'touchStart',[{x:screen.width/2,y:screen.height*0.45,id:4}]);
   await touch(cdp,'touchMove',[{x:screen.width/2+60,y:screen.height*0.45,id:4}]);
   await touch(cdp,'touchEnd',[]);
   expect(await page.evaluate(()=>[scrollX,scrollY,visualViewport?.scale??1])).toEqual([0,0,1]);
   // Every visible HUD block stays on screen and none overlap.
   const boxes=await page.evaluate(()=>['header','.instruments','.powertrain-panel','footer','.options','.message','.pad-steer','.pad-drive'].map(s=>{
    const e=document.querySelector(s)!;const r=e.getBoundingClientRect();
    return {s,visible:getComputedStyle(e).display!=='none'&&r.width>0,r:r.toJSON()};
   }));
   const shown=boxes.filter(b=>b.visible);
   expect(shown.map(b=>b.s)).toEqual(expect.arrayContaining(['header','.instruments','.pad-steer','.pad-drive','.options']));
   for(const b of shown){
    expect(b.r.left,`${b.s} left`).toBeGreaterThanOrEqual(0);expect(b.r.top,`${b.s} top`).toBeGreaterThanOrEqual(0);
    expect(b.r.right,`${b.s} right`).toBeLessThanOrEqual(screen.width);expect(b.r.bottom,`${b.s} bottom`).toBeLessThanOrEqual(screen.height);
   }
   for(let i=0;i<shown.length;i++)for(let j=i+1;j<shown.length;j++)
    expect(overlaps(shown[i].r as DOMRect,shown[j].r as DOMRect),`${shown[i].s} overlaps ${shown[j].s}`).toBe(false);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:`test-results/mobile-${screen.name}-ride.png`});
   // Cockpit view and pause are reachable by touch.
   await page.locator('#camera').tap();await expect(body).toHaveAttribute('data-camera','cockpit');
   await page.screenshot({path:`test-results/mobile-${screen.name}-cockpit.png`});
   await page.locator('#pause').tap();await expect(body).toHaveAttribute('data-mode','paused');
   await expect(page.locator('.touchpad')).toBeHidden();
   await expect(page.locator('#launch')).toBeInViewport({ratio:1});
   await page.screenshot({path:`test-results/mobile-${screen.name}-paused.png`});
   expect(failures).toEqual([]);
  });
 });
}
test.describe('touch starter',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 test('holding the power pad at rest unlocks Stage I on 100g',async({page})=>{
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.locator('#destination').selectOption('beerus');
  await page.locator('#launch').tap();
  await expect(page.locator('#starter-hint')).toContainText('⚡');
  const cdp=await page.context().newCDPSession(page);
  const power=await centre(page,'[data-key=KeyE]');
  await touch(cdp,'touchStart',[{...power,id:9}]);
  await expect(page.locator('#stage')).toHaveAttribute('data-stage','1',{timeout:8000});
  await touch(cdp,'touchEnd',[]);
 });
});
