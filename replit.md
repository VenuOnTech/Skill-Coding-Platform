# CodeQuest - Competitive Programming Platform

## Overview

Full-stack competitive programming platform built with React + TailwindCSS frontend and Node.js + Express backend, using PostgreSQL for persistence. Features a full gamification system with XP, levels, star ranks, badges, streaks, daily quests, and weekly leaderboards.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS (dark mode), framer-motion, zustand, lucide-react
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT + bcryptjs
- **Code Execution**: Judge0 API (with built-in simulation fallback)
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

1. **Authentication** — JWT signup/login, bcrypt password hashing, user profiles
2. **Problem Library** — Problems categorized by difficulty (Easy, Medium, Hard), topic filtering, search, daily quest badge
3. **Code Editor** — Monaco Editor with Python and JavaScript support
4. **Code Execution** — Judge0 API integration (+ simulation fallback), run against sample/hidden test cases
5. **Gamification System**:
   - **XP & Levels** — Earn XP per problem solved; 10+ levels with thresholds
   - **Star Rank** — 1–5 stars based on level (1-2=⭐, 3-4=⭐⭐, 5-6=⭐⭐⭐, 7-8=⭐⭐⭐⭐, 9+=⭐⭐⭐⭐⭐)
   - **Badges** — 16 achievement badges across 5 categories (solving, xp, streak, quest, level), 4 rarities
   - **Daily Streak** — Flame counter for consecutive days coding
   - **Daily Quest** — Deterministic daily problem; earns 50% bonus XP
   - **Level-up notifications** — Toast + celebration overlay on level up/badge unlock
6. **Leaderboard** — Global XP rankings + Weekly leaderboard (problems solved this week)
7. **Profile Page** — XP progress bar, star rank, streak, badges grid, submission history

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/
│   │   └── src/
│   │       ├── routes/     # auth, problems, submissions, leaderboard, users, gamification
│   │       ├── middlewares/ # JWT auth middleware
│   │       └── lib/        # judge0.ts, gamification.ts
│   └── codequest/
│       └── src/
│           ├── pages/      # home, login, register, problems, problem-detail, leaderboard, profile
│           ├── components/ # Layout, GamificationComponents, CelebrationOverlay, Toaster, ui
│           ├── hooks/      # use-toast, use-celebration, use-mobile
│           ├── contexts/   # AuthContext
│           └── lib/        # utils (cn, formatDate, getLevelProgress)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/
│       └── src/schema/
│           ├── users.ts    # xp, level, starRank, streak, lastSolvedDate, dailyQuestsCompleted
│           ├── problems.ts
│           ├── testCases.ts
│           ├── submissions.ts
│           └── userBadges.ts
├── scripts/
│   └── src/seed.ts         # DB seed script (3 sample problems)
```

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (set by Replit)
- `JWT_SECRET` — Secret for JWT signing (defaults to dev key in dev mode)
- `JUDGE0_API_URL` — Judge0 API URL (optional, falls back to simulation)
- `JUDGE0_API_KEY` — RapidAPI key for Judge0 (optional)

## Running

- Frontend: `pnpm --filter @workspace/codequest run dev`
- API: `pnpm --filter @workspace/api-server run dev`
- Seed DB: `pnpm --filter @workspace/scripts run seed`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
- DB push: `pnpm --filter @workspace/db run push`

## XP System

- Easy problem: 50 XP (+ 25 XP Daily Quest bonus)
- Medium problem: 100 XP (+ 50 XP Daily Quest bonus)
- Hard problem: 200 XP (+ 100 XP Daily Quest bonus)
- XP only awarded on first Accepted submission
- Level thresholds: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500 XP

## Badge System (16 badges)

| Category | Badges |
|----------|--------|
| Solving  | First Blood (1), Hat Trick (3), Problem Solver (10), Veteran (25), Centurion (100) |
| XP       | XP Seeker (500), XP Hunter (1000), XP Legend (5000) |
| Streak   | On Fire (3-day), Week Warrior (7-day), Marathon (30-day) |
| Quest    | Daily Quester (1 quest), Quest Hunter (7 quests) |
| Level    | Rising Star (Lv5), Expert (Lv10), Master (Lv20) |

## API Routes

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (JWT required)
- `GET /api/problems` — List problems (filter by difficulty, topic, search)
- `GET /api/problems/:id` — Get problem detail
- `POST /api/submissions/run` — Run against sample test cases (JWT required)
- `POST /api/submissions` — Submit against all test cases (JWT required)
- `GET /api/submissions/history` — Submission history (JWT required)
- `GET /api/leaderboard` — Global leaderboard
- `GET /api/leaderboard/weekly` — Weekly leaderboard
- `GET /api/users/:id` — User profile
- `GET /api/gamification/badges` — All badges (with earned status if authenticated)
- `GET /api/gamification/badges/me` — User's earned badges (JWT required)
- `GET /api/gamification/daily-quest` — Today's daily quest problem
