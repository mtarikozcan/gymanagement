# PulseGym 🏋️

A modern, production-ready **gym management system** built with NestJS and Next.js. Multi-tenant, role-based access control, and a beautiful premium UI.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

## ✨ Features

- **Multi-tenant Architecture** - Manage multiple gyms from a single instance
- **Member Management** - Full CRUD with search, filtering, and detailed profiles
- **Membership Plans** - Flexible plan configuration with auto-invoice generation
- **Payment Processing** - Collect payments with idempotency protection
- **Class Scheduling** - Weekly schedule view with trainer assignments
- **Role-Based Access Control** - Owner, Admin, Manager, Staff, Trainer, Viewer roles
- **Audit Logging** - Track all actions with detailed activity history
- **Modern UI** - Glassmorphism, animations, and responsive design

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | NestJS, Prisma ORM, PostgreSQL |
| **Authentication** | Cookie-based sessions |
| **Monorepo** | npm workspaces + Turborepo |

## 📁 Project Structure

```
pulsegym/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   └── shared/       # Shared types, schemas, RBAC config
├── package.json      # npm workspaces root
└── turbo.json        # Turborepo config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (tested on v22)
- **PostgreSQL** 14+
- **npm** (uses workspaces)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/pulsegym.git
cd pulsegym
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulsegym?schema=public"
SESSION_SECRET="your-secret-key-change-in-production"
```

### 3. Setup Database

```bash
# Push schema + seed demo data
npm run db:setup
```

### 4. Start Development

```bash
npm run dev
```

Open:
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API**: http://localhost:3001

### 5. Login

Use the demo credentials:
- **Email**: `demo@pulsegym.app`
- **Password**: `Demo123!`

## 📜 Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start API + Web in development mode |
| `npm run build` | Build all packages for production |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:setup` | Push + Seed (convenience command) |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Type-check all packages |

## 🐘 PostgreSQL Setup

**Using Docker (recommended):**
```bash
docker run -d --name pulsegym-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pulsegym \
  postgres:15
```

**macOS with Homebrew:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb pulsegym
```

## 🔐 Role-Based Access Control

| Role | Access Level |
|------|--------------|
| **Owner** | Full access to all features and settings |
| **Admin** | Manage settings, team, and all operations |
| **Manager** | Manage members, payments, reports |
| **Staff** | Create members, collect payments |
| **Trainer** | View classes, mark attendance |
| **Viewer** | Read-only access |

## 📱 Screenshots

### Dashboard
Modern dashboard with KPIs, overdue payments queue, and activity feed.

### Members
Member list with search, filters, and detailed profiles.

### Payments
Overdue queue with one-click payment collection.

## 🏛️ API Endpoints

All endpoints are prefixed with `/api` and scoped to gym where applicable.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current session |
| GET | `/api/gyms/:gymId/members` | List members |
| POST | `/api/gyms/:gymId/members` | Create member |
| GET | `/api/gyms/:gymId/invoices/overdue` | Get overdue invoices |
| POST | `/api/gyms/:gymId/payments/collect` | Collect payment |
| GET | `/api/gyms/:gymId/classes/schedule` | Get class schedule |
| GET | `/api/gyms/:gymId/audit` | Get audit logs |

## 🧪 Demo Walkthrough

1. **Login** → Use demo credentials
2. **Dashboard** → View KPIs and overdue payments
3. **Members** → Create a new member
4. **Member Detail** → Assign a membership plan
5. **Payments** → Collect the generated invoice
6. **Audit Log** → See all actions logged

## 🛠️ Development

### Run Individual Apps

```bash
# API only
cd apps/api && npm run dev

# Web only
cd apps/web && npm run dev
```

### Generate Prisma Client

```bash
npm run db:generate
```

### Reset Database

```bash
npm run db:push -- --force-reset
npm run db:seed
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ using NestJS + Next.js
