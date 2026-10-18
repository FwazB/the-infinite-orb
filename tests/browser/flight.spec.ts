import {test,expect} from '@playwright/test';

test('preview, takeoff, steering, pause, blur and reset work with actual keyboard events',async({page})=>{
  const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await expect(page.getByRole('button',{name:'Ride scooter'})).toBeVisible();
  await page.screenshot({path:'test-results/preview-1080p.png'});
  await page.getByRole('button',{name:'Ride scooter'}).click();
  await page.keyboard.down('Space');await page.waitForTimeout(900);await page.keyboard.up('Space');
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(2);
  await page.keyboard.down('w');await page.keyboard.down('d');await page.waitForTimeout(900);await page.keyboard.up('d');await page.keyboard.up('w');
  await expect.poll(async()=>Number(await page.locator('#distance').getAttribute('data-value'))).toBeGreaterThan(1);
  await page.screenshot({path:'test-results/flight-1080p.png'});
  await page.keyboard.press('p');await expect(page.locator('body')).toHaveAttribute('data-mode','paused');
  const distance=await page.locator('#distance').getAttribute('data-value');await page.waitForTimeout(250);
  expect(await page.locator('#distance').getAttribute('data-value')).toBe(distance);
  await page.getByRole('button',{name:'Resume ride'}).click();
  await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.keyboard.up('w');
  await expect(page.locator('body')).toHaveAttribute('data-mode','paused');
  await page.getByRole('button',{name:'Back to start'}).click();
  expect(Number(await page.locator('#distance').getAttribute('data-value'))).toBe(0);
  expect(Number(await page.locator('#altitude').getAttribute('data-value'))).toBe(0);
  expect(failures).toEqual([]);
});

test('small screens receive an honest keyboard-only fallback without overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','unsupported');
  await expect(page.getByRole('button',{name:'Ride scooter'})).toBeDisabled();
  await expect(page.locator('#description')).toContainText('Touch controls are not ready');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/mobile-fallback.png'});
});

test('unavailable WebGL fails readably; lost context has a working reload path',async({page})=>{
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.evaluate(()=>{
    const canvas=document.querySelector('canvas')!;
    canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  });
  await expect(page.locator('body')).toHaveAttribute('data-mode','error');
  await page.getByRole('button',{name:'Reload scene'}).click();
  await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      if(type.includes('webgl'))return null;
      return (original as Function).apply(this,[type,...args]);
    } as typeof original;
  });
  await page.reload();await expect(page.locator('body')).toHaveAttribute('data-mode','error');
  await expect(page.locator('#description')).toContainText('could not start');
});

test('reduced motion and quality controls remain operable; private inputs are not served',async({page,request})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await expect(page.getByLabel('Reduced motion')).toBeChecked();
  await page.getByLabel('Low graphics').check();
  await page.getByRole('button',{name:'Ride scooter'}).focus();await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-mode','flying');
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Resume ride'})).toBeFocused();
  for(const url of ['/references/private/example.jpg','/.git/config','/references/private/receipt.json']){
    const response=await request.get(url);expect(response.status()).toBe(403);
  }
});
