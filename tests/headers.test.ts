import {test} from 'node:test';
import assert from 'node:assert/strict';

test('production headers restrict executable sources, embedding and browser permissions',async()=>{
  const {productionHeaders,developmentHeaders}=await import('../security/headers.ts');
  assert.equal(productionHeaders['X-Content-Type-Options'],'nosniff');
  assert.equal(productionHeaders['Referrer-Policy'],'no-referrer');
  assert.equal(productionHeaders['X-Frame-Options'],'DENY');
  assert.equal(productionHeaders['Cross-Origin-Resource-Policy'],'same-origin');
  assert.match(productionHeaders['Permissions-Policy'],/camera=\(\)/);
  const csp=productionHeaders['Content-Security-Policy'];
  for(const clause of ["default-src 'none'","script-src 'self'","object-src 'none'","base-uri 'none'","frame-ancestors 'none'","form-action 'none'"])assert.ok(csp.includes(clause),clause);
  assert.ok(!csp.includes('unsafe-inline')&&!csp.includes('unsafe-eval'));
  assert.ok(!developmentHeaders['Content-Security-Policy'].includes('unsafe-eval'));
});
