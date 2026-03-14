# CodeQuest - Competitive Programming Platform

## Overview

Full-stack competitive programming platform built with React + TailwindCSS frontend and Node.js + Express backend, using PostgreSQL for persistence.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS (dark mode)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT + bcryptjs
- **Code Execution**: Judge0 API (with built-in simulation fallback)
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

1. **Authentication** — JWT signup/login, bcrypt password hashing, user profiles with XP and level
2. **Problem Library** — Problems categorized by difficulty (Easy, Medium, Hard), topic filtering, search
3. **Code Editor** — Monaco Editor with Python and JavaScript support
4. **Code Execution** — Judge0 API integration (+ simulation fallback), run against sample/hidden test cases
5. **Leaderboard** — Global XP-based rankings
6. **Database Models** — Users, Problems, TestCases, Submissions

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── routes/     # auth, problems, submissions, leaderboard, users
│   │       ├── middlewares/ # JWT auth middleware
│   │       └── lib/        # judge0.ts (code execution)
│   └── codequest/          # React + Vite frontend
│       └── src/
│           ├── pages/      # home, login, register, problems, problem-detail, leaderboard, profile
│           ├── components/ # Layout, UI components
│           └── contexts/   # AuthContext (JWT state)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── users.ts
│           ├── problems.ts
│           ├── testCases.ts
│           └── submissions.ts
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

- Easy problem: 50 XP
- Medium problem: 100 XP
- Hard problem: 200 XP
- Level up thresholds: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500 XP

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
- `GET /api/users/:id` — User profile
