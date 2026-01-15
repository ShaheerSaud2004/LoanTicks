# URLA 2019 (Fannie Mae Form 1003) - Complete Field Implementation

This document outlines all fields from the Uniform Residential Loan Application (URLA) Form 1003 (2019 version) that are now supported in the LoanApplication model.

## Section 1a: Borrower Information

### Personal Details
- ✅ First Name, Middle Name, Last Name, Suffix
- ✅ Social Security Number (SSN)
- ✅ Date of Birth
- ✅ Marital Status (Married, Unmarried, Separated)
- ✅ Number of Dependents
- ✅ Ages of Dependents

### Contact Information
- ✅ Email Address
- ✅ Home Phone
- ✅ Cell Phone
- ✅ Work Phone

### Citizenship/Residency Status
- ✅ Citizenship Type:
  - US Citizen
  - Permanent Resident Alien
  - Non-Permanent Resident Alien

### Demographics (Government Monitoring - Optional)
- ✅ Ethnicity
- ✅ Sex
- ✅ Race
- ✅ Information Provided: Face-to-Face, Mail, Telephone, Internet

---

## Section 1a-1: Current Address & Former Addresses

### Current Address
- ✅ Street Address
- ✅ Unit/Apartment Number
- ✅ City
- ✅ State
- ✅ ZIP Code
- ✅ Country
- ✅ Housing Status (Own, Rent, Living Rent Free)
- ✅ Monthly Payment (if renting)
- ✅ Years at Address
- ✅ Months at Address

### Mailing Address (if different from current)
- ✅ Complete mailing address structure

### Former Address(es) (if less than 2 years at current address)
- ✅ Array of previous addresses
- ✅ All fields as current address
- ✅ Years and months at each address

---

## Section 1b: Current Employment/Self-Employment and Income

### Employer Information
- ✅ Employer/Business Name
- ✅ Phone Number
- ✅ Complete Address (Street, Unit, City, State, ZIP)
- ✅ Position/Title
- ✅ Start Date
- ✅ Years in this Line of Work
- ✅ Months in this Line of Work

### Business Ownership
- ✅ Check if Business Owner or Self-Employed
- ✅ Check if Own More Than 25% of the Business

### Monthly Income Breakdown
- ✅ Base Income
- ✅ Overtime
- ✅ Bonus
- ✅ Commission
- ✅ Military Entitlements
- ✅ Other
- ✅ **Total Monthly Income**

---

## Section 1c: Additional Employment

**If employed in current job less than 2 years OR currently employed in more than one job:**

- ✅ Array of Additional/Previous Employment
- ✅ All employer details (name, address, phone, position)
- ✅ Start Date and End Date
- ✅ Monthly Income from each job

---

## Section 1d: Income from Other Sources

**List any other income you want the lender to consider:**

- ✅ Array of Other Income Sources:
  - Alimony
  - Child Support
  - Separate Maintenance
  - Social Security
  - Disability
  - Death Benefits
  - Public Assistance
  - Retirement/Pension/401(k)
  - Unemployment/VA Compensation
  - Other
- ✅ Monthly Amount for each source

---

## Section 2a: Financial Information - Assets

### Bank Accounts
- ✅ Account Type (Checking, Savings, Money Market, etc.)
- ✅ Financial Institution Name
- ✅ Account Number
- ✅ Cash or Market Value

### Other Assets
- ✅ Array of Other Assets:
  - Stocks & Bonds
  - Mutual Funds
  - Retirement Accounts (IRA, 401k, etc.)
  - Life Insurance (Cash Value)
  - Real Estate Owned (Net Value)
  - Automobiles (Make, Model, Year, Value)
  - Other Assets
- ✅ Asset Type
- ✅ Description
- ✅ Cash or Market Value

---

## Section 2b: Financial Information - Liabilities

### Credit Cards, Loans, and Leases
- ✅ Array of Liabilities:
  - Account Type/Purpose (Mortgage, Auto Loan, Credit Card, Student Loan, etc.)
  - Creditor Name
  - Account Number
  - Monthly Payment
  - Months Left to Pay
  - Unpaid Balance
  - To Be Paid Off at or Before Closing (checkbox)

### Alimony, Child Support, Separate Maintenance
- ✅ Monthly Payment Amounts for:
  - Alimony
  - Child Support
  - Separate Maintenance

---

## Section 3: Real Estate Owned

**List ALL properties you currently own:**

For Each Property:
- ✅ Property Address (Street, City, State, ZIP)
- ✅ Property Status:
  - Sold
  - Pending Sale
  - Retained (keeping the property)
- ✅ Intended Occupancy (Investment, Second Home, etc.)
- ✅ Property Value

### Mortgage Loans on this Property
- ✅ Array of Mortgages:
  - Creditor Name
  - Monthly Mortgage Payment
  - Unpaid Balance

### Property Expenses
- ✅ Insurance, Maintenance, Taxes, HOA
- ✅ Total Monthly Payment

### Rental Income
- ✅ Gross Monthly Rental Income
- ✅ Net Monthly Rental Income

---

## Section 4a: Loan and Property Information

### Loan Details
- ✅ Loan Amount
- ✅ Loan Purpose:
  - Purchase
  - Refinance
  - Other
- ✅ If Refinance, Purpose:
  - Cash Out
  - Limited Cash Out  
  - No Cash Out

### Property Information
- ✅ Property Address (Street, Unit, City, State, ZIP)
- ✅ Number of Units (1-4 for residential)
- ✅ Property Value

### Occupancy
- ✅ Will This Be Your:
  - Primary Residence
  - Second Home
  - Investment Property

### Property Type
- ✅ Single Family
- ✅ Condominium
- ✅ Townhouse
- ✅ 2-4 Unit Property
- ✅ Cooperative
- ✅ Manufactured/Mobile Home
- ✅ Other

### Special Property Questions
- ✅ Mixed-Use Property (residential + commercial)?
- ✅ Manufactured Home?
- ✅ FHA Secondary Residence?

### Financial
- ✅ Down Payment Amount
- ✅ Down Payment Percentage
- ✅ Title will be held in what name(s)?

---

## Section 4b: Other New Mortgage Loans on the Property

**List any other new mortgage loans on this property:**

- ✅ Array of Additional Mortgages:
  - Creditor Name
  - Lien Type (First, Second, Other)
  - Amount
  - Monthly Payment

---

## Section 4c: Gifts or Grants

**Are you receiving any gifts or grants toward this property?**

- ✅ Array of Gifts/Grants:
  - Source (Community Nonprofit, Employer, Federal Agency, Local Agency, Lender, Relative, Unmarried Partner, Other)
  - Cash or Market Value

---

## Section 5a: Declarations - About this Property and Your Money for this Loan

### About the Property
- ✅ Will you occupy the property as your primary residence?
- ✅ Have you had an ownership interest in another property in the last 3 years?
  - If Yes, what type of property?
  - If Yes, how did you hold title?

### Down Payment Source
- ✅ Are you borrowing any money for this real estate transaction (e.g., money for your closing costs or down payment)?
  - If Yes, amount?
  - If Yes, source?

### New Credit
- ✅ Have you or will you be applying for a mortgage loan on another property (not the property securing this loan) on or before closing this transaction?
  - If Yes, amount?
  - If Yes, what property?

### Liens and Obligations
- ✅ Will this property be subject to a lien that could take priority over the first mortgage lien?
- ✅ Are you a co-signer or guarantor on any debt or loan?
  - If Yes, amount?

---

## Section 5b: Declarations - About Your Finances

### Financial and Legal History
- ✅ Are there any outstanding judgments against you?
- ✅ Are you currently delinquent or in default on a Federal debt?
- ✅ Are you a party to a lawsuit in which you potentially have any personal financial liability?
- ✅ Have you conveyed title to any property in lieu of foreclosure in the past 7 years?
- ✅ Within the past 7 years, have you completed a pre-foreclosure sale or short sale?
- ✅ Have you had property foreclosed upon in the past 7 years?
- ✅ Have you declared bankruptcy within the past 7 years?
  - If Yes, Chapter: 7, 11, 12, or 13?

---

## Section 7: Military Service

- ✅ Have you, your deceased spouse, or your spouse (if you are currently married) ever served or are currently serving in the United States Armed Forces?
- ✅ Currently serving on Active Duty?
- ✅ Currently a Retired or Non-Activated Member of:
  - Reserves
  - National Guard
- ✅ Only period of service was as a Non-Activated member of the Reserves or National Guard?
- ✅ Surviving spouse?

---

## Section 8: Demographic Information of Borrower

*For Government Monitoring Purposes - Optional*

- ✅ Ethnicity (Hispanic or Latino categories)
- ✅ Sex (Male, Female, Do not wish to provide)
- ✅ Race (American Indian/Alaska Native, Asian, Black/African American, Native Hawaiian/Pacific Islander, White)
- ✅ Information Was Provided Through:
  - Face-to-Face Interview
  - Telephone Interview
  - Fax or Mail
  - Internet

---

## Additional Database Fields

### Workflow & Status
- Status (draft, submitted, under_review, approved, rejected)
- Status History with Audit Trail
- Assigned Employee
- Reviewed By Employee
- Decision (approved, rejected, pending)
- Decision Notes

### Documents
- Array of Uploaded Documents:
  - Name
  - Size
  - Type
  - Upload Date
  - URL

### Rate Information
- Rate Quotes
- Rate Analysis
- Last Updated

### Metadata
- User ID
- Created At
- Updated At
- Submitted At
- Notes

---

## Implementation Status

✅ **Model**: All URLA 2019 fields are defined in the `LoanApplication` Mongoose model

⏳ **Form UI**: Comprehensive form UI needs to be built to collect all these fields

⏳ **Employee View**: Employee application view needs to display all new fields

⏳ **Dummy Data**: Sample applications need to be created with complete URLA data

---

## Next Steps for Full URLA Compliance

1. **Expand Loan Application Form** (app/customer/loan-application/page.tsx)
   - Create multi-step form with all URLA sections
   - Add conditional logic (e.g., show former addresses if < 2 years)
   - Add dynamic arrays for additional employment, other income, real estate owned
   - Implement validation for all required fields

2. **Update Employee Application View** (app/employee/applications/[id]/page.tsx)
   - Display all new URLA fields in organized sections
   - Show arrays (employment history, real estate owned, etc.)
   - Format declarations as yes/no responses

3. **Create Sample Data**
   - Generate realistic dummy applications with complete URLA data
   - Include examples of complex scenarios (multiple properties, additional employment, etc.)

4. **Form Validation**
   - Implement URLA-specific validation rules
   - Required fields based on loan purpose
   - Conditional requirements

5. **Export to URLA Form**
   - Generate PDF in official URLA 2019 format
   - Map all fields to correct form positions
   - Include signature blocks and disclosures

