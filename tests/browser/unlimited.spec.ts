import {test,expect} from '@playwright/test';

test('sustained unlimited lift stays framed above the former camera range',async({page})=>{
  test.setTimeout(45000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'Ride scooter'}).click();
  await page.keyboard.down('Space');
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value')),{timeout:30000}).toBeGreaterThan(110);
  await expect(page.locator('#fuel')).toHaveText('∞');
  expect(Number(await page.locator('#fuel').getAttribute('data-value'))).toBe(80);
  await expect(page.locator('#world')).toHaveAttribute('data-planet-in-frame','true');
  await expect(page.locator('#world')).toHaveAttribute('data-scooter-in-frame','true');
  await page.screenshot({path:'test-results/unlimited-lift-1080p.png'});
  await page.keyboard.up('Space');await page.keyboard.press('v');
  await expect(page.locator('#world')).toHaveAttribute('data-camera','cockpit');
  await page.keyboard.press('r');
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBe(0);
  expect(errors).toEqual([]);
});
