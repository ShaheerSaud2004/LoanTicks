# 🎯 LoanTicks Demo Accounts - Quick Access Guide

## 🚀 Quick Start

### Method 1: Demo Showcase Page (Recommended)
Visit **`/demo`** on your deployment for instant access to all demo accounts with one-click login!

**Steps:**
1. Go to: `https://your-deployment.vercel.app/demo`
2. Click "Setup Demo Data" button (first time only)
3. Click "Login" on any account card to instantly access
4. Explore features specific to that account

### Method 2: Manual Login
Use the credentials below on the login page at `/login`

---

## 👥 Demo Account Credentials

### 🔐 Admin Account
**Purpose:** Full system administration and oversight

```
Email: admin.demo@loanticks.com
Password: demo123
```

**Features:**
- ✅ View all loan applications across the system
- ✅ Manage employee accounts (add/edit/remove)
- ✅ System-wide statistics and analytics
- ✅ Employee management dashboard
- ✅ Complete administrative access

---

### 💼 Employee Accounts

#### Employee #1: John Smith
**Purpose:** Employee with assigned applications to review

```
Email: john.employee@loanticks.com
Password: demo123
```

**Features:**
- ✅ Has assigned loan application (David Thompson's rejected case)
- ✅ Review and approve/reject applications
- ✅ View customer credit scores
- ✅ Add decision notes
- ✅ Track application history
- ✅ Make final lending decisions

#### Employee #2: Lisa Anderson
**Purpose:** Senior employee with completed cases

```
Email: lisa.employee@loanticks.com
Password: demo123
```

**Features:**
- ✅ Multiple assigned applications
- ✅ Has approved application (Emily Rodriguez)
- ✅ High-value loan processing experience
- ✅ Complete workflow examples
- ✅ Performance tracking

---

### 👤 Customer Accounts

#### Customer #1: Sarah Johnson
**Purpose:** New customer - clean slate

```
Email: sarah.customer@loanticks.com
Password: demo123
```

**Status:** No applications yet

**Features:**
- ✅ Clean dashboard (perfect for demos)
- ✅ Start new loan application
- ✅ Experience complete 15-step URLA form
- ✅ Submit application and see full workflow
- ✅ Ideal for showing application creation process

---

#### Customer #2: Michael Chen
**Purpose:** Customer with pending application

```
Email: michael.customer@loanticks.com
Password: demo123
```

**Status:** 🟡 Application Pending Review

**Application Details:**
- Loan Amount: $520,000
- Property: $650,000 single family home in Los Angeles
- Down Payment: $130,000 (20%)
- Credit Score: 740 (Very Good)
- Monthly Income: $9,500
- Employment: Senior Developer at Tech Solutions Inc

**Features:**
- ✅ Active pending application
- ✅ Track application status in real-time
- ✅ View progress timeline
- ✅ Check submission details
- ✅ See application workflow in action

---

#### Customer #3: Emily Rodriguez ⭐
**Purpose:** Success story - approved loan

```
Email: emily.customer@loanticks.com
Password: demo123
```

**Status:** ✅ APPROVED

**Application Details:**
- Loan Amount: $680,000
- Property: $850,000 condo in San Francisco
- Down Payment: $170,000 (20%)
- Credit Score: 780 (Excellent)
- Monthly Income: $11,000
- Employment: Financial Analyst at Global Finance Corp
- Reviewed By: Lisa Anderson
- Decision: APPROVED ✨

**Approval Notes:**
> "Excellent credit score and stable income. Strong financial position. Approved for prime rate."

**Features:**
- ✅ Successfully approved loan example
- ✅ High credit score demonstration
- ✅ Complete success workflow
- ✅ View approval notes and decision
- ✅ Best-case scenario showcase

---

#### Customer #4: David Thompson
**Purpose:** Rejected application example

```
Email: david.customer@loanticks.com
Password: demo123
```

**Status:** ❌ REJECTED

**Application Details:**
- Loan Amount: $380,000
- Property: $400,000 condo in San Diego
- Down Payment: $20,000 (5% - Low)
- Credit Score: 620 (Fair)
- Monthly Income: $4,500
- Employment: Store Manager at Retail Plus
- Reviewed By: John Smith
- Decision: REJECTED

**Rejection Notes:**
> "Insufficient income relative to debt obligations. High DTI ratio. Unable to approve at this time."

**Features:**
- ✅ Rejected application example
- ✅ View rejection reasons
- ✅ See detailed decision notes
- ✅ Lower credit scenario
- ✅ High debt-to-income ratio example
- ✅ Shows complete review process

---

## 📋 Application Workflow Demonstration

### Complete Loan Journey

1. **Application Submission** → Use Sarah Johnson's account
   - Complete 15-step URLA form
   - Upload documents
   - Submit application
   - Auto-generate rates

2. **Employee Review** → Switch to Employee account
   - View assigned applications
   - Review borrower information
   - Check credit scores
   - Analyze financial data

3. **Decision Making** → Use Employee account
   - Approve or reject application
   - Add decision notes
   - Update application status

4. **Customer View** → Switch back to Customer
   - See application status
   - View decision notes
   - Track timeline

---

## 🎨 Feature Showcase by Account

| Feature | Admin | Employee | Customer (Sarah) | Customer (Michael) | Customer (Emily) | Customer (David) |
|---------|-------|----------|------------------|-------------------|------------------|------------------|
| Submit New Application | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View Own Applications | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Pending Application | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approved Application | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Rejected Application | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Review Applications | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve/Reject | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Employees | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Overview | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Applications | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🛠️ API Endpoints for Demo Setup

### Setup Demo Accounts
```bash
GET /api/setup-demo-accounts
```

**Response:**
- Creates all 7 demo accounts
- Creates 3 sample loan applications
- Returns summary of created data

**Use Case:** Run once on first deployment or when you need fresh demo data

---

## 💡 Demo Flow Suggestions

### For Sales Demos:

1. **Start with Admin View** → Show complete system oversight
   - Login as: `admin.demo@loanticks.com`
   - Show all applications dashboard
   - Demonstrate employee management

2. **Switch to Customer Journey** → Show user experience
   - Login as: `sarah.customer@loanticks.com`
   - Create new loan application
   - Walk through 15-step URLA form

3. **Show Application States** → Demonstrate workflow
   - Pending: `michael.customer@loanticks.com`
   - Approved: `emily.customer@loanticks.com`
   - Rejected: `david.customer@loanticks.com`

4. **Employee Review Process** → Show internal workflow
   - Login as: `john.employee@loanticks.com`
   - Review assigned applications
   - Make approval/rejection decisions

### For Technical Demos:

1. **Visit `/demo` page** → Show technical architecture
2. **Click "Setup Demo Data"** → Demonstrate data seeding
3. **Inspect Network Tab** → Show API responses
4. **Test Different Roles** → Show auth/authorization
5. **Review Code** → Show clean implementation

---

## 🚨 Important Notes

- ⚠️ All passwords are set to `demo123` for easy access
- ⚠️ Remember to run `/api/setup-demo-accounts` on first deployment
- ⚠️ Demo data is safe to reset anytime by running setup again
- ⚠️ Each account demonstrates specific features - see table above
- ⚠️ Use `/demo` page for quickest access during presentations

---

## 🎯 Quick Links

| Page | URL | Purpose |
|------|-----|---------|
| Demo Showcase | `/demo` | One-click access to all accounts |
| Login Page | `/login` | Traditional login form |
| Setup API | `/api/setup-demo-accounts` | Create demo data |
| Admin Dashboard | `/admin/dashboard` | Admin features |
| Employee Dashboard | `/employee/dashboard` | Employee features |
| Customer Dashboard | `/customer/dashboard` | Customer features |
| Loan Application | `/customer/loan-application` | 15-step URLA form |

---

## ✅ Success Scenarios to Showcase

1. ✨ **High Credit Approval** → Emily Rodriguez (780 credit score)
2. 🟡 **Pending Review** → Michael Chen (740 credit score, waiting)
3. ❌ **DTI Rejection** → David Thompson (High debt-to-income)
4. 🆕 **New Application** → Sarah Johnson (Clean slate)

---

**Last Updated:** October 23, 2025
**Demo Setup Version:** 1.0
**All Accounts Password:** `demo123`

