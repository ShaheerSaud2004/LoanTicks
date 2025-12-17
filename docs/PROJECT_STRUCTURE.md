# 📂 Project Structure

## Overview

LoanTicks follows a clean, organized folder structure following Next.js 15 best practices with App Router.

## Directory Structure

```
LoanTicks/
│
├── 📁 app/                          # Next.js App Router (Main Application)
│   ├── 📁 admin/
│   │   └── 📁 dashboard/            # Admin dashboard page
│   ├── 📁 api/
│   │   └── 📁 auth/[...nextauth]/   # NextAuth.js API routes
│   ├── 📁 customer/
│   │   └── 📁 dashboard/            # Customer dashboard page
│   ├── 📁 employee/
│   │   └── 📁 dashboard/            # Employee dashboard page
│   ├── 📁 login/                    # Login page with quick login buttons
│   ├── 📄 favicon.ico               # App favicon
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout component
│   └── 📄 page.tsx                  # Home page (role-based redirect)
│
├── 📁 components/                   # Reusable React Components
│   └── 📄 DashboardLayout.tsx       # Shared dashboard layout
│
├── 📁 docs/                         # Project Documentation
│   ├── 📄 CLEANUP_SUMMARY.md        # Cleanup and improvements log
│   ├── 📄 PROJECT_STRUCTURE.md      # This file
│   └── 📄 README.md                 # Documentation index
│
├── 📁 lib/                          # Utility Functions & Libraries
│   └── 📄 mongodb.ts                # MongoDB connection with caching
│
├── 📁 models/                       # Database Models (Mongoose)
│   └── 📄 User.ts                   # User model with roles
│
├── 📁 public/                       # Static Assets
│   └── 📄 logo.jpg                  # Application logo
│
├── 📁 scripts/                      # Utility Scripts
│   └── 📄 seed.ts                   # Database seeding script
│
├── 📄 auth.ts                       # NextAuth.js configuration
├── 📄 middleware.ts                 # Route protection middleware
│
├── 📄 package.json                  # Dependencies & scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 next.config.ts                # Next.js configuration
├── 📄 eslint.config.mjs             # ESLint configuration
├── 📄 postcss.config.mjs            # PostCSS configuration
├── 📄 .prettierrc.json              # Prettier configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 .env.local                    # Environment variables (not in git)
│
└── 📄 README.md                     # Main project documentation
```

## Folder Purposes

### `/app` - Application Code
Contains all Next.js pages, API routes, and app-specific files using the App Router architecture.

**Key Features:**
- Server and Client Components
- File-based routing
- API routes for authentication
- Role-based dashboard pages

### `/components` - Reusable Components
Shared React components used across multiple pages.

**Current Components:**
- `DashboardLayout.tsx` - Wrapper for all dashboard pages with navigation and logout

### `/docs` - Documentation
All project documentation in one organized location.

**Includes:**
- Cleanup summaries
- Project structure (this file)
- Development guides

### `/lib` - Utility Libraries
Helper functions and shared utilities.

**Current Utilities:**
- MongoDB connection with caching for optimal performance

### `/models` - Database Models
Mongoose schemas and models for MongoDB.

**Current Models:**
- `User` - User model with roles (admin, employee, customer)

### `/public` - Static Assets
Publicly accessible static files served at the root path.

**Current Assets:**
- `logo.jpg` - Application logo

### `/scripts` - Utility Scripts
Development and maintenance scripts.

**Current Scripts:**
- `seed.ts` - Seeds database with demo users

## Configuration Files

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth.js authentication configuration |
| `middleware.ts` | Edge middleware for route protection |
| `package.json` | NPM dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Tailwind CSS customization |
| `next.config.ts` | Next.js framework configuration |
| `eslint.config.mjs` | Code linting rules |
| `postcss.config.mjs` | PostCSS configuration for Tailwind |
| `.prettierrc.json` | Code formatting rules |
| `.gitignore` | Git version control exclusions |

## Entry Points

### Development
```bash
npm run dev          # Start dev server
```

**Main Entry:** `app/page.tsx` → Redirects to role-based dashboard

### Authentication
**Login Page:** `app/login/page.tsx`  
**Auth API:** `app/api/auth/[...nextauth]/route.ts`  
**Auth Config:** `auth.ts`

### Dashboards
- **Admin:** `app/admin/dashboard/page.tsx`
- **Employee:** `app/employee/dashboard/page.tsx`
- **Customer:** `app/customer/dashboard/page.tsx`

## Code Organization Best Practices

✅ **Separation of Concerns**
- Pages in `/app`
- Shared components in `/components`
- Business logic in `/lib`
- Data models in `/models`

✅ **Clean Architecture**
- Configuration files at root
- Documentation in `/docs`
- Static assets in `/public`
- Utility scripts in `/scripts`

✅ **TypeScript First**
- Full type safety across the project
- Proper interfaces and types defined

✅ **Security**
- Environment variables for secrets
- Protected routes via middleware
- Password hashing in models

## Adding New Features

### New Page
Add to `app/[route]/page.tsx`

### New Component
Add to `components/ComponentName.tsx`

### New Model
Add to `models/ModelName.ts`

### New Utility
Add to `lib/utilityName.ts`

### New Script
Add to `scripts/scriptName.ts`

## Performance Optimizations

- **MongoDB Connection Caching** - Reuses connections in serverless
- **Next.js Turbopack** - Fast bundling and hot reload
- **Image Optimization** - Logo served optimally
- **Code Splitting** - Automatic by Next.js App Router

## Development Workflow

1. **Start Dev Server:** `npm run dev`
2. **Make Changes:** Edit files in appropriate folders
3. **Lint Code:** `npm run lint`
4. **Seed Database:** `npm run seed`
5. **Build:** `npm run build`
6. **Deploy:** Push to GitHub → Vercel auto-deploys

---

**Last Updated:** October 14, 2025  
**Maintained by:** Cipher Consulting (Shaheer Saud)

