# Database Schema Documentation

## Overview
This document describes the complete PostgreSQL database schema for the OW Esport application, managed via Prisma ORM.

---

## Tables

### 1. **app_users** (User Model)
Manages application users with role-based access control (RBAC).

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Unique user identifier |
| username | VARCHAR(255) | UNIQUE, NOT NULL | Login username |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| displayName | VARCHAR(255) | NULL | User's display name |
| role | VARCHAR(50) | DEFAULT='joueur' | RBAC role (owner, ceo, manager_pole_ow, manager, coach, joueur) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updatedAt | TIMESTAMP | AUTO | Last update time |

**Role Hierarchy:**
- `owner` (Level 6): Full system access, can manage all entities
- `admin` (Level 6): Admin operations equivalent to owner
- `ceo` (Level 5): Executive-level access, organizational decisions
- `manager_pole_ow` (Level 4): Manages pole/region teams
- `manager` (Level 3): Team manager, player roster control
- `coach` (Level 3): Team coach, training and strategy
- `joueur` (Level 1): Player, limited write access

**Indexes:**
- Role-based filtering optimization (`role`)

---

### 2. **teams**
Represents Overwatch esports teams.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Unique team identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Team name |
| elo | INT | DEFAULT=1000 | Current ELO rating |
| createdBy | INT | FK(app_users.id) | User who created the team |
| createdAt | TIMESTAMP | DEFAULT NOW() | Team creation time |
| updatedAt | TIMESTAMP | AUTO | Last update time |

**Relationships:**
- `createdBy` → `app_users.id` (owner of team record)
- `players` ← One-to-Many from `players` table
- `scrims` ← One-to-Many from `scrims` table

**Indexes:**
- ELO-based sorting (`elo`)
- Creator tracking (`createdBy`)

---

### 3. **players**
Represents individual players in the ecosystem.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Unique player identifier |
| pseudo | VARCHAR(255) | UNIQUE, NOT NULL | Player nickname |
| role | VARCHAR(50) | NOT NULL | Overwatch role (Tank, DPS, Support) |
| teamId | INT | FK(teams.id) | Assigned team (nullable) |
| userId | INT | FK(app_users.id) | Link to user account (nullable) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Player record creation |
| updatedAt | TIMESTAMP | AUTO | Last update time |

**Relationships:**
- `teamId` → `teams.id` (Team assignment, SET NULL on delete)
- `userId` → `app_users.id` (User account, SET NULL on delete)
- `stats` ← One-to-Many from `stats` table

**Indexes:**
- Team lookup (`teamId`)
- User lookup (`userId`)
- Role distribution (`role`)

---

### 4. **heroes**
Overwatch hero definitions for stat tracking.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Hero identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Hero name (e.g., "Tracer", "Reinhardt") |
| role | VARCHAR(50) | NOT NULL | Hero type (Tank, DPS, Support) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation |
| updatedAt | TIMESTAMP | AUTO | Last update |

**Relationships:**
- `stats` ← One-to-Many from `stats` table

**Indexes:**
- Role-based filtering (`role`)

---

### 5. **maps**
Overwatch map definitions where scrims are played.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Map identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Map name (e.g., "Ilios") |
| type | VARCHAR(50) | NOT NULL | Game mode (Control, Escort, Hybrid, Push) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation |
| updatedAt | TIMESTAMP | AUTO | Last update |

**Indexes:**
- Type-based filtering (`type`)

---

### 6. **scrims**
Practice matches (scrims) between teams.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Scrim identifier |
| teamAId | INT | FK(teams.id) | Team A |
| teamBId | INT | FK(teams.id) | Team B |
| mapId | INT | FK(maps.id) | Scrim map (nullable) |
| winnerTeamId | INT | FK(teams.id) | Winning team (nullable) |
| scoreA | INT | DEFAULT=0 | Team A score |
| scoreB | INT | DEFAULT=0 | Team B score |
| duration | INT | NULL | Match duration in seconds |
| scheduledAt | TIMESTAMP | NULL | Scheduled time (future scrims) |
| playedAt | TIMESTAMP | NULL | Actual play time |
| createdBy | INT | FK(app_users.id) | Scrim organizer |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation |
| updatedAt | TIMESTAMP | AUTO | Last update |

**Relationships:**
- `teamA` → `teams.id` (CASCADE delete)
- `teamB` → `teams.id` (CASCADE delete, aliased as TeamB)
- `mapId` → `maps.id` (SET NULL on delete)
- `winnerTeamId` → `teams.id` (SET NULL on delete, aliased as Winner)
- `createdBy` → `app_users.id` (Organizer)

**Constraints:**
- UNIQUE(`teamAId`, `teamBId`, `playedAt`) - Prevent duplicate match records

**Indexes:**
- Team A lookup (`teamAId`)
- Team B lookup (`teamBId`)
- Map lookup (`mapId`)
- Winner lookup (`winnerTeamId`)
- Creator lookup (`createdBy`)

---

### 7. **stats**
Player performance statistics per hero.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Stat record identifier |
| playerId | INT | FK(players.id) | Player reference |
| heroId | INT | FK(heroes.id) | Hero reference |
| userId | INT | FK(app_users.id) | User reference (nullable) |
| eliminations | INT | DEFAULT=0 | Total eliminations |
| deaths | INT | DEFAULT=0 | Total deaths |
| damageDealt | INT | DEFAULT=0 | Total damage dealt |
| healing | INT | DEFAULT=0 | Total healing |
| winRate | FLOAT | DEFAULT=0.0 | Win percentage (0-100) |
| playTime | INT | DEFAULT=0 | Total play time in seconds |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation |
| updatedAt | TIMESTAMP | AUTO | Last update |

**Relationships:**
- `playerId` → `players.id` (CASCADE delete)
- `heroId` → `heroes.id` (CASCADE delete)
- `userId` → `app_users.id` (SET NULL on delete)

**Constraints:**
- UNIQUE(`playerId`, `heroId`) - One stat record per player/hero combo

**Indexes:**
- Player lookup (`playerId`)
- Hero lookup (`heroId`)
- User lookup (`userId`)

---

### 8. **tier_lists**
Ranking system for seasonal competitive tiers.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Tier entry identifier |
| userId | INT | FK(app_users.id) | User in tier list |
| rank | INT | DEFAULT=0 | Rank position (1=best) |
| rp | INT | DEFAULT=0 | Rating Points earned |
| region | VARCHAR(50) | DEFAULT='EU' | Server region (EU, NA, APAC, etc.) |
| season | INT | DEFAULT=1 | Competitive season |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation |
| updatedAt | TIMESTAMP | AUTO | Last update |

**Relationships:**
- `userId` → `app_users.id` (CASCADE delete)

**Constraints:**
- UNIQUE(`userId`, `season`, `region`) - One rank per user/season/region

**Indexes:**
- User lookup (`userId`)
- Rank leaderboard (`rank`)
- Season filtering (`season`)

---

### 9. **matchmaking_queues**
Active players in matchmaking queue.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO | Queue entry identifier |
| playerId | INT | UNIQUE | Player in queue |
| queueType | VARCHAR(50) | NOT NULL | Queue type (ranked, casual, scrim) |
| joinedAt | TIMESTAMP | DEFAULT NOW() | Queue join time |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation |

**Indexes:**
- Queue type filtering (`queueType`)
- Oldest-first queuing (`joinedAt`)

---

## Network Diagram

```
┌─────────────┐
│  app_users  │ (User w/ RBAC)
└──────┬──────┘
       │
       ├─→ (createdBy) ─→ teams
       ├─→ (userId) ────→ players
       ├─→ (userId) ────→ stats
       ├─→ (createdBy) ─→ scrims
       └─→ (userId) ────→ tier_lists

┌───────────┐
│   teams   │
├───────────┤
│ createdBy │ ─→ app_users
└─────┬─────┘
      ├─→ players
      └─→ scrims (teamA, teamB, winner)

┌──────────┐
│ players  │
├──────────┤
│ teamId   │ ─→ teams
│ userId   │ ─→ app_users
└─────┬────┘
      └─→ stats

┌────────┐
│ heroes │
└────┬───┘
     └─→ stats

┌──────┐
│ maps │
└──┬───┘
   └─→ scrims

┌────────────┐
│   scrims   │
├────────────┤
│ teamAId    │ ─→ teams
│ teamBId    │ ─→ teams
│ mapId      │ ─→ maps
│ winnerTeamId│ ─→ teams
│ createdBy  │ ─→ app_users
└────────────┘

┌────────┐
│ stats  │
├────────┤
│ playerId│ ─→ players
│ heroId │ ─→ heroes
│ userId │ ─→ app_users
└────────┘

┌──────────────┐
│  tier_lists  │
├──────────────┤
│ userId       │ ─→ app_users
└──────────────┘

┌─────────────────────┐
│ matchmaking_queues  │
└─────────────────────┘
```

---

## Migration & Setup

### Create Database
```bash
# Create PostgreSQL database
createdb ow_esport
```

### Environment Setup
```bash
# Set DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/ow_esport"
```

### Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Run Migrations
```bash
# Create tables from schema
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy
```

### Seed Initial Data (Optional)
```bash
npx prisma db seed
```

---

## Role-Based Access Control (RBAC)

### Permission Matrix

| Action | owner | ceo | manager_pole_ow | manager/coach | joueur |
|--------|:-----:|:---:|:---------------:|:-------------:|:------:|
| Create Team | ✓ | ✗ | ✓ | ✗ | ✗ |
| Delete Team | ✓ | ✗ | ✓ | ✗ | ✗ |
| Manage Players | ✓ | ✓ | ✓ | ✓ | ✗ |
| Assign Roles | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Stats | ✓ | ✓ | ✓ | ✓ | ✓ |
| Schedule Scrims | ✓ | ✓ | ✓ | ✓ | ✗ |
| Update Profile | ✓ | ✓ | ✓ | ✓ | ✓ |

Permission checks are enforced by:
1. **Backend**: `WriteAuthGuard` in NestJS + `role-hierarchy.ts` utilities
2. **Frontend**: `canAccess()` utility for UI filtering

---

## Common Queries

### Get User with All Relations
```sql
SELECT u.*, t.*, p.*, s.* FROM app_users u
LEFT JOIN teams t ON t.createdBy = u.id
LEFT JOIN players p ON p.userId = u.id
LEFT JOIN stats s ON s.userId = u.id
WHERE u.id = $1;
```

### Top Teams by ELO
```sql
SELECT * FROM teams ORDER BY elo DESC LIMIT 10;
```

### Player Stats by Hero
```sql
SELECT p.pseudo, h.name, s.eliminations, s.winRate 
FROM stats s
JOIN players p ON s.playerId = p.id
JOIN heroes h ON s.heroId = h.id
WHERE p.teamId = $1
ORDER BY s.winRate DESC;
```

### Scrim History
```sql
SELECT s.id, ta.name AS teamA, tb.name AS teamB, s.scoreA, s.scoreB, s.playedAt
FROM scrims s
JOIN teams ta ON s.teamAId = ta.id
JOIN teams tb ON s.teamBId = tb.id
WHERE s.playedAt IS NOT NULL
ORDER BY s.playedAt DESC;
```

---

## Notes
- All timestamps use UTC timezone
- Passwords are hashed server-side with bcryptjs
- ELO rating defaults to 1000 (chess standard)
- Role hierarchy is immutable; server enforces permissions
- Cascading deletes remove dependent records (teams → players → stats)
