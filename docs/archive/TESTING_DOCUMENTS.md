# Testing Document Viewing Features

## 🎯 Quick Start

### Step 1: Setup Demo Data with Documents

Visit this URL to create demo applications with documents:
```
http://localhost:3000/api/setup-demo-accounts
```

Or if deployed:
```
https://your-app.vercel.app/api/setup-demo-accounts
```

This creates applications with realistic document uploads!

---

## 👥 Demo Accounts with Documents

### Employee Accounts (to VIEW documents)

**John Smith - Employee**
- Email: `john.employee@loanticks.com`
- Password: `demo123`
- Has: 2 assigned applications with documents

**Lisa Anderson - Senior Employee**
- Email: `lisa.employee@loanticks.com`  
- Password: `demo123`
- Has: 3 assigned applications with documents

---

## 📄 Applications with Documents

### 1. Michael Chen - Pending Application
**Documents (6):**
- Government Issued ID.pdf (2.3 MB)
- Pay Stubs - Last 2 Months.pdf (3 MB)
- Bank Statements - Checking.pdf (1.8 MB)
- Bank Statements - Savings.pdf (1.5 MB)
- W2 Form - 2024.pdf (1 MB)
- Employment Verification Letter.pdf (512 KB)

**Status:** Submitted (awaiting review)

---

### 2. Emily Rodriguez - Approved Application
**Documents (8):**
- Driver's License - Front and Back.pdf (3.5 MB)
- Recent Pay Stubs (3 months).pdf (4 MB)
- Bank Statements - All Accounts.pdf (5 MB)
- Tax Returns - 2023 and 2024.pdf (6 MB)
- Investment Account Statements.pdf (2 MB)
- Employment Verification and Offer Letter.pdf (768 KB)
- Credit Report - Full.pdf (1.3 MB)
- Homeowners Insurance Quote.pdf (640 KB)

**Status:** Approved ✅

---

### 3. David Thompson - Rejected Application
**Documents (4):**
- State ID.pdf (1.5 MB)
- Pay Stubs - Recent.pdf (2 MB)
- Bank Statements.pdf (1 MB)
- Credit Card Statements.pdf (1.8 MB)

**Status:** Rejected ❌

---

### 4. Sarah Johnson - Pending Application
**Documents (5):**
- Passport.pdf (2.5 MB)
- Employment Verification - AWS.pdf (896 KB)
- Pay Statements - 3 months.pdf (3.3 MB)
- Bank Account Verification.pdf (2.3 MB)
- Stock Portfolio Summary.pdf (1.4 MB)

**Status:** Submitted (awaiting review)

---

## 🧪 Testing Features

### 1. Document List View
**Location:** Employee Dashboard → Click Application → Documents Panel

**Test:**
- ✅ See list of all uploaded documents
- ✅ Document names display correctly
- ✅ File sizes show in MB
- ✅ Upload timestamps visible
- ✅ Download button on each document
- ✅ Fullscreen button on each document

---

### 2. Document Preview
**Location:** Same panel, below document list

**Test:**
- ✅ Click any document in list
- ✅ Preview shows document icon
- ✅ Document name and size display
- ✅ "Download Document" button works
- ✅ Can navigate between documents

---

### 3. Fullscreen Viewer
**Location:** Click fullscreen button on any document

**Test:**
- ✅ Opens fullscreen overlay
- ✅ Black background
- ✅ Document counter shows (e.g., "2 of 6")
- ✅ Previous/Next navigation buttons
- ✅ Download button
- ✅ Exit button (X)
- ✅ Previous button disabled on first document
- ✅ Next button disabled on last document
- ✅ Press ESC or click X to exit

---

### 4. Split View
**Location:** Click "Split View" tab

**Test:**
- ✅ Documents panel on left
- ✅ Application info on right
- ✅ Can compare documents with borrower data
- ✅ Scroll independently
- ✅ Switch between documents while viewing info

---

### 5. Documents Only View
**Location:** Click "Documents Only" tab

**Test:**
- ✅ Full width document panel
- ✅ Larger preview area
- ✅ Better focus on documents
- ✅ All document features still work

---

### 6. Download Features
**Location:** Any document view

**Test:**
- ✅ Individual download buttons
- ✅ "Download All" button
- ✅ Shows alert with document count
- ✅ (In production: actual file downloads)

---

### 7. Mobile Responsiveness
**Location:** All views

**Test on Mobile:**
- ✅ Document list cards stack vertically
- ✅ Touch-friendly buttons (44px min)
- ✅ Fullscreen viewer works
- ✅ Swipe gestures (if implemented)
- ✅ Readable text sizes
- ✅ No horizontal scroll

---

## 🎨 Visual Elements to Check

### Document Cards
- ✅ FileText icon
- ✅ Document name (truncated if long)
- ✅ File size in MB
- ✅ Upload time (e.g., "5 hours ago")
- ✅ Two action buttons (fullscreen, download)
- ✅ Hover effects
- ✅ Active/selected state

### Fullscreen Viewer
- ✅ Dark background (#000)
- ✅ White text
- ✅ Large document icon
- ✅ Centered layout
- ✅ Clear navigation
- ✅ Responsive button sizes

### Preview Area
- ✅ Light gray background
- ✅ Document placeholder
- ✅ Professional styling
- ✅ Download CTA button

---

## 📱 Test Flow Example

### As a Loan Officer:

1. **Login:**
   ```
   Email: john.employee@loanticks.com
   Password: demo123
   ```

2. **Navigate:**
   - Go to Employee Dashboard
   - See list of applications
   - Click on "Michael Chen" application

3. **View Documents:**
   - Default "Split View" loads
   - See 6 documents on the left
   - See application info on the right

4. **Test Document 1:**
   - Click "Government Issued ID.pdf"
   - Preview updates below
   - Click fullscreen button
   - Navigate through all documents
   - Download one
   - Exit fullscreen

5. **Test Split View:**
   - Scroll application info
   - Select different document
   - Compare ID info with borrower name
   - Verify information matches

6. **Test Other Views:**
   - Click "Documents Only" tab
   - Full width document view
   - Click "Application Info" tab
   - No documents, just info
   - Click "ARIVE POS" tab
   - See ARIVE integration

7. **Communication:**
   - Scroll to "Contact Borrower"
   - Click "Email Borrower"
   - Email app opens with template
   - Click "Text Borrower"
   - SMS app opens

8. **Financial Analysis:**
   - Scroll to purple gradient card
   - Review LTV calculation
   - Review DTI calculation
   - Check formulas
   - Read warnings

9. **Make Decision:**
   - Click "Make Decision" button
   - Review enhanced financial cards
   - Select Approve/Reject
   - Add notes
   - Submit

---

## 🐛 What to Look For

### Bugs/Issues:
- ❌ Documents not loading
- ❌ Wrong document selected
- ❌ Fullscreen not opening
- ❌ Navigation buttons not working
- ❌ Download buttons not responding
- ❌ Mobile layout broken
- ❌ Icons missing
- ❌ Text truncated incorrectly

### Performance:
- ⚡ Fast document switching
- ⚡ Smooth animations
- ⚡ No lag on fullscreen
- ⚡ Quick preview updates

### UX:
- 👍 Clear visual hierarchy
- 👍 Obvious navigation
- 👍 Helpful tooltips
- 👍 Good error messages
- 👍 Loading states
- 👍 Success feedback

---

## 💾 Document Categories

The demo includes these categories:
- `identification` - IDs, licenses, passports
- `income_verification` - Pay stubs, W2s, tax returns
- `financial` - Bank statements, investment accounts
- `credit` - Credit reports
- `insurance` - Insurance quotes

---

## 🔄 Resetting Demo Data

If you need fresh data:

1. **Via Browser:**
   ```
   GET http://localhost:3000/api/setup-demo-accounts
   ```

2. **Via Terminal:**
   ```bash
   curl http://localhost:3000/api/setup-demo-accounts
   ```

This will recreate all demo users and applications with documents!

---

## 📊 Expected Results

After visiting `/api/setup-demo-accounts`, you should see:

```json
{
  "success": true,
  "message": "Demo setup complete! Created X users and X applications",
  "results": {
    "created": [
      {
        "type": "Application",
        "borrower": "Michael Chen",
        "status": "submitted",
        "loanAmount": "$520,000",
        "creditScore": 740
      },
      // ... more applications
    ],
    "summary": {
      "users": 7,
      "applications": 6
    }
  }
}
```

---

## ✅ Success Checklist

- [ ] Demo data created successfully
- [ ] Can login as employee
- [ ] See applications in dashboard  
- [ ] Can view documents list
- [ ] Documents show correct names and sizes
- [ ] Preview works when clicking documents
- [ ] Fullscreen viewer opens
- [ ] Can navigate between documents
- [ ] Download buttons present
- [ ] Split view works correctly
- [ ] Mobile view is responsive
- [ ] All tabs work (Split/Docs/Info/ARIVE)
- [ ] Communication buttons work
- [ ] Financial formulas display
- [ ] Can make decisions

---

## 🎉 All Set!

You now have a **fully functional document viewing system** with:
- ✅ 4 applications with realistic documents
- ✅ Multiple document types and categories
- ✅ Fullscreen viewer with navigation
- ✅ Split-screen comparison
- ✅ Download capabilities
- ✅ Mobile-responsive design
- ✅ Professional UI/UX

**Happy Testing!** 🚀

