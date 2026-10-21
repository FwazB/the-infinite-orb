const common:Record<string,string>={
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Resource-Policy':'same-origin'
};
const base=["default-src 'none'","script-src 'self' 'wasm-unsafe-eval'","img-src 'self' data:","font-src 'self'","base-uri 'none'","object-src 'none'","frame-ancestors 'none'","frame-src 'none'","form-action 'none'","worker-src 'none'"];
export const productionHeaders:Record<string,string>={
  ...common,
  'Content-Security-Policy':[...base,"style-src 'self'","connect-src 'self'"].join('; '),
  // Browsers honor this only over HTTPS. No subdomain-wide policy is imposed.
  'Strict-Transport-Security':'max-age=31536000'
};
export const developmentHeaders:Record<string,string>={
  ...common,
  // Vite injects styles and uses a loopback HMR socket; production permits neither exception.
  'Content-Security-Policy':[...base,"style-src 'self' 'unsafe-inline'","connect-src 'self' ws://127.0.0.1:* ws://localhost:*"].join('; ')
};
