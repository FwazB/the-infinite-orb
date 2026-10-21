import {test,expect,type Page,type CDPSession} from '@playwright/test';
// Real touch input through Chrome's touch pipeline (CDP), not synthetic DOM events.
const screens=[
 {name:'portrait-390',width:390,height:844},
 {name:'small-320',width:320,height:568},
 {name:'landscape-844',width:844,height:390},
];
type Point={x:number,y:number,id:number};
async function centre(page:Page,selector:string){
 const box=(await page.locator(selector).boundingBox())!;return {x:box.x+box.width/2,y:box.y+box.height/2};
}
async function touch(cdp:CDPSession,type:'touchStart'|'touchMove'|'touchEnd',points:Point[]){
 await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({x:p.x,y:p.y,id:p.id,radiusX:4,radiusY:4,force:1}))});
}
const value=(page:Page,id:string)=>page.locator(id).getAttribute('data-value').then(Number);
function overlaps(a:DOMRect,b:DOMRect){return a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;}
async function hud(page:Page){
 return page.evaluate(()=>['header #pause','.instruments','.powertrain-panel','.message','.touchpad','.pad-power','.stick','footer','.options','.world-picker','.wordmark','#stage-hint'].map(s=>{
  const e=document.querySelector(s)!;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);
  return {s,visible:cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0.05&&r.width>0,r:r.toJSON()};
 }));
}
for(const screen of screens){
 test.describe(screen.name,()=>{
  test.use({viewport:{width:screen.width,height:screen.height},hasTouch:true,isMobile:true,deviceScaleFactor:3});
  test(`floating stick + LIFT play, and a quiet HUD (${screen.name})`,async({page})=>{
   const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
   page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))failures.push(m.text());});
   page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))failures.push(`${r.status()} ${r.url()}`);});
   await page.goto('/');
   const body=page.locator('body');
   await expect(body).toHaveAttribute('data-mode','ready');
   await expect(body).toHaveAttribute('data-input','touch');
   await expect(body).toHaveAttribute('data-layout','compact');
   await expect(page.locator('#launch')).toBeInViewport({ratio:1});
   await page.screenshot({path:`test-results/mobile-${screen.name}-intro.png`});
   await page.locator('#launch').tap();
   await expect(body).toHaveAttribute('data-mode','flying');
   await expect(page.locator('.pad-lift')).toBeVisible();
   await page.screenshot({path:`test-results/mobile-${screen.name}-coach.png`});
   const cdp=await page.context().newCDPSession(page);
   // Left thumb lands anywhere on the left half; dragging up drives, sideways steers.
   const origin={x:screen.width*0.25,y:screen.height*0.72,id:1};
   await touch(cdp,'touchStart',[origin]);
   await expect(page.locator('#stick')).toHaveAttribute('data-active','');
   await touch(cdp,'touchMove',[{...origin,y:origin.y-70}]);
   await expect.poll(()=>value(page,'#distance'),{timeout:8000}).toBeGreaterThan(1);
   const speed=Number((await page.locator('#speed').textContent())!.replace('+',''));
   expect(speed).toBeGreaterThan(0);
   await touch(cdp,'touchMove',[{...origin,x:origin.x+40,y:origin.y-70}]);
   // Right thumb holds LIFT at the same time.
   const lift=await centre(page,'.pad-lift');
   await touch(cdp,'touchStart',[{...origin,x:origin.x+40,y:origin.y-70},{...lift,id:2}]);
   await expect(page.locator('.pad-lift')).toHaveAttribute('data-pressed','');
   await expect.poll(()=>value(page,'#altitude'),{timeout:8000}).toBeGreaterThan(0.5);
   await touch(cdp,'touchEnd',[]);
   await expect(page.locator('#stick')).not.toHaveAttribute('data-active','');
   await expect(page.locator('[data-pressed]')).toHaveCount(0);
   // Right-half drag looks around and never scrolls/zooms the page.
   await touch(cdp,'touchStart',[{x:screen.width*0.7,y:screen.height*0.4,id:3}]);
   await touch(cdp,'touchMove',[{x:screen.width*0.7-60,y:screen.height*0.4,id:3}]);
   await touch(cdp,'touchEnd',[]);
   await expect(page.locator('#stick')).not.toHaveAttribute('data-active','');
   expect(await page.evaluate(()=>[scrollX,scrollY,visualViewport?.scale??1])).toEqual([0,0,1]);
   // After the coach line fades, the riding HUD is only: pause, stats pill, stage chip, stick, LIFT.
   await expect(body).toHaveAttribute('data-coach','off',{timeout:9000});
   await expect(page.locator('.message')).toHaveCSS('opacity','0');
   const shown=(await hud(page)).filter(b=>b.visible);
   expect(shown.map(b=>b.s).filter(s=>s!=='.pad-power').sort()).toEqual(['.instruments','.powertrain-panel','.stick','.touchpad','header #pause'].sort());
   for(const b of shown){
    expect(b.r.left,`${b.s} left`).toBeGreaterThanOrEqual(0);expect(b.r.top,`${b.s} top`).toBeGreaterThanOrEqual(0);
    expect(b.r.right,`${b.s} right`).toBeLessThanOrEqual(screen.width);expect(b.r.bottom,`${b.s} bottom`).toBeLessThanOrEqual(screen.height);
   }
   const solo=shown.filter(b=>b.s!=='.pad-power');
   for(let i=0;i<solo.length;i++)for(let j=i+1;j<solo.length;j++)
    expect(overlaps(solo[i].r as DOMRect,solo[j].r as DOMRect),`${solo[i].s} overlaps ${solo[j].s}`).toBe(false);
   for(const sel of ['.pad-lift','#pause']){const r=(await page.locator(sel).boundingBox())!;expect(Math.min(r.width,r.height),sel).toBeGreaterThanOrEqual(44);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:`test-results/mobile-${screen.name}-ride.png`});
   // Pause holds everything else: destination, view, reset, settings.
   await page.locator('#pause').tap();await expect(body).toHaveAttribute('data-mode','paused');
   await expect(page.locator('.touchpad')).toBeHidden();await expect(page.locator('#stick')).toBeHidden();
   await expect(page.locator('#launch')).toBeInViewport({ratio:1});
   for(const sel of ['#camera','#reset','#destination'])await expect(page.locator(sel)).toBeInViewport({ratio:1});
   const paused=(await hud(page)).filter(b=>b.visible&&['footer','.options','.world-picker'].includes(b.s));
   for(let i=0;i<paused.length;i++)for(let j=i+1;j<paused.length;j++)
    expect(overlaps(paused[i].r as DOMRect,paused[j].r as DOMRect),`${paused[i].s} overlaps ${paused[j].s}`).toBe(false);
   const launchBox=(await page.locator('#launch').boundingBox())!;
   for(const b of paused)expect(overlaps(launchBox as unknown as DOMRect,{left:b.r.left,right:b.r.right,top:b.r.top,bottom:b.r.bottom} as DOMRect),`launch overlaps ${b.s}`).toBe(false);
   await page.screenshot({path:`test-results/mobile-${screen.name}-paused.png`});
   await page.locator('#camera').tap();await expect(body).toHaveAttribute('data-camera','cockpit');
   await page.locator('#launch').tap();await expect(body).toHaveAttribute('data-mode','flying');
   await page.screenshot({path:`test-results/mobile-${screen.name}-cockpit.png`});
   expect(failures).toEqual([]);
  });
 });
}
test.describe('touch starter',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 test('the power button appears only while usable and unlocks Stage I on 100g',async({page})=>{
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.locator('#destination').selectOption('beerus');
  await page.locator('#launch').tap();
  await expect(page.locator('.pad-power')).toBeVisible();
  const cdp=await page.context().newCDPSession(page);
  const power=await centre(page,'.pad-power');
  await touch(cdp,'touchStart',[{...power,id:9}]);
  await expect(page.locator('#stage')).toHaveAttribute('data-stage','1',{timeout:8000});
  await touch(cdp,'touchEnd',[]);
  await expect(page.locator('.pad-power')).toBeHidden();
 });
 test('a resting thumb on the stick does not block the starter',async({page})=>{
  await page.goto('/');await page.locator('#destination').selectOption('beerus');
  await page.locator('#launch').tap();
  const cdp=await page.context().newCDPSession(page);
  const power=await centre(page,'.pad-power');
  await touch(cdp,'touchStart',[{x:100,y:600,id:1}]);
  await touch(cdp,'touchMove',[{x:103,y:598,id:1}]);
  await touch(cdp,'touchStart',[{x:103,y:598,id:1},{...power,id:2}]);
  await expect(page.locator('#stage')).toHaveAttribute('data-stage','1',{timeout:8000});
  await touch(cdp,'touchEnd',[]);
 });
});
