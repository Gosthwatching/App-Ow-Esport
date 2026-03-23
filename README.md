# OW Esport Control Hub

![Release](https://img.shields.io/badge/Status-Active-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)

A fullstack esports management application for Overwatch team organization, player administration, and competitive ranking. Built with **NestJS** (backend) + **React + Vite** (frontend), featuring **role-based access control (RBAC)**, JWT authentication, and PostgreSQL persistence.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Role Hierarchy & RBAC](#role-hierarchy--rbac)
- [Database Schema](#database-schema)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

**OW Esport Control Hub** is an integrated platform for managing Overwatch esports teams and players with emphasis on:

- **Secure Authentication**: JWT-based auth with bcryptjs password hashing
- **Role-Based Access Control**: 6-tier hierarchical permission system (owner → CEO → manager → coach → player)
- **Team Management**: Create, organize, and track teams with ELO rankings
- **Player Administration**: Assign players to teams, manage roles, track statistics
- **Data Visualization**: Real-time dashboards with team metrics, player distribution, hero pool
- **Responsive UI**: Dark-themed, mobile-friendly React interface with orange accent colors

**Use Cases:**
- Esports tournament organization and team management
- Player skill ranking and competitive tier lists
- Scrim (practice match) scheduling and result tracking
- Team roster management and hero pool analysis

---

## Tech Stack

### Backend
- **Framework**: NestJS 12+ (TypeScript)
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT (JwtService), bcryptjs
- **Validation**: class-validator, class-transformer
- **Built-in**: Throttling (rate limiting), CORS, Pipes, Guards

### Frontend
- **Framework**: React 19+ with Hooks
- **Build Tool**: Vite 8
- **Language**: TypeScript with strict mode
- **Styling**: CSS Grid/Flexbox, Glass-morphism design
- **State Management**: React hooks (useState, useMemo, useEffect)
- **HTTP Client**: Browser Fetch API with custom `apiRequest<T>()` wrapper

### DevOps
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git
- **Package Manager**: npm/yarn

---

## Project Structure

```
Application_Ow_Esport/
├── docker-compose.yaml          # Docker service orchestration
├── package.json                 # Root workspace config
├── README.md                    # This file
│
├── backend/                     # NestJS API server
│   ├── src/
│   │   ├── app.module.ts       # Root module (imports all features)
│   │   ├── app.controller.ts   # Health check endpoint
│   │   ├── app.service.ts
│   │   ├── main.ts             # Bootstrap & listen on :3000
│   │   ├── database.module.ts  # PostgreSQL connection pool
│   │   │
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.controller.ts    # POST /auth/register, /auth/login, /auth/me
│   │   │   ├── auth.service.ts       # JWT generation, password hashing, user registration
│   │   │   ├── jwt.strategy.ts       # Passport JWT strategy
│   │   │   ├── jwt-auth.guard.ts     # @UseBearerToken() decorator
│   │   │   └── dto/
│   │   │       └── set-user-role.dto.ts # Role assignment validation
│   │   │
│   │   ├── security/           # Authorization & RBAC
│   │   │   ├── role-hierarchy.ts        # RBAC constants & logic (getRoleLevel, canAssignRole)
│   │   │   ├── write-auth.guard.ts      # Global APP_GUARD for POST/PUT/PATCH/DELETE
│   │   │   └── roles.decorator.ts       # @Roles('owner') annotation for endpoints
│   │   │
│   │   ├── players/            # Player management
│   │   │   ├── players.controller.ts
│   │   │   ├── players.service.ts
│   │   │   └── entities/
│   │   │
│   │   ├── teams/              # Team management
│   │   │   ├── teams.controller.ts
│   │   │   ├── teams.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-team.dto.ts
│   │   │   │   └── update-team.dto.ts
│   │   │   └── entities/
│   │   │       └── team.entity.ts
│   │   │
│   │   ├── heroes/             # Hero meta tracking
│   │   ├── maps/               # Map management
│   │   ├── scrims/             # Scrim/match scheduling
│   │   ├── stats/              # Player statistics
│   │   ├── tier-list/          # Competitive ranking
│   │   └── matchmaking/        # Queue management
│   │
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Team, Player, Hero, Stats, etc.)
│   │   └── migrations/         # Database migration files
│   │
│   ├── test/                   # End-to-end tests
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── .env.example            # Environment template
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── package.json
│
├── frontend/                    # React Vite app
│   ├── src/
│   │   ├── App.tsx             # Main component (orchestrates all views)
│   │   ├── App.css             # Complete styling (500+ lines, dark theme)
│   │   ├── index.css           # Global styles, color variables, fonts
│   │   ├── main.tsx            # Entry point
│   │   │
│   │   ├── components/         # Decomposed React components
│   │   │   ├── LoadingScreen.tsx      # Splash screen during init
│   │   │   ├── AuthScreen.tsx         # Login/Register view
│   │   │   ├── Sidebar.tsx            # Left nav bar
│   │   │   ├── Topbar.tsx             # Header w/ user info
│   │   │   ├── HeroCard.tsx           # Welcome section + team creation
│   │   │   ├── MetricsGrid.tsx        # Dashboard KPI cards
│   │   │   ├── BottomCards.tsx        # Recruitment metrics
│   │   │   ├── CalendarCard.tsx       # Calendar widget
│   │   │   ├── TeamsList.tsx          # Top teams by ELO
│   │   │   ├── RoleControlForm.tsx    # Role assignment form
│   │   │   └── DashboardLayout.tsx    # Shell component (combines all above)
│   │   │
│   │   └── utils/
│   │       ├── types.ts        # TypeScript interfaces (User, Team, Player, Hero)
│   │       ├── api.ts          # apiRequest<T>() helper with Bearer token auth
│   │       └── auth.ts         # Role hierarchy utilities (canAccess, roleLevel, createInitials)
│   │
│   ├── public/                 # Static assets
│   ├── vite.config.ts          # Vite build configuration
│   ├── tsconfig.json
│   ├── tsconfig.app.json       # Frontend-specific TS config (verbatimModuleSyntax)
│   ├── eslint.config.js
│   └── package.json
│
└── NODE MODULES (ignored in git)
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ (with npm)
- **PostgreSQL** 14+ running locally or remote
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/Gosthwatching/App-Ow-Esport.git
cd Application_Ow_Esport
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment
```bash
# Backend setup
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

**Example `.backend/.env`:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/ow_esport
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
```

### 4. Initialize Database
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Create tables (migrate)
npx prisma migrate dev --name init

# (Optional) Seed test data
npx prisma db seed
```

### 5. Start Backend & Frontend
```bash
# Terminal 1: Backend (from backend/)
npm run start:dev    # Runs on http://localhost:3000

# Terminal 2: Frontend (from frontend/)
npm run dev          # Runs on http://localhost:5173
```

### 6. Open Application
Visit **http://localhost:5173** in your browser.

---

## Installation

### Full Docker Setup
```bash
# Start PostgreSQL + backend via Docker Compose
docker-compose up -d

# Initialize database (from host machine)
cd backend
npx prisma migrate deploy

# Frontend still runs locally
cd ../frontend
npm run dev
```

### Manual Installation

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb ow_esport

# Configure .env
cp .env.example .env
# Edit DATABASE_URL=postgresql://user:pass@host:5432/ow_esport

# Migrate database
npx prisma migrate dev

# Build (production)
npm run build

# Start in development
npm run start:dev
```

#### Frontend
```bash
cd frontend

# Install
npm install

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Configuration

### Backend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Execution mode | `development`, `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost/db` |
| `JWT_SECRET` | Secret for signing tokens | Any strong string |
| `JWT_EXPIRATION` | Token validity | `24h`, `7d` |
| `BCRYPT_ROUNDS` | Password hash complexity | `10` (default) |

### Frontend Environment Variables
Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:3000
```

---

## Running the Application

### Development Mode
```bash
# Backend: Live reload with ts-node
cd backend && npm run start:dev

# Frontend: Vite dev server with HMR
cd frontend && npm run dev
```

### Production Build
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx or Node.js static server
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "new_player",
  "password": "SecurePass123!",
  "displayName": "Player Name"
}

Response: 201 Created
{ "message": "User registered successfully" }
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "new_player",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "new_player",
    "displayName": "Player Name",
    "role": "joueur"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "username": "new_player",
  "displayName": "Player Name",
  "role": "joueur"
}
```

#### Update User Role (Admin)
```http
PATCH /auth/users/2/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "coach"
}

Response: 200 OK
{
  "id": 2,
  "role": "coach"
}
```

### Team Endpoints

#### Get All Teams
```http
GET /teams

Response: 200 OK
[
  {
    "id": 1,
    "name": "Aquas",
    "elo": 2150
  },
  ...
]
```

#### Create Team (owner only)
```http
POST /teams
Authorization: Bearer {owner_token}
Content-Type: application/json

{
  "name": "New Team",
  "elo": 1000
}

Response: 201 Created
{ "id": 10, "name": "New Team", "elo": 1000 }
```

### Player Endpoints

#### Get All Players
```http
GET /players

Response: 200 OK
[
  {
    "id": 1,
    "pseudo": "ProPlayer",
    "role": "Tank",
    "teamId": 1
  },
  ...
]
```

### Hero Endpoints

#### Get All Heroes
```http
GET /heroes

Response: 200 OK
[
  { "id": 1, "name": "Tracer", "role": "DPS" },
  { "id": 2, "name": "Reinhardt", "role": "Tank" },
  ...
]
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├─ LoadingScreen (if loading)
├─ AuthScreen (if not authenticated)
│  ├─ Auth tabs (login/register)
│  └─ Auth form with validation
└─ DashboardLayout (if authenticated)
   ├─ Sidebar
   │  ├─ Brand mark
   │  ├─ Nav buttons (O, T, P, H)
   │  └─ Logout button
   ├─ Topbar
   │  ├─ Search input
   │  ├─ Role pill
   │  └─ Avatar chip
   ├─ HeroCard
   │  ├─ Welcome message
   │  ├─ Team creation form (if owner)
   │  └─ Hero illustration
   ├─ MetricsGrid
   │  ├─ Teams count card
   │  ├─ Players count card
   │  └─ Heroes count card
   ├─ BottomCards
   │  ├─ Recruitment metrics
   │  └─ Roster roles info
   ├─ CalendarCard
   │  ├─ Month/date header
   │  └─ Calendar grid
   ├─ TeamsList
   │  └─ Top 2 teams by ELO
   ├─ RoleControlForm
   │  └─ Role assignment (if coach+)
   └─ Message displays
      ├─ Error messages
      └─ Success messages
```

### State Management
Uses React Hooks (no Redux/Context API):
- `token`: JWT in localStorage
- `user`: Current user object
- `teams`, `players`, `heroes`: Loaded from API
- `authForm`: Login/register inputs
- `loading`, `error`, `successMessage`: UI state

### Styling Strategy
- **CSS Grid** for 3-column dashboard layout (sidebar | main | right panel)
- **Flexbox** for component alignment
- **CSS Variables** for consistent theming (dark blue bg, orange accents)
- **Glass-morphism** effect for card panels
- **Responsive breakpoints** at 1150px (sidebar hide), 900px (single column)

### Type Safety
- TypeScript with `strict: true`
- Exported types: `User`, `Team`, `Player`, `Hero`
- Generic `apiRequest<T>()` for typed API responses
- Role utilities: `canAccess()`, `roleLevel()`, `normalizeRole()`

---

## Role Hierarchy & RBAC

### 6-Tier Role System

```
┌────────────────────────────────────────────────┐
│  owner (6)                                     │
│  - Full system access                          │
│  - Create/delete teams, manage all players     │
│  - Assign any role to any user                 │
└─────────────────┬────────────────────────────┘
                  │
┌────────────────────────────────────────────────┐
│  ceo (5)                                       │
│  - Executive decisions, org-wide actions       │
│  - Create teams, manage rosters                │
│  - Assign roles to manager/coach/joueur        │
└─────────────────┬────────────────────────────┘
                  │
┌────────────────────────────────────────────────┐
│  manager_pole_ow (4)                           │
│  - Regional/pole team management               │
│  - Manage own region's teams & players         │
│  - Assign roles to manager/coach/joueur        │
└─────────────────┬────────────────────────────┘
                  │
      ┌───────────┴──────────┐
      │                      │
┌────────────────┐  ┌────────────────┐
│  manager (3)   │  │   coach (3)    │
│  - Roster mgmt │  │  - Training     │
│  - Assign role │  │  - Strategy     │
│  - Manage team │  │  - Assign role  │
└────────────────┘  └────────────────┘
      │                      │
      └───────────┬──────────┘
                  │
┌────────────────────────────────────────────────┐
│  joueur (1)                                    │
│  - View-only access to teams & stats           │
│  - Can update own profile                      │
└────────────────────────────────────────────────┘
```

### Permission Matrix

| Action | owner | ceo | manager_pole_ow | manager | coach | joueur |
|--------|:-----:|:---:|:---------------:|:-------:|:-----:|:------:|
| Create Team | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete Team | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Players | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Assign Roles | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Stats | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Teams | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit Profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Implementation

**Backend** (`backend/src/security/role-hierarchy.ts`):
```typescript
const CANONICAL_ROLES = ['owner', 'ceo', 'manager_pole_ow', 'manager', 'coach', 'joueur'];

function canAssignRole(actorRole: string, targetCurrentRole: string, targetNewRole: string): boolean {
  // Actor must be strictly higher level than BOTH target's current and new role
  return getRoleLevel(actorRole) > getRoleLevel(targetCurrentRole) &&
         getRoleLevel(actorRole) > getRoleLevel(targetNewRole);
}
```

**Frontend** (`frontend/src/utils/auth.ts`):
```typescript
function canAccess(actorRole: string | undefined, minimumRole: string): boolean {
  return roleLevel(actorRole) >= roleLevel(minimumRole);
}
```

### Enforcement
- **Server-side**: `WriteAuthGuard` intercepts POST/PUT/PATCH/DELETE and checks role
- **Frontend**: `canAccess()` hides buttons/forms from unauthorized users (UX, not security)
- **Database**: Raw SQL queries enforce role on mutations

---

## Database Schema

See [backend/DATABASE_SCHEMA.md](backend/DATABASE_SCHEMA.md) for complete schema documentation.

### Key Tables
- **app_users**: Authentication & RBAC (6 roles)
- **teams**: Teams with ELO rating
- **players**: Individual players, role, team assignment
- **heroes**: Hero definitions (Tank, DPS, Support)
- **stats**: Player statistics per hero
- **scrims**: Practice match records
- **tier_lists**: Seasonal competitive rankings
- **maps**: Map definitions by game mode
- **matchmaking_queues**: Active queue entries

---

## Development Workflow

### Setup Dev Environment

1. **Clone & Install**
   ```bash
   git clone https://github.com/Gosthwatching/App-Ow-Esport.git
   cd Application_Ow_Esport
   npm install  # root (if package.json exists)
   cd backend && npm install && cd ../frontend && npm install
   ```

2. **Database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run start:dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

### Code Style
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configured in both backend & frontend
- **Format**: No Prettier enforced (but recommended)
- **Naming**: camelCase for variables/functions, PascalCase for types/components

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/team-management

# Make changes, test locally
# ...

# Commit with clear message
git commit -m "feat: add team creation endpoint with ELO tracking"

# Push to remote
git push origin feature/team-management

# Create Pull Request on GitHub
```

### Testing

**Backend (Unit Tests)**
```bash
cd backend

# Jest unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

**Backend (E2E Tests)**
```bash
cd backend

# Full application test
npm run test:e2e

# Override DATABASE_URL for test database
DATABASE_URL=postgresql://...test npm run test:e2e
```

**Frontend (Component Tests)**
Currently no test setup; recommended to add Vitest + React Testing Library.

```bash
cd frontend

# Coming soon
npm run test
npm run test:coverage
```

---

## Testing

### Test Database Setup
```bash
# Create test database
createdb ow_esport_test

# Set in environment or pass to test command
DATABASE_URL=postgresql://user:pass@localhost/ow_esport_test npm run test:e2e
```

### Example API Test
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!","displayName":"Tester"}'

# Response:
# { "message": "User registered successfully" }
```

---

## Deployment

### Heroku Deployment
```bash
# Create Heroku app
heroku create ow-esport-app

# Set PostgreSQL add-on
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key

# Deploy backend
git subtree push --prefix backend heroku main

# Deploy frontend (separate, or use monorepo structure with Procfile)
```

### AWS/DigitalOcean VPS
1. **Infrastructure**: Droplet with Ubuntu 22.04, Node.js 18+
2. **Database**: Managed PostgreSQL (AWS RDS, DO Managed Databases)
3. **Process Manager**: PM2 or systemd services
4. **Reverse Proxy**: Nginx for routing :80/:443 → :3000/:5173
5. **SSL**: Let's Encrypt via Certbot

**Example Nginx Config**:
```nginx
server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

server {
  listen 80;
  server_name app.example.com;

  root /var/www/frontend/dist;
  try_files $uri $uri/ /index.html;
  
  location /api {
    proxy_pass http://localhost:3000;
  }
}
```

### Docker Production Build
```bash
# Build images
docker-compose build

# Push to registry (Docker Hub, ECR, etc.)
docker tag ow-backend:latest myregistry/ow-backend:latest
docker push myregistry/ow-backend:latest

# Deploy
docker pull myregistry/ow-backend:latest
docker-compose up -d
```

---

## Troubleshooting

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: 
- Ensure PostgreSQL is running: `sudo service postgresql start` (Linux) or `brew services start postgresql` (macOS)
- Verify `DATABASE_URL` in `.env` is correct
- Check PostgreSQL is listening on 5432: `psql -U postgres -h localhost -c "SELECT 1"`

### JWT Token Expired
```
Error: 401 Unauthorized - Token expired
```
**Solution**:
- Re-login to get new token (stored in localStorage)
- Clear browser cache/localStorage and refresh

### Vite HMR Not Working
```
Error: WebSocket connection failed
```
**Solution**:
- Restart Vite: `npm run dev`
- Check firewall blocking port 24678 (default HMR port)
- Run with explicit host: `npm run dev -- --host 0.0.0.0`

### Prisma Migration Error
```
Error: Unable to apply migration - constraint violation
```
**Solution**:
- Reset dev database: `npx prisma migrate reset`
- Manual fix: `npx prisma migrate resolve --rolled-back init`

### CORS Error from Frontend
```
Error: Cross-Origin Request Blocked
```
**Solution**:
- Backend likely not on `http://localhost:3000`
- Update `VITE_API_URL` in frontend `.env`
- Or update frontend's `API_BASE_URL` constant in code

### Role Assignment Fails
```
Error: 403 Forbidden - Insufficient role privileges
```
**Solution**:
- Verify actor role is strictly higher than target roles
- Example: `coach` (level 3) cannot assign to `manager` (level 3) or above
- Only `owner/ceo/manager_pole_ow` can promote to `manager_pole_ow+`

---

## Contributing

### Report a Bug
1. Open an issue on GitHub with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/logs if applicable

### Submit a Feature Request
1. Discuss in GitHub issues first (avoid duplicate work)
2. Provide mockups or wireframes if UI-related
3. Explain use case and benefit

### Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes following code style guide
4. Test thoroughly
5. Submit Pull Request with clear description

### PR Review Checklist
- [ ] Code follows TypeScript/ESLint standards
- [ ] No console.log or debug code left
- [ ] Tests added/updated
- [ ] Database migrations included (if schema changed)
- [ ] Documentation updated (README, comments)
- [ ] No merge conflicts

---

## License

Copyright © 2024-2026 OW Esport. Licensed under the MIT License.

---

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Gosthwatching/App-Ow-Esport/issues)
- **Email**: contact@ow-esport.dev
- **Discord**: [Community Server](https://discord.gg/owesport)

---

## Changelog

### v1.0.0 (March 2026)
- ✅ JWT authentication with bcryptjs
- ✅ 6-tier RBAC system with hierarchy validation
- ✅ Team & player management
- ✅ React dashboard with component decomposition
- ✅ MongoDB → PostgreSQL + Prisma migration
- ✅ Docker Compose for local dev
- ✅ GitHub monorepo deployment

### Upcoming
- [ ] Real-time scrim scheduling (WebSockets)
- [ ] Player statistics dashboard
- [ ] Competitive tier list leaderboard
- [ ] Match replay analysis
- [ ] Mobile app (React Native)
- [ ] Community features (forums, streams)

---

**Made with ❤️ for Overwatch esports community**
