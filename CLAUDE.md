# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bonnenmonster Beta Manager** - A web dashboard for managing beta testers of the Bonnenmonster Flutter receipt scanning app. The project automates the 14-day beta testing lifecycle: recruitment, onboarding, automated email sequences, feedback collection, incident tracking, and production transition.

**Current Status**: Implementation complete. Both frontend and backend deployed on Digital Ocean.

## CRITICAL: Development Workflow

**You MUST follow the task list in [memory/TASK-LIST.md](memory/TASK-LIST.md) when developing this application.**

Rules:
1. Work through phases in order (Phase 1, then Phase 2, etc.)
2. Complete ALL subtasks in a phase before running tests
3. ALL tests must pass before committing
4. Commit and push to GitHub after each phase
5. Only after a successful push, mark the phase tasks as complete
6. Do NOT start the next phase until the current phase is fully complete and pushed

This ensures incremental, testable progress with version control checkpoints.

## Key Documentation

- [PRD-BETA-MANAGER.md](PRD-BETA-MANAGER.md) - Product requirements, user flows, feature specifications
- [TDD-BETA-MANAGER.md](TDD-BETA-MANAGER.md) - Technical design, API specs, data models, implementation details

## Intended Architecture

```
GitHub Pages (Frontend)          Digital Ocean (Backend)           Baserow (Database)
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────┐
│ Vite + React + TS   │─────────▶│ Node.js + Express   │─────────▶│ Tables:         │
│ Tailwind + shadcn   │          │ JWT auth, cron jobs │          │ - testers       │
│ TanStack Query      │          │ Resend email        │          │ - feedback      │
│ Zustand (auth)      │          │ Zod validation      │          │ - incidents     │
└─────────────────────┘          └─────────────────────┘          │ - communications│
                                                                   │ - email_templates│
                                                                   └─────────────────┘
```

**Frontend** (`beta-manager-web/`): Static SPA on GitHub Pages. No secrets, all API calls through backend.

**Backend** (`beta-manager-api/`): Express server on Digital Ocean App Platform. Handles auth, proxies Baserow, sends emails via Resend, runs cron jobs for automated email sequences.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand |
| Backend | Node.js, Express, node-cron, Zod, bcrypt, jsonwebtoken |
| Database | Baserow (REST API) |
| Email | Resend |
| Hosting | GitHub Pages (frontend), Digital Ocean App Platform (backend) |

## Data Model

Tester stages: `prospect` → `invited` → `accepted` → `installed` → `onboarded` → `active` → `completed` → `transitioned`

Alternative paths: `declined`, `dropped_out`, `unresponsive`

## API Structure

- `POST /auth/login` - JWT authentication
- `GET/POST/PATCH/DELETE /api/testers` - Tester CRUD
- `POST /api/testers/:id/send-email` - Send email to tester
- `GET/POST /api/feedback` - Feedback management
- `GET/POST /api/incidents` - Incident tracking
- `GET /api/dashboard/*` - Dashboard stats and activity
- `POST /public/feedback` - Public feedback API (no auth)
- `GET /feedback-form` - Public feedback form page (frontend route, no auth)

## Automated Emails (Cron)

Daily at 9 AM: Check active testers and send appropriate emails based on days since `started_at`:
- Day 3: Check-in
- Day 7: Mid-point survey
- Day 12: Wrap-up warning
- Day 14: Completion + mark as completed

Daily at 10 AM: Inactivity check (3+ days inactive → create dropout incident)

## Security Model

- Single admin user, password hashed with bcrypt
- JWT stored in httpOnly cookie (not localStorage)
- Baserow API token stored only in backend environment variables
- Frontend has no direct database access
- Rate limiting on all endpoints

## Environment Variables (Backend)

```
JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
BASEROW_API_TOKEN, BASEROW_*_TABLE_ID (5 tables)
RESEND_API_KEY, EMAIL_FROM
FRONTEND_URL, PLAY_STORE_LINK
```
