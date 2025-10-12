# 🏦 LoanTicks - Loan Management System

A modern, full-stack loan management platform built with Next.js 14, TypeScript, MongoDB, and NextAuth.js. Features role-based authentication for Admins, Employees, and Customers.

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login/logout functionality
- Role-based access control (Admin, Employee, Customer)
- JWT session management
- Protected routes with middleware

### 👤 User Roles

#### Admin Dashboard
- Complete system overview
- User management
- Loan application review
- Revenue tracking
- Activity monitoring

#### Employee Dashboard
- Assigned loan applications
- Application review and approval
- Customer management
- Task tracking

#### Customer Dashboard
- View active loans
- Track loan applications
- Payment information
- Application history

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Git

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
cd /Users/shaheersaud/LoanTicks/loanticks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/loanticks
# For production: mongodb+srv://<username>:<password>@cluster.mongodb.net/loanticks

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env.local`

### 5. Seed the database with demo users

```bash
npm run seed
```

This will create three demo accounts:
- **Admin:** admin@loanticks.com / admin123
- **Employee:** employee@loanticks.com / employee123
- **Customer:** customer@loanticks.com / customer123

### 6. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Login
1. Navigate to the login page
2. Use one of the demo credentials
3. You'll be automatically redirected to your role-specific dashboard

### Role-Specific Access
- **Admin** → `/admin/dashboard`
- **Employee** → `/employee/dashboard`
- **Customer** → `/customer/dashboard`

## 📁 Project Structure

```
loanticks/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/    # NextAuth API routes
│   ├── admin/dashboard/           # Admin dashboard
│   ├── employee/dashboard/        # Employee dashboard
│   ├── customer/dashboard/        # Customer dashboard
│   ├── login/                     # Login page
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home (redirects by role)
├── components/
│   └── DashboardLayout.tsx        # Shared dashboard layout
├── lib/
│   └── mongodb.ts                 # MongoDB connection utility
├── models/
│   └── User.ts                    # User model with roles
├── scripts/
│   └── seed.ts                    # Database seeding script
├── auth.ts                        # NextAuth configuration
├── middleware.ts                  # Route protection middleware
└── .env.local                     # Environment variables
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based sessions
- Protected API routes
- Role-based middleware
- Secure cookie handling
- CSRF protection (built-in NextAuth)

## 🚧 Development Roadmap

### Phase 1 ✅ (Current)
- [x] User authentication
- [x] Role-based dashboards
- [x] Database setup

### Phase 2 (Next)
- [ ] Loan application form
- [ ] Application review workflow
- [ ] User management (CRUD)
- [ ] Employee assignment system

### Phase 3 (Future)
- [ ] Payment processing
- [ ] Document upload
- [ ] Email notifications
- [ ] Reporting & analytics
- [ ] API integrations

## 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with demo users
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify network access for MongoDB Atlas

### Authentication Issues
- Generate a new `NEXTAUTH_SECRET`
- Clear browser cookies
- Restart the dev server

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/loanticks` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Generate with `openssl rand -base64 32` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is part of a client contract with Ruqayya Yasin / Cipher Consulting.

## 👨‍💻 Developer

**Cipher Consulting**  
Represented by: Shaheer Saud  
Email: shaheersaud2004@gmail.com

---

Built with ❤️ using Next.js and TypeScript
