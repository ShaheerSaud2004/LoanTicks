# ⚡ Quick Start - LoanTicks

## 🎯 3-Step Setup

### 1. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/loanticks
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Server
```bash
npm run dev
```

## 🔑 Login

**URL:** http://localhost:3000

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@loanticks.com | admin123 |
| Employee | employee@loanticks.com | employee123 |
| Customer | customer@loanticks.com | customer123 |

## 📱 Dashboards

- **Admin:** http://localhost:3000/admin/dashboard
- **Employee:** http://localhost:3000/employee/dashboard
- **Customer:** http://localhost:3000/customer/dashboard

## 🎨 What Each Role Can Do

### 👑 Admin
- View system statistics
- Manage all users
- Review all applications
- Access all features

### 💼 Employee
- Review assigned applications
- Approve/reject loans
- Manage customer accounts

### 👤 Customer
- View active loans
- Track applications
- Make payments
- Apply for new loans

## 🛠️ Useful Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run seed     # Reset & seed database
npm run lint     # Check code quality
```

## 🚨 Troubleshooting

**Can't login?**
- Run `npm run seed` again
- Clear browser cookies
- Check MongoDB is running

**Port 3000 in use?**
```bash
PORT=3001 npm run dev
```

**Module errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

✅ **You're all set!** Visit http://localhost:3000 and login with any demo account.

