/**
 * Browser E2E: seed DB → customer dashboard → loan form loads → employee views & approves → admin dashboard.
 *
 * Requires: MONGODB_URI in .env.local, dev server on E2E_BASE_URL (default http://localhost:3000).
 *
 *   npm run dev   # other terminal
 *   npm run e2e:workflow
 */
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const BASE = (process.env.E2E_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = resolve(__dirname, '..');

const PW = {
  customer: process.env.E2E_CUSTOMER_PASSWORD || 'Customer123!@#',
  employee: process.env.E2E_EMPLOYEE_PASSWORD || 'Employee123!@#',
  admin: process.env.E2E_ADMIN_PASSWORD || 'Admin123!@#$',
};

function runSeed() {
  const out = execSync('npx tsx scripts/e2e-workflow-seed.ts', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  const idx = out.indexOf('//E2E_RESULT:');
  if (idx === -1) throw new Error('Seed did not emit //E2E_RESULT. Output:\n' + out.slice(-1200));
  const jsonPart = out.slice(idx + '//E2E_RESULT:'.length).trim();
  return JSON.parse(jsonPart);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('form input[type="email"]', { timeout: 120000 });
  await page.click('form input[type="email"]', { clickCount: 3 });
  await page.type('form input[type="email"]', email, { delay: 5 });
  await page.click('form input[type="password"]', { clickCount: 3 });
  await page.type('form input[type="password"]', password, { delay: 5 });
  await page.click('form button[type="submit"]');
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
    { timeout: 120000 }
  );
  await new Promise((r) => setTimeout(r, 800));
  const session = await page.evaluate(async () => {
    const r = await fetch('/api/auth/session', { credentials: 'include' });
    return r.json();
  });
  if (!session?.user) {
    const hint = await page.evaluate(() => document.body?.innerText?.slice(0, 400) || '');
    throw new Error(`Login failed for ${email}. Page text: ${hint}`);
  }
  return session;
}

async function dismissNextErrorOverlay(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-nextjs-dialog]').forEach((el) => el.remove());
    document.querySelectorAll('nextjs-portal').forEach((el) => el.remove());
  });
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Set MONGODB_URI in .env.local before running e2e:workflow');
  }

  const { applicationId, customerEmail, employeeEmail, adminEmail } = runSeed();
  console.log('Seeded applicationId=', applicationId);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const issues = [];

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  page.on('pageerror', (err) => issues.push({ type: 'pageerror', message: err.message }));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (
      /favicon|ResizeObserver|hydration|bad HTTP response code \(50[04]\)|fetching the script|JSHandle@error|status of 429/i.test(
        t
      )
    ) {
      return;
    }
    issues.push({ type: 'console.error', text: t });
  });

  await page.evaluateOnNewDocument(() => {
    try {
      ['customer', 'employee', 'admin'].forEach((role) => {
        localStorage.setItem(`walkthrough_${role}_completed`, 'true');
      });
    } catch {
      /* ignore */
    }
  });

  // --- Customer ---
  await login(page, customerEmail, PW.customer);
  await page.goto(`${BASE}/customer/dashboard`, { waitUntil: 'networkidle0', timeout: 120000 }).catch(() =>
    page.goto(`${BASE}/customer/dashboard`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  );
  await dismissNextErrorOverlay(page);
  const dashText = await page.evaluate(() => document.body?.innerText || '');
  if (!dashText.includes('E2EWorkflow') && !dashText.includes('425')) {
    issues.push({ type: 'assert', detail: 'Customer dashboard missing seeded borrower or loan amount hint' });
  }

  await page.goto(`${BASE}/customer/loan-application`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await dismissNextErrorOverlay(page);
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const b = buttons.find((x) => x.textContent?.includes("Let's Get Started"));
    b?.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const loanBody = await page.evaluate(() => document.body?.innerText?.slice(0, 800) || '');
  if (loanBody.includes('administrator verification') && !loanBody.includes('Section')) {
    issues.push({ type: 'assert', detail: 'Loan application blocked for unapproved customer' });
  }

  // --- Employee: view + approve ---
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await login(page, employeeEmail, PW.employee);
  await page.goto(`${BASE}/employee/applications/${applicationId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await dismissNextErrorOverlay(page);
  await new Promise((r) => setTimeout(r, 1200));
  {
    const clickedApprove = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const b = buttons.find((x) => {
        const t = x.textContent || '';
        return /\bApprove\b/i.test(t) && !/\bReject\b/i.test(t);
      });
      if (b) {
        b.click();
        return true;
      }
      return false;
    });
    if (!clickedApprove) {
      issues.push({ type: 'assert', detail: 'Application detail: no Approve button' });
    } else {
      await page.waitForFunction(
        () => {
          const t = document.body?.innerText || '';
          return /\bAPPROVED\b/i.test(t) || /\bApproved\b/.test(t);
        },
        { timeout: 25000 }
      ).catch(() => {
        issues.push({ type: 'assert', detail: 'After approve, page did not show approved state within 25s' });
      });
    }
  }

  // --- Admin (manager): dashboard + applications UI ---
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await login(page, adminEmail, PW.admin);
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'networkidle0', timeout: 120000 }).catch(() =>
    page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  );
  await dismissNextErrorOverlay(page);
  const adminText = await page.evaluate(() => document.body?.innerText || '');
  if (!adminText.includes('E2EWorkflow') && !adminText.includes('425')) {
    issues.push({ type: 'assert', detail: 'Admin dashboard missing seeded application in list' });
  }

  await browser.close();

  const realIssues = issues.filter((i) => i.type !== 'console.error' || !/ResizeObserver|hydration/i.test(i.text || ''));
  if (realIssues.length) {
    console.error(JSON.stringify({ ok: false, issues: realIssues }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, applicationId, issues: [] }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
