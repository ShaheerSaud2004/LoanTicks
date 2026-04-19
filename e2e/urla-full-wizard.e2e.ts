import { test, expect, type Page } from '@playwright/test';

const MIN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const E2E_EMAIL = process.env.PLAYWRIGHT_CUSTOMER_EMAIL || 'customer@loanaticks.com';
const E2E_PASSWORD = process.env.PLAYWRIGHT_CUSTOMER_PASSWORD || 'Customer123!@#';

function activeStep(page: Page, title: string) {
  return page.getByRole('region', { name: title, exact: true });
}

/** First input or select under the same field wrapper as a label containing `labelText`. */
function inputNearLabel(step: ReturnType<typeof activeStep>, labelText: string) {
  return step.locator('div').filter({ has: step.locator('label', { hasText: labelText }) }).locator('input, select').first();
}

async function clickNext(page: Page) {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
}

test.describe('URLA 2019 wizard (customer)', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('loan-app-intro-seen', 'true');
      localStorage.setItem('walkthrough_customer_completed', 'true');
    });
  });

  test('fills every wizard step and submits successfully', async ({ page }) => {
    page.on('dialog', (d) => {
      throw new Error(`Unexpected dialog: ${d.message()}`);
    });

    await page.goto('/login');
    await page.getByLabel('Email Address').fill(E2E_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 60_000 });

    await page.goto('/customer/loan-application');
    await expect(page.getByRole('heading', { name: /Home Mortgage Application/i })).toBeVisible();
    await page.getByRole('button', { name: /Start Mortgage Application/i }).click();

    await expect(page.getByRole('heading', { name: 'Personal Information', exact: true })).toBeVisible();

    // Step 0 — Personal
    const s0 = activeStep(page, 'Personal Information');
    await inputNearLabel(s0, 'First Name').fill('Playwright');
    await inputNearLabel(s0, 'Last Name').fill('URLATest');
    await inputNearLabel(s0, 'Social Security Number').fill('123-45-6789');
    await inputNearLabel(s0, 'Date of Birth').fill('1990-06-15');
    await s0.getByRole('radio', { name: 'US Citizen' }).click();
    await s0.getByRole('radio', { name: 'Individual' }).click();
    await s0.locator('label', { hasText: 'Marital Status' }).locator('xpath=following::select[1]').selectOption('unmarried');
    await s0.getByRole('checkbox', { name: /authorize LOANATICKS to pull my credit report/i }).check();
    await clickNext(page);

    // Step 1 — Contact
    await expect(activeStep(page, 'Contact Information')).toBeVisible();
    const s1 = activeStep(page, 'Contact Information');
    await inputNearLabel(s1, 'Cell Phone').fill('7135550100');
    await inputNearLabel(s1, 'Email Address').fill('pw-urla-test@example.com');
    await s1.getByRole('radio', { name: 'Phone', exact: true }).click();
    await clickNext(page);

    // Step 2 — Current address (5+ years → no prior address required)
    await expect(activeStep(page, 'Current Address')).toBeVisible();
    const s2 = activeStep(page, 'Current Address');
    await inputNearLabel(s2, 'Street Address').fill('100 Main Street');
    await inputNearLabel(s2, 'City').fill('Houston');
    await s2.locator('label', { hasText: 'State' }).locator('xpath=following::select[1]').selectOption('TX');
    await inputNearLabel(s2, 'ZIP Code').fill('77002');
    await s2.getByRole('radio', { name: 'Own', exact: true }).click();
    await inputNearLabel(s2, 'Monthly Payment').fill('1800');
    await inputNearLabel(s2, 'Years at Current Address').fill('5');
    await clickNext(page);

    // Step 3 — Prior address (not required)
    await expect(activeStep(page, 'Prior Address')).toBeVisible();
    await clickNext(page);

    // Step 4 — Employment (6+ years in line → no previous employment)
    await expect(activeStep(page, 'Current Employment')).toBeVisible();
    const s4 = activeStep(page, 'Current Employment');
    await s4.locator('#employmentStatus').selectOption('employed');
    await inputNearLabel(s4, 'Employer name').fill('Acme Mortgage QA Inc');
    await inputNearLabel(s4, 'Position / title').fill('Software Engineer');
    await inputNearLabel(s4, 'Years in line of work').fill('6');
    await clickNext(page);

    // Step 5 — Previous employment (skipped in UI)
    await expect(activeStep(page, 'Previous Employment')).toBeVisible();
    await clickNext(page);

    // Step 6 — Income
    await expect(activeStep(page, 'Income Details')).toBeVisible();
    const s6 = activeStep(page, 'Income Details');
    await inputNearLabel(s6, 'Base Income').fill('8500');
    await clickNext(page);

    // Step 7 — Assets
    await expect(activeStep(page, 'Assets')).toBeVisible();
    const s7 = activeStep(page, 'Assets');
    await inputNearLabel(s7, 'Checking Account Balance').fill('12000');
    await inputNearLabel(s7, 'Savings Account Balance').fill('25000');
    await clickNext(page);

    // Step 8 — Liabilities
    await expect(activeStep(page, 'Liabilities')).toBeVisible();
    const s8 = activeStep(page, 'Liabilities');
    await inputNearLabel(s8, 'Credit Card Payments').fill('150');
    await inputNearLabel(s8, 'Installment Loan Payments').fill('400');
    await clickNext(page);

    // Step 9 — Property
    await expect(activeStep(page, 'Property Information')).toBeVisible();
    const s9 = activeStep(page, 'Property Information');
    await s9.getByPlaceholder('Enter the complete street address').fill('200 Oak Lane');
    const propCity = s9.locator('label', { hasText: /^City \*$/ }).locator('xpath=following-sibling::p/following-sibling::input[1]');
    await propCity.fill('Austin');
    await s9.locator('label', { hasText: /^State \*$/ }).locator('xpath=following-sibling::p/following-sibling::input[1]').fill('TX');
    await s9.locator('label', { hasText: /^ZIP Code \*$/ }).locator('xpath=following-sibling::p/following-sibling::input[1]').fill('78701');
    await s9.getByPlaceholder('500000').first().fill('520000');
    await s9.getByPlaceholder('500000').nth(1).fill('520000');
    await inputNearLabel(s9, 'Loan Amount Requested').fill('400000');
    await clickNext(page);

    // Step 10 — Loan details / purpose
    await expect(activeStep(page, 'Loan Details')).toBeVisible();
    const s10 = activeStep(page, 'Loan Details');
    await s10.locator('label', { hasText: 'Loan Purpose' }).locator('xpath=following-sibling::select[1]').selectOption('purchase');
    await clickNext(page);

    // Step 11 — Declarations (defaults)
    await expect(activeStep(page, 'Declarations')).toBeVisible();
    await clickNext(page);

    // Step 12 — Military
    await expect(activeStep(page, 'Military Service')).toBeVisible();
    await clickNext(page);

    // Step 13 — Demographics (optional)
    await expect(activeStep(page, 'Demographics')).toBeVisible();
    await clickNext(page);

    // Step 14 — Authorization & card
    await expect(activeStep(page, 'Credit Card & Authorization')).toBeVisible();
    const s14 = activeStep(page, 'Credit Card & Authorization');

    const b1Grid = s14
      .getByRole('heading', { name: /Borrower 1 \(Primary Applicant\)/ })
      .locator('xpath=following-sibling::div[1]');
    await b1Grid.locator('input').nth(0).fill('Playwright URLATest');
    await b1Grid.locator('input').nth(1).fill('123-45-6789');
    await b1Grid.locator('input[type="date"]').first().fill('1990-06-15');

    const cardBlock = s14
      .getByRole('heading', { name: 'Credit Card Information', exact: true })
      .locator('xpath=following-sibling::div[1]');
    await cardBlock.locator('select').first().selectOption('visa');
    await cardBlock.getByPlaceholder('Card number').fill('4242424242424242');
    await cardBlock.getByPlaceholder('MM/YY').fill('12/30');
    await cardBlock.getByPlaceholder('CVV').fill('123');
    await cardBlock.getByPlaceholder('Name on card').fill('Playwright URLATest');
    await cardBlock.getByPlaceholder('Street, city, state, ZIP').fill('100 Main St, Houston, TX 77002');
    await cardBlock.getByPlaceholder('e.g. 500').fill('1');

    await s14.getByRole('checkbox', { name: /I have read and agree to the authorization above/i }).check();

    const sigBlock = s14.getByRole('heading', { name: 'Signature', exact: true }).locator('xpath=following-sibling::div[1]');
    const b1SigRow = sigBlock.getByText('Borrower 1', { exact: true }).locator('xpath=following-sibling::div[1]');
    await b1SigRow.locator('input[type="text"]').fill('Playwright URLATest');
    await b1SigRow.locator('input[type="date"]').fill('2026-04-19');

    await clickNext(page);

    // Step 15 — Documents
    await expect(activeStep(page, 'Documents')).toBeVisible();
    await page.locator('#urla-file-id-doc').setInputFiles({
      name: 'e2e-id.png',
      mimeType: 'image/png',
      buffer: MIN_PNG,
    });
    await page.locator('#urla-file-paystubs').setInputFiles({
      name: 'e2e-paystub.png',
      mimeType: 'image/png',
      buffer: MIN_PNG,
    });
    await expect(page.getByText(/ID Document uploaded/i)).toBeVisible();
    await expect(page.getByText(/Pay Stubs uploaded/i)).toBeVisible();

    await page.getByRole('button', { name: /Submit Application/i }).click();

    await expect(page.getByText(/loan application has been submitted/i)).toBeVisible({
      timeout: 120_000,
    });
  });
});
