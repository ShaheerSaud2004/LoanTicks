# 🏦 LOANATICKS - Loan Management System

A modern, full-stack loan management platform built with Next.js 15, TypeScript, MongoDB, and NextAuth.js. Features role-based authentication with instant quick-login for Admins, Employees, and Customers.

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.4 (App Router with Turbopack)
- **Language:** TypeScript 5
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Quick Login Buttons** - One-click login for each user type
- Secure role-based access control (Admin, Employee, Customer)
- JWT session management
- Protected routes with middleware
- Instant login/logout (no artificial delays)

### 👤 User Roles

#### 👑 Admin Dashboard
- Complete system overview with statistics
- User management capabilities
- Loan application review
- Revenue tracking
- Activity monitoring

#### 💼 Employee Dashboard
- Assigned loan applications
- Application review and approval workflow
- Customer management
- Task tracking

#### 👤 Customer Dashboard
- View active loans
- Track loan applications
- Payment information
- Application history

## 🛠️ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Clean Database (Optional)
If you want to start with a clean database (removes all test/demo data):
```bash
# Using the API endpoint (server must be running)
curl -X POST http://localhost:3000/api/cleanup-database

# Or use the script
node scripts/cleanup-db.js
```

This will remove:
- All test/demo users
- All loan applications
- Keeps waitlist entries (optional)

### 2. Configure Environment
Create a `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3012
NEXTAUTH_SECRET=your-secret-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Seed Database
```bash
npm run seed
```

This creates three demo accounts (passwords meet 12+ char + complexity):
- **Admin:** admin@loanaticks.com / Admin123!@#$
- **Employee:** employee@loanaticks.com / Employee123!@#
- **Customer:** customer@loanaticks.com / Customer123!@#

### 4. Start Development Server
```bash
npm run dev
# or specify a port
PORT=3012 npm run dev
```

Visit http://localhost:3012

## 🎯 Quick Login Feature

The login page now features **instant one-click login buttons**:

- **Purple Button** → Admin Login
- **Blue Button** → Employee Login  
- **Green Button** → Customer Login

Just click any button to instantly log in as that user type - no need to type credentials!

## 📁 Project Structure

```
LOANATICKS/
├── 📁 app/                        # Next.js Application
├── 📁 components/                 # React Components
├── 📁 docs/                       # 📚 Documentation
├── 📁 lib/                        # Utilities
├── 📁 models/                     # Database Models
├── 📁 public/                     # Static Assets
├── 📁 scripts/                    # Scripts
├── 📁 src/                        # Source Code
│   ├── auth.ts                    # NextAuth config
│   └── middleware.ts              # Route middleware
├── 📄 package.json                # Dependencies
├── 📄 tsconfig.json               # TypeScript config
├── 📄 tailwind.config.ts          # Tailwind CSS config
├── 📄 next.config.ts              # Next.js config
├── 📄 eslint.config.mjs           # ESLint config
└── 📄 README.md                   # Main docs
```

👉 See [docs/FINAL_STRUCTURE.md](docs/FINAL_STRUCTURE.md) for detailed structure

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based sessions with secure cookies
- Protected API routes
- Role-based middleware
- CSRF protection (built-in NextAuth)

## 📜 Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with demo users
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB Atlas credentials are correct
- Check `MONGODB_URI` in `.env.local`
- Verify network access in MongoDB Atlas (allow 0.0.0.0/0)

### Port Already in Use
```bash
PORT=3012 npm run dev
```

### Authentication Issues
- Generate a new `NEXTAUTH_SECRET`
- Clear browser cookies
- Restart the dev server
- Re-run `npm run seed`

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Recent Improvements

- ✅ Added quick login buttons for instant access
- ✅ Removed artificial delays (80-90% faster login/logout)
- ✅ Cleaned up unused files and dependencies
- ✅ Optimized file structure with organized folders
- ✅ Improved environment variable handling
- ✅ Fixed all linting errors and warnings

See [docs/CLEANUP_SUMMARY.md](docs/CLEANUP_SUMMARY.md) for detailed cleanup changelog.

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/loanticks` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3012` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Generate with `openssl rand -base64 32` |

## 🎨 UI/UX Features

- Modern gradient design with role-specific colors
- Fully responsive (mobile, tablet, desktop)
- Smooth transitions and hover effects
- Professional typography
- Intuitive navigation
- Loading states for async operations

## 👨‍💻 Developer

**Cipher Consulting**  
Represented by: Shaheer Saud  
Email: shaheersaud2004@gmail.com

---

Built with ❤️ using Next.js and TypeScript
