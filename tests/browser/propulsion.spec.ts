import {test,expect} from '@playwright/test';

test('King Kai gravity, unlimited gas, exhaust and opt-in audio work in the browser',async({page})=>{
  const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-mode','ready');
  await expect(page.locator('#description')).toContainText('King Kai');
  await expect(page.locator('#gravity')).toHaveAttribute('data-value','10');
  await expect(page.getByLabel('Thruster sound')).not.toBeChecked();
  await page.getByLabel('Thruster sound').check();
  await page.getByRole('button',{name:'Ride scooter'}).click();
  await page.keyboard.down('Space');
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(2);
  await expect(page.locator('#fuel')).toHaveText('∞');
  expect(Number(await page.locator('#fuel').getAttribute('data-value'))).toBe(80);
  await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-plumes'))).toBeGreaterThan(0);
  await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-audio-rms'))).toBeGreaterThan(0.0001);
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBeGreaterThan(6);
  await expect(page.locator('#world')).toHaveAttribute('data-planet-in-frame','true');
  await expect(page.locator('#world')).toHaveAttribute('data-scooter-in-frame','true');
  await page.screenshot({path:'test-results/kai-gas-boost-1080p.png'});
  await page.keyboard.up('Space');
  await expect.poll(async()=>Number(await page.locator('#altitude').getAttribute('data-value'))).toBe(0);
  await page.keyboard.press('p');
  await expect.poll(async()=>Number(await page.locator('#world').getAttribute('data-audio-rms'))).toBeLessThan(0.0001);
  await page.getByRole('button',{name:'Back to start'}).click();
  expect(Number(await page.locator('#fuel').getAttribute('data-value'))).toBe(80);
  expect(failures).toEqual([]);
});
