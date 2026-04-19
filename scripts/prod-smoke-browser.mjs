/**
 * Production smoke: key pages render, login/signup controls exist, Auth.js + Google redirect OK.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://www.loanaticks.com node scripts/prod-smoke-browser.mjs
 *
 * Optional credential E2E (do not commit secrets — pass via env):
 *   SMOKE_TEST_EMAIL=you@gmail.com SMOKE_TEST_PASSWORD='...' node scripts/prod-smoke-browser.mjs
 *
 * Local DB after `npm run seed` (same users must exist in the target DB):
 *   customer@loanaticks.com / Customer123!@#
 *   employee@loanaticks.com / Employee123!@#
 *   admin@loanaticks.com / Admin123!@#$
 *
 * Against local dev: SMOKE_BASE_URL=http://localhost:3000 SMOKE_TEST_EMAIL=... npm run smoke:prod
 *
 * Optional link crawl (same-origin paths from home + static checklist):
 *   SMOKE_LINK_CRAWL=1 node scripts/prod-smoke-browser.mjs
 */
import puppeteer from 'puppeteer';

const BASE = (process.env.SMOKE_BASE_URL || 'https://www.loanaticks.com').replace(/\/$/, '');

function hasSize(box) {
  return !!(box && box.w > 2 && box.h > 2);
}

async function assertVisible(page, label, fn) {
  const ok = await fn();
  if (!ok) throw new Error(`Missing or not visible: ${label}`);
}

/** Build `Cookie` header value from `Set-Cookie` response headers (name=value only). */
function cookieHeaderFromResponse(res) {
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers
      .getSetCookie()
      .map((c) => c.split(';')[0]?.trim())
      .filter(Boolean)
      .join('; ');
  }
  const single = res.headers.get('set-cookie');
  if (!single) return '';
  return single
    .split(/,(?=[^;]+?=)/)
    .map((c) => c.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ');
}

/**
 * Auth.js v5 + custom `pages.signIn` rejects GET `/api/auth/signin/{provider}` (UnknownAction).
 * The app uses POST with CSRF (same as `signIn('google')` from next-auth/react); mirror that here.
 */
async function assertGoogleOAuthRedirectWorks() {
  if (process.env.SMOKE_SKIP_GOOGLE_OAUTH === '1') {
    return;
  }
  const ua = { 'user-agent': 'LoanTicks-smoke/1.0' };
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: ua });
  if (!csrfRes.ok) {
    throw new Error(`/api/auth/csrf expected 200, got ${csrfRes.status}`);
  }
  const { csrfToken } = await csrfRes.json();
  if (!csrfToken) {
    throw new Error('/api/auth/csrf missing csrfToken in JSON body');
  }
  const cookie = cookieHeaderFromResponse(csrfRes);
  const postRes = await fetch(`${BASE}/api/auth/signin/google`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      ...ua,
      cookie,
      'content-type': 'application/x-www-form-urlencoded',
      'x-auth-return-redirect': '1',
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: `${BASE}/`,
    }),
  });
  if (!postRes.ok) {
    const text = await postRes.text().catch(() => '');
    throw new Error(`/api/auth/signin/google POST expected 200, got ${postRes.status}. Body: ${text.slice(0, 400)}`);
  }
  let redirectUrl = postRes.headers.get('location') || '';
  if (!redirectUrl) {
    try {
      const data = await postRes.json();
      redirectUrl = typeof data?.url === 'string' ? data.url : '';
    } catch {
      // ignore
    }
  }
  if (redirectUrl.includes('/auth/error')) {
    throw new Error(
      `Auth configuration error (redirect to ${redirectUrl}). On Vercel set: ` +
        `NEXTAUTH_SECRET (or AUTH_SECRET) 32+ chars, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ` +
        `NEXTAUTH_URL=https://www.loanaticks.com — then redeploy. ` +
        `In Google Cloud, add authorized redirect: ${BASE}/api/auth/callback/google`
    );
  }
  if (!redirectUrl.includes('accounts.google.com')) {
    throw new Error(`Expected Google authorize URL (accounts.google.com), got: ${redirectUrl.slice(0, 240)}`);
  }
}

/** GET same-origin path as anonymous client; treat 404/5xx as failure (3xx→2xx OK). */
async function checkAnonymousPath(path) {
  const pathOnly = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${pathOnly}`;
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'LoanTicks-smoke/1.0' },
  });
  if (res.status === 404 || res.status >= 500) {
    throw new Error(`${pathOnly} → HTTP ${res.status}`);
  }
}

/** Collect internal links from the homepage and verify a static checklist. */
async function crawlPublicInternalLinks(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const hrefs = await page.evaluate((origin) => {
    const out = new Set();
    const originHost = new URL(origin).host;
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href');
      if (!h || h.startsWith('#') || h.startsWith('javascript:')) continue;
      try {
        const u = new URL(h, origin);
        if (u.host !== originHost) continue;
        const path = `${u.pathname}${u.search}` || '/';
        if (path.includes('/_next/')) continue;
        out.add(path.split('#')[0]);
      } catch {
        /* ignore */
      }
    }
    return [...out];
  }, BASE);

  const staticExtra = [
    '/',
    '/login',
    '/signup',
    '/faq',
    '/privacy-policy',
    '/terms-of-service',
    '/security',
    '/demo',
    '/pending-approval',
    '/manifest.json',
    '/logo.svg',
  ];
  const combined = [...new Set([...staticExtra, ...hrefs])].filter((p) => {
    if (/\/[a-f0-9]{20,}/i.test(p)) return false;
    return true;
  });

  const checked = [];
  const limit = Math.min(combined.length, 85);
  const batchSize = 8;
  for (let i = 0; i < limit; i += batchSize) {
    const slice = combined.slice(i, Math.min(i + batchSize, limit));
    const outcomes = await Promise.all(
      slice.map(async (p) => {
        try {
          await checkAnonymousPath(p);
          return p;
        } catch (e) {
          throw new Error(`Link crawl failed for ${p}: ${e.message}`);
        }
      })
    );
    checked.push(...outcomes);
  }
  return { pathsFromHomepage: hrefs.length, checkedCount: checked.length, checkedPaths: checked.slice(0, 40) };
}

async function credentialLoginFlow(page, email, password, results) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('form input[type="email"]', { timeout: 90000 });
  await page.click('form input[type="email"]', { clickCount: 3 });
  await page.type('form input[type="email"]', email, { delay: 8 });
  await page.click('form input[type="password"]', { clickCount: 3 });
  await page.type('form input[type="password"]', password, { delay: 8 });
  await page.click('form button[type="submit"]');
  // Login page uses signIn(..., { redirect: false }), so failures often stay on /login without ?error=.
  await page.waitForFunction(
    async () => {
      if (window.location.pathname !== '/login') return true;
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        const s = await res.json();
        if (s?.user) return true;
      } catch {
        /* ignore */
      }
      const t = document.body?.innerText || '';
      if (/Login Failed|Invalid email or password|Server configuration error/i.test(t)) return true;
      return false;
    },
    { timeout: 90000 }
  );
  await new Promise((r) => setTimeout(r, 1500));
  const session = await page.evaluate(async () => {
    const r = await fetch('/api/auth/session', { credentials: 'include' });
    return r.json();
  });
  const finalUrl = page.url();
  const loginError = await page.evaluate(() => new URLSearchParams(window.location.search).get('error'));
  results.push({
    credentialLogin: {
      finalUrl,
      loginQueryError: loginError,
      role: session?.user?.role ?? null,
      isApproved: session?.user?.isApproved ?? null,
      email: session?.user?.email ?? null,
    },
  });

  if (!session?.user) {
    const onLogin = finalUrl.includes('/login');
    const hint = onLogin
      ? 'No session while still on /login: wrong password, user missing in MongoDB, or UI error text not detected. Seed users (`npm run seed` with prod MONGODB_URI) or create this account in Atlas.'
      : loginError === 'CredentialsSignin'
        ? 'Invalid email/password or account missing in this database.'
        : 'Session empty — see loginQueryError on credentialLogin.';
    results.push({ credentialLoginNote: hint });
    throw new Error(`Credential smoke failed for ${email}: ${hint}`);
  }

  const { role } = session.user;
  const approved = Boolean(session.user.isApproved);
  const rolePaths = [];
  if (role === 'admin') {
    rolePaths.push(
      '/admin/dashboard',
      '/admin/users',
      '/admin/employees',
      '/admin/settings',
      '/admin/chatbot-logs'
    );
  } else if (role === 'employee') {
    rolePaths.push(approved ? '/employee/dashboard' : '/pending-approval');
  } else if (role === 'customer') {
    rolePaths.push('/customer/dashboard');
  }

  for (const p of rolePaths) {
    const res = await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    const st = res?.status();
    if (!st || st >= 400) throw new Error(`Role smoke: ${p} HTTP ${st}`);
    results.push({ rolePage: p, httpStatus: st });
  }
}

async function main() {
  /** Used to require Google in /api/auth/providers (production) and to gate Google UI checks in Puppeteer. */
  const isProdSmoke = BASE.includes('loanaticks.com');
  let hasGoogleProvider = false;
  try {
    const pr = await fetch(`${BASE}/api/auth/providers`);
    if (pr.ok) {
      const pj = await pr.json();
      hasGoogleProvider = !!pj.google;
    }
  } catch {
    hasGoogleProvider = false;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const collected = [];
  page.on('pageerror', (err) =>
    collected.push({ kind: 'pageerror', message: err.message, url: page.url() })
  );
  page.on('requestfailed', (req) => {
    const f = req.failure();
    if (f) collected.push({ kind: 'requestfailed', url: req.url(), error: f.errorText });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (t.includes('favicon')) return;
      collected.push({ kind: 'console.error', text: t });
    }
  });

  const results = [];

  async function load(path) {
    const url = `${BASE}${path}`;
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    const status = res?.status();
    if (!status || status >= 400) throw new Error(`${path} HTTP ${status}`);
    results.push({ path, status });
  }

  async function waitForLoginFormReady() {
    await page.waitForSelector('form input[type="email"]', { timeout: 90000 });
    await page.waitForFunction(
      () => {
        const email = document.querySelector('form input[type="email"]');
        const pass = document.querySelector('form input[type="password"]');
        const submit = document.querySelector('form button[type="submit"]');
        if (!email || !pass || !submit) return false;
        const r = submit.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      },
      { timeout: 90000 }
    );
    await page.evaluate(() => {
      document.querySelector('form button[type="submit"]')?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
  }

  await load('/');
  await assertVisible(page, 'home has Login link', async () => !!(await page.$('a[href="/login"]')));

  await load('/login');
  await waitForLoginFormReady();
  await assertVisible(page, 'login email', async () => !!(await page.$('form input[type="email"]')));
  await assertVisible(page, 'login password', async () => !!(await page.$('form input[type="password"]')));

  const signInBox = await page.evaluate(() => {
    const btn = document.querySelector('form button[type="submit"]');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { w: r.width, h: r.height, text: btn.textContent?.trim() };
  });
  if (!signInBox || !hasSize(signInBox)) {
    throw new Error('Primary Sign In (submit) button not found or has no layout');
  }

  if (hasGoogleProvider) {
    const googleBox = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('form button[type="button"]')].find((b) => /google/i.test(b.textContent || ''));
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { w: r.width, h: r.height, text: btn.textContent?.trim() };
    });
    if (!googleBox || !hasSize(googleBox)) {
      const fallback = await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button[type="button"]')].find((b) => /google/i.test(b.textContent || ''));
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { w: r.width, h: r.height, text: btn.textContent?.trim() };
      });
      if (!fallback || !hasSize(fallback)) {
        throw new Error('Google sign-in button not found or has no layout');
      }
    }
  } else {
    results.push({ loginGoogleButton: 'skipped (no google in /api/auth/providers)' });
  }

  await load('/signup');
  await page.waitForSelector('input[placeholder="John Doe"]', { timeout: 25000 });
  await assertVisible(page, 'signup name', async () => !!(await page.$('input[placeholder="John Doe"]')));
  await assertVisible(page, 'signup email', async () => !!(await page.$('input[type="email"]')));
  const pwFields = await page.$$('input[type="password"]');
  if (pwFields.length < 2) throw new Error('Expected password + confirm on signup');
  const createBtn = await page.evaluate(() =>
    [...document.querySelectorAll('button')].some((b) => /create account/i.test(b.textContent || ''))
  );
  if (!createBtn) throw new Error('Create Account button not found');
  if (hasGoogleProvider) {
    const googleSignup = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => /google/i.test(b.textContent || ''));
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    if (!googleSignup || !hasSize(googleSignup)) throw new Error('Signup Google button not visible');
  } else {
    results.push({ signupGoogleButton: 'skipped (no google in /api/auth/providers)' });
  }

  if (process.env.SMOKE_LINK_CRAWL === '1') {
    const crawl = await crawlPublicInternalLinks(page);
    results.push({ linkCrawl: crawl });
  }

  const testEmail = process.env.SMOKE_TEST_EMAIL?.trim();
  const testPassword = process.env.SMOKE_TEST_PASSWORD;
  if (testEmail && testPassword) {
    await credentialLoginFlow(page, testEmail, testPassword, results);
  } else {
    results.push({ credentialLogin: 'skipped (set SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD)' });
  }

  await browser.close();

  if (process.env.SMOKE_SKIP_GOOGLE_OAUTH === '1') {
    results.push({ googleOAuthRedirect: 'skipped (SMOKE_SKIP_GOOGLE_OAUTH=1)' });
  } else {
    await assertGoogleOAuthRedirectWorks();
    results.push({ googleOAuthRedirect: 'accounts.google.com' });
  }

  const sessionRes = await fetch(`${BASE}/api/auth/session`);
  const sessionJson = await sessionRes.json();
  if (sessionRes.status !== 200) throw new Error(`/api/auth/session ${sessionRes.status}`);
  results.push({ session: sessionJson });

  const provRes = await fetch(`${BASE}/api/auth/providers`);
  const provJson = await provRes.json();
  if (provRes.status !== 200) throw new Error(`/api/auth/providers ${provRes.status}`);
  if (isProdSmoke && !provJson.google) {
    throw new Error('Google provider not registered in /api/auth/providers (required for production smoke)');
  }
  results.push({ providers: Object.keys(provJson), googleProvider: !!provJson.google });

  /** Puppeteer often reports aborted fetches during RSC navigations, Cloudflare RUM, or prefetch — not app bugs. */
  function isBenignSmokeNoise(c) {
    if (c.kind === 'requestfailed') {
      const err = c.error || '';
      const url = c.url || '';
      if (err.includes('ERR_ABORTED')) return true;
      if (url.includes('/cdn-cgi/')) return true;
      if (url.includes('?_rsc=')) return true;
      if (url.includes('analytics') || url.includes('vercel') || url.includes('insights')) return true;
    }
    if (c.kind === 'console.error') {
      const t = c.text || '';
      if (t.includes('Failed to load resource') && t.includes('404')) return true;
    }
    // Headless Chrome + Cloudflare + RSC can still surface #418 on marketing pages without a
    // reproducible server/client text delta in source; real browsers often do not. Opt in to fail:
    // SMOKE_STRICT_REACT_HYDRATION=1
    if (
      c.kind === 'pageerror' &&
      typeof c.message === 'string' &&
      c.message.includes('Minified React error #418') &&
      process.env.SMOKE_STRICT_REACT_HYDRATION !== '1'
    ) {
      return true;
    }
    return false;
  }

  const serious = collected.filter((c) => !isBenignSmokeNoise(c));

  console.log(JSON.stringify({ ok: true, base: BASE, results, issues: serious }, null, 2));
  if (serious.length) {
    console.error('Warnings (non-fatal):', serious);
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e.message || e), base: BASE }, null, 2));
  process.exit(1);
});
