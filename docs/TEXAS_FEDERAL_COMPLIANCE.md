# Texas & Federal Compliance Summary (Trademark / Website Submission)

This document summarizes how the LOANATICKS website fulfills **Texas state** and **federal** compliance criteria for mortgage lending and advertising, including for trademark application submission.

---

## Texas State Compliance

| Requirement | Status | Where in Codebase |
|------------|--------|-------------------|
| **NMLS license number displayed** | ✅ | NMLS #2724157 shown on home, footer, login, FAQ, security, terms |
| **“Licensed in State of TX” (or Texas)** | ✅ | Home, footer, login, FAQ, security, terms |
| **Link to NMLS Consumer Access** | ✅ | Footer, login: `https://www.nmlsconsumeraccess.org/` |
| **Texas address / contact** | ✅ | Houston, TX 77066; phone/email in footer and home |
| **Privacy Policy** | ✅ | `/privacy-policy` |
| **Terms of Service** | ✅ | `/terms-of-service` (includes Texas licensing) |
| **Security / data handling** | ✅ | `/security` page; audit logging in codebase |

**Optional to add (Texas):**

- **Texas regulator name** – If you want to be explicit, you can add a line such as: “Licensed by the Texas Department of Savings and Mortgage Lending” (or the correct Texas regulator for your license type). Confirm the exact agency from your NMLS record.

---

## Federal Compliance

| Requirement | Status | Where in Codebase |
|------------|--------|-------------------|
| **Equal Housing Opportunity (EHO)** | ✅ | Footer: EHO statement; home hero: short EHO line |
| **Fair Housing Act / no discrimination** | ✅ | Footer EHO + fair lending statement |
| **Equal Credit Opportunity Act (ECOA)** | ✅ | Footer: “We comply with the Equal Credit Opportunity Act…” |
| **Fair Lending statement** | ✅ | Footer: Fair Housing Act + ECOA reference |
| **Privacy (GLBA-style)** | ✅ | Privacy Policy; no sale of personal info stated |
| **NMLS disclosure** | ✅ | NMLS # and consumer access link (federally mandated for licensed lending) |
| **URLA 2019 (federal form)** | ✅ | Loan application uses URLA 2019–aligned form |
| **Declarations / legal disclosures** | ✅ | Declarations section in loan application form |

**Optional to add (Federal):**

- **EHO logo** – HUD’s Equal Housing Opportunity logo can be added (e.g. in footer or on home) in addition to the text statement. Asset: [HUD EHO logo](https://www.hud.gov/program_offices/fair_housing_equal_opp).
- **Privacy/Terms acceptance** – Signup and/or loan application could include: “I have read and agree to the Privacy Policy and Terms of Service” (checkbox) for stronger GLBA/consumer protection documentation.

---

## What Was Added in This Pass

1. **Footer**
   - **Equal Housing Opportunity** statement (pledge + no discrimination on race, color, religion, sex, handicap, familial status, national origin).
   - **Fair lending** line: compliance with ECOA and Fair Housing Act; all qualified applicants considered without regard to protected characteristics.

2. **Home page (hero)**
   - Short **Equal Housing Opportunity** line under the NMLS line: “Equal Housing Opportunity · We do not discriminate…”

---

## Checklist for Trademark / Submission

- [x] NMLS # and “Licensed in State of TX” visible on main pages
- [x] NMLS Consumer Access link (www.nmlsconsumeraccess.org)
- [x] Privacy Policy and Terms of Service
- [x] Equal Housing Opportunity statement (footer + home)
- [x] Fair lending / ECOA & Fair Housing Act statement
- [x] Texas address and contact info
- [x] Security / data protection page
- [ ] *(Optional)* Texas regulator name, if required for your submission
- [ ] *(Optional)* EHO logo image, if required
- [ ] *(Optional)* Privacy/Terms acceptance checkbox on signup or application

---

## File References

- **Footer (site-wide):** `components/layout/Footer.tsx` – NMLS, Texas licensing, EHO, fair lending.
- **Home:** `components/home/HomePageClient.tsx` – NMLS, EHO line in hero.
- **Login:** `app/login/page.tsx` – NMLS + NMLS link in footer.
- **Legal pages:** `app/privacy-policy/page.tsx`, `app/terms-of-service/page.tsx`, `app/security/page.tsx`.
- **FAQ:** `app/faq/page.tsx` – “Licensed in State of Texas”, NMLS #.
- **Loan application:** URLA 2019 form and declarations in `components/forms/URLA2019ComprehensiveForm.tsx` and related pages.

This codebase fulfills both **Texas state** and **federal** compliance criteria typically needed for a mortgage lending website and for trademark/submission purposes. The items marked “Optional” can be added if your trademark application or regulator requires them.
