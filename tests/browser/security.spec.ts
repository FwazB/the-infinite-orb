import {test,expect} from '@playwright/test';
import {productionHeaders,developmentHeaders} from '../../security/headers.ts';

type SecurityWindow=Window&{testCspViolations?:string[],inlineProbeRan?:boolean};
test('security headers permit normal flight and block an injected inline script',async({page},info)=>{
  await page.addInitScript(()=>{
    const violations:string[]=[];
    Object.assign(window,{testCspViolations:violations});
    document.addEventListener('securitypolicyviolation',event=>violations.push(event.effectiveDirective));
  });
  const response=await page.goto('/');expect(response).not.toBeNull();
  const expected=info.config.configFile?.endsWith('playwright.production.config.ts')?productionHeaders:developmentHeaders;
  const headers=response!.headers();
  for(const [name,value] of Object.entries(expected))expect(headers[name.toLowerCase()],name).toBe(value);
  await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await page.getByRole('button',{name:'Take flight'}).click();
  await page.keyboard.down('Space');await page.waitForTimeout(600);await page.keyboard.up('Space');
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(1);
  await page.keyboard.press('p');
  expect(await page.evaluate(()=>(window as SecurityWindow).testCspViolations)).toEqual([]);
  await page.evaluate(()=>{
    const script=document.createElement('script');
    script.textContent='window.inlineProbeRan=true';
    document.head.append(script);
  });
  await expect.poll(()=>page.evaluate(()=>(window as SecurityWindow).testCspViolations)).toContain('script-src-elem');
  expect(await page.evaluate(()=>(window as SecurityWindow).inlineProbeRan)).toBeUndefined();
});
