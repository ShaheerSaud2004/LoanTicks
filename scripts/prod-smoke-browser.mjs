/**
 * Production smoke: key pages render, login/signup controls exist, Auth.js + Google redirect OK.
 * Usage: SMOKE_BASE_URL=https://www.loanaticks.com node scripts/prod-smoke-browser.mjs
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

/** Server must redirect browser to Google (not /auth/error). */
async function assertGoogleOAuthRedirectWorks() {
  if (process.env.SMOKE_SKIP_GOOGLE_OAUTH === '1') {
    return;
  }
  const res = await fetch(`${BASE}/api/auth/signin/google`, {
    redirect: 'manual',
    headers: { 'user-agent': 'LoanTicks-smoke/1.0' },
  });
  const loc = res.headers.get('location') || '';
  if (res.status !== 302 && res.status !== 307) {
    throw new Error(`/api/auth/signin/google expected 302/307, got ${res.status}. Location: ${loc.slice(0, 200)}`);
  }
  if (loc.includes('/auth/error')) {
    throw new Error(
      `Auth configuration error (redirect to ${loc}). On Vercel set: ` +
        `NEXTAUTH_SECRET (or AUTH_SECRET) 32+ chars, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ` +
        `NEXTAUTH_URL=https://www.loanaticks.com — then redeploy. ` +
        `In Google Cloud, add authorized redirect: ${BASE}/api/auth/callback/google`
    );
  }
  if (!loc.includes('accounts.google.com')) {
    throw new Error(`Expected redirect to accounts.google.com, got: ${loc.slice(0, 240)}`);
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const collected = [];
  page.on('pageerror', (err) => collected.push({ kind: 'pageerror', message: err.message }));
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
    await page.waitForFunction(
      () => {
        const email = document.querySelector('form input[type="email"]');
        const pass = document.querySelector('form input[type="password"]');
        const submit = document.querySelector('form button[type="submit"]');
        if (!email || !pass || !submit) return false;
        const r = submit.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      },
      { timeout: 45000 }
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
  const googleSignup = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /google/i.test(b.textContent || ''));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  if (!googleSignup || !hasSize(googleSignup)) throw new Error('Signup Google button not visible');

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
  if (!provJson.google) throw new Error('Google provider not registered in /api/auth/providers');
  results.push({ providers: Object.keys(provJson) });

  const noise = collected.filter(
    (c) =>
      c.kind === 'requestfailed' &&
      (c.url?.includes('analytics') || c.url?.includes('vercel') || c.url?.includes('insights'))
  );
  const serious = collected.filter((c) => !noise.includes(c));

  console.log(JSON.stringify({ ok: true, base: BASE, results, issues: serious }, null, 2));
  if (serious.length) {
    console.error('Warnings (non-fatal):', serious);
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e.message || e), base: BASE }, null, 2));
  process.exit(1);
});
