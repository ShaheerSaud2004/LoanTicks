/**
 * When true, new customers from signup or first Google/GitHub login are approved immediately
 * (skips the admin queue). Use only while wiring up auth; turn off for production.
 */
export function isCustomerAutoApproveEnabled(): boolean {
  const v = process.env.AUTO_APPROVE_CUSTOMER_SIGNUPS?.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}
