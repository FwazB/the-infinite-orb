import {test,expect} from '@playwright/test';

test('the whole cartoon planet stays in view through a real keyboard-driven circuit',async({page})=>{
  test.setTimeout(45000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  const canvas=page.locator('#world');
  await expect(canvas).toHaveAttribute('data-world','tiny-planet');
  await expect(canvas).toHaveAttribute('data-planet-in-frame','true');
  await page.screenshot({path:'test-results/planet-preview-1080p.png'});
  await page.getByRole('button',{name:'Ride scooter'}).click();
  await page.keyboard.down('w');
  await expect.poll(async()=>Number(await page.locator('#distance').getAttribute('data-value')),{timeout:25000}).toBeGreaterThan(2*Math.PI*18.86);
  await page.keyboard.up('w');
  await expect(page.locator('#altitude')).toHaveAttribute('data-value','0.000');
  await expect(canvas).toHaveAttribute('data-planet-in-frame','true');
  await page.keyboard.press('p');
  await page.screenshot({path:'test-results/planet-circuit-1080p.png'});
  await page.getByRole('button',{name:'Back to start'}).click();
  await expect(page.locator('#distance')).toHaveAttribute('data-value','0.000');
  expect(errors).toEqual([]);
});
