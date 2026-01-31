# Beta Manager Implementation Task List

A structured implementation plan based on [TDD-BETA-MANAGER.md](../../Documents/Projects/beta-manager/TDD-BETA-MANAGER.md). Each phase concludes with tests that must pass before proceeding.

---

## Workflow Per Phase

Each phase follows this completion workflow:

1. **Complete all subtasks** in the phase
2. **Run tests** - all tests must pass
3. **Commit & Push**:
   ```bash
   git add .
   git commit -m "Phase X: [description]"
   git push origin main
   ```
4. **Mark complete** - After successful push, check off all completed tasks in this file
5. **Proceed** - Only after all above steps, start the next phase

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Backend Project Initialization
- [x] Create `beta-manager-api/` directory
- [x] Initialize Node.js project with `npm init`
- [x] Install dependencies: `express`, `typescript`, `ts-node`, `@types/node`, `@types/express`
- [x] Install dev dependencies: `nodemon`, `jest`, `@types/jest`, `ts-jest`, `supertest`
- [x] Create `tsconfig.json` with strict mode enabled
- [x] Create `src/index.ts` entry point with basic Express server
- [x] Create `src/app.ts` with Express app configuration
- [x] Add scripts to `package.json`: `dev`, `build`, `start`, `test`

### 1.2 Backend Project Structure
- [x] Create directory structure:
  ```
  src/
  ├── config/
  ├── middleware/
  ├── routes/
  ├── controllers/
  ├── services/
  ├── jobs/
  ├── schemas/
  ├── types/
  └── utils/
  ```
- [x] Create `src/config/env.ts` - environment variable loader with validation
- [x] Create `src/config/constants.ts` - app constants (tester stages, etc.)
- [x] Create `.env.example` with all required variables

### 1.3 Frontend Project Initialization
- [x] Create `beta-manager-web/` directory
- [x] Initialize Vite + React + TypeScript: `npm create vite@latest . -- --template react-ts`
- [x] Install Tailwind CSS and configure
- [x] Install and configure shadcn/ui
- [x] Install dependencies: `@tanstack/react-query`, `zustand`, `react-router-dom`, `axios`
- [x] Create `.env.example` with `VITE_API_URL`

### 1.4 Frontend Project Structure
- [x] Create directory structure:
  ```
  src/
  ├── api/
  ├── components/
  │   ├── ui/
  │   └── layout/
  ├── hooks/
  ├── lib/
  ├── pages/
  ├── store/
  ├── types/
  └── styles/
  ```
- [x] Create `src/lib/utils.ts` with `cn()` utility
- [x] Create `src/lib/constants.ts` with stage definitions
- [x] Configure React Router in `App.tsx`

### Phase 1 Tests ✓
```bash
# Backend
npm run build              # TypeScript compiles without errors
npm run dev                # Server starts on port 8080
curl localhost:8080        # Returns response (even if 404)

# Frontend
npm run build              # Vite builds without errors
npm run dev                # Dev server starts on port 5173
```

### Phase 1 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 1: Project setup and infrastructure"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 1.1, 1.2, 1.3, 1.4 above**

---

## Phase 2: Type Definitions & Shared Types

### 2.1 Backend Types
- [x] Create `src/types/tester.ts` - `Tester`, `TesterStage`, `TesterWithStats` interfaces
- [x] Create `src/types/feedback.ts` - `Feedback`, `FeedbackType`, `FeedbackSeverity`, `FeedbackStatus`
- [x] Create `src/types/incident.ts` - `Incident`, `IncidentType`, `IncidentSeverity`, `IncidentStatus`
- [x] Create `src/types/communication.ts` - `Communication`, `CommunicationChannel`, etc.
- [x] Create `src/types/email_template.ts` - `EmailTemplate` interface
- [x] Create `src/types/baserow.ts` - Baserow API response types
- [x] Create `src/types/index.ts` - re-export all types

### 2.2 Frontend Types
- [x] Create `src/types/tester.ts` - mirror backend types
- [x] Create `src/types/feedback.ts`
- [x] Create `src/types/incident.ts`
- [x] Create `src/types/communication.ts`
- [x] Create `src/types/api.ts` - API response wrapper types
- [x] Create `src/types/index.ts` - re-export all types

### Phase 2 Tests ✓
```bash
# Backend & Frontend
npm run build              # No TypeScript errors
# Manually verify: Types match TDD Section 4 data models
```

### Phase 2 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 2: Type definitions and shared types"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 2.1, 2.2 above**

---

## Phase 3: Backend Core Middleware

### 3.1 Logging Utility
- [x] Install `winston`
- [x] Create `src/utils/logger.ts` with console transport
- [x] Configure log levels based on `NODE_ENV`
- [x] Add request logging to Express app

### 3.2 Error Handler Middleware
- [x] Create `src/middleware/errorHandler.ts`
- [x] Define custom `AppError` class with status codes
- [x] Handle Zod validation errors
- [x] Handle unknown errors with generic 500 response
- [x] Log errors with Winston

### 3.3 Validation Middleware
- [x] Install `zod`
- [x] Create `src/middleware/validate.ts` - generic Zod validation middleware
- [x] Create `src/schemas/auth.schema.ts` - login request schema
- [x] Create `src/schemas/tester.schema.ts` - create/update tester schemas
- [x] Create `src/schemas/feedback.schema.ts`
- [x] Create `src/schemas/incident.schema.ts`

### 3.4 CORS Middleware
- [x] Install `cors`
- [x] Create `src/middleware/cors.ts`
- [x] Configure allowed origins from `FRONTEND_URL` env var
- [x] Allow credentials for cookie-based auth

### 3.5 Rate Limiter Middleware
- [x] Install `express-rate-limit`
- [x] Create `src/middleware/rateLimiter.ts`
- [x] Create standard limiter: 100 req/min
- [x] Create strict limiter for public routes: 10 req/min

### Phase 3 Tests ✓
```typescript
// tests/unit/middleware/errorHandler.test.ts
describe('errorHandler', () => {
  it('should return 400 for Zod validation errors');
  it('should return custom status for AppError');
  it('should return 500 for unknown errors');
  it('should log errors');
});

// tests/unit/middleware/validate.test.ts
describe('validate middleware', () => {
  it('should pass valid request body');
  it('should reject invalid request body with 400');
});
```
```bash
npm test -- --testPathPattern=middleware
```

### Phase 3 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 3: Backend core middleware"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 3.1, 3.2, 3.3, 3.4, 3.5 above**

---

## Phase 4: Authentication System

### 4.1 JWT Utilities
- [x] Install `jsonwebtoken`, `@types/jsonwebtoken`
- [x] Create `src/utils/jwt.ts` with `signToken()` and `verifyToken()` functions
- [x] Configure token expiry from env (default 24h)

### 4.2 Auth Middleware
- [x] Install `cookie-parser`
- [x] Create `src/middleware/auth.ts`
- [x] Extract JWT from httpOnly cookie
- [x] Verify token and attach user to request
- [x] Return 401 for invalid/missing tokens

### 4.3 Auth Controller
- [x] Install `bcrypt`, `@types/bcrypt`
- [x] Create `src/controllers/auth.controller.ts`
- [x] Implement `login` - validate credentials, issue JWT, set cookie
- [x] Implement `logout` - clear cookie
- [x] Implement `me` - return current user info

### 4.4 Auth Routes
- [x] Create `src/routes/auth.routes.ts`
- [x] `POST /auth/login` - login handler with validation
- [x] `POST /auth/logout` - logout handler (requires auth)
- [x] `GET /auth/me` - get current user (requires auth)

### Phase 4 Tests ✓
```typescript
// tests/unit/utils/jwt.test.ts
describe('JWT utils', () => {
  it('should sign and verify valid token');
  it('should reject expired token');
  it('should reject tampered token');
});

// tests/integration/routes/auth.test.ts
describe('Auth routes', () => {
  it('POST /auth/login - returns 401 for invalid credentials');
  it('POST /auth/login - sets httpOnly cookie on success');
  it('GET /auth/me - returns 401 without token');
  it('GET /auth/me - returns user info with valid token');
  it('POST /auth/logout - clears cookie');
});
```
```bash
npm test -- --testPathPattern=auth
```

### Phase 4 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 4: Authentication system"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 4.1, 4.2, 4.3, 4.4 above**

---

## Phase 5: Baserow Service

### 5.1 Baserow Client
- [x] Install `axios`
- [x] Create `src/services/baserow.service.ts`
- [x] Implement `BaserowService` class with axios instance
- [x] Configure base URL and API token from env
- [x] Store table IDs from env vars

### 5.2 Baserow CRUD Methods
- [x] Implement `listRows<T>(table, options)` - with filters, pagination, ordering
- [x] Implement `getRow<T>(table, id)`
- [x] Implement `createRow<T>(table, data)`
- [x] Implement `updateRow<T>(table, id, data)`
- [x] Implement `deleteRow(table, id)`
- [x] Export singleton `baserow` instance

### 5.3 Baserow Error Handling
- [x] Create custom `BaserowError` class
- [x] Handle network errors
- [x] Handle 4xx/5xx responses with meaningful messages
- [x] Log all Baserow API calls

### Phase 5 Tests ✓
```typescript
// tests/unit/services/baserow.service.test.ts
// Use jest.mock('axios') for unit tests

describe('BaserowService', () => {
  it('listRows - builds correct query params');
  it('listRows - handles empty results');
  it('getRow - returns single row');
  it('getRow - throws on 404');
  it('createRow - posts data correctly');
  it('updateRow - patches data correctly');
  it('deleteRow - calls correct endpoint');
});
```
```bash
npm test -- --testPathPattern=baserow
```

### Phase 5 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 5: Baserow service"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 5.1, 5.2, 5.3 above**

---

## Phase 6: Testers API

### 6.1 Testers Controller
- [x] Create `src/controllers/testers.controller.ts`
- [x] Implement `listTesters` - with stage/activity filters
- [x] Implement `getTester` - single tester with computed stats
- [x] Implement `createTester` - create with default stage 'prospect'
- [x] Implement `updateTester` - partial update
- [x] Implement `deleteTester` - soft or hard delete
- [x] Implement `updateStage` - update stage with timestamp logging
- [x] Implement `getTesterTimeline` - fetch communications + events

### 6.2 Testers Routes
- [x] Create `src/routes/testers.routes.ts`
- [x] `GET /api/testers` - list with query params
- [x] `GET /api/testers/:id` - single tester
- [x] `POST /api/testers` - create (validated)
- [x] `PATCH /api/testers/:id` - update (validated)
- [x] `DELETE /api/testers/:id` - delete
- [x] `POST /api/testers/:id/stage` - update stage
- [x] `GET /api/testers/:id/timeline` - timeline

### 6.3 Date Utilities
- [x] Create `src/utils/dates.ts`
- [x] Implement `calculateDaysInTest(startDate)` - days since started
- [x] Implement `calculateDaysRemaining(startDate)` - days left of 14
- [x] Implement `isInactive(lastActive, days)` - check inactivity

### Phase 6 Tests ✓
```typescript
// tests/unit/controllers/testers.controller.test.ts
describe('TestersController', () => {
  it('listTesters - returns paginated results');
  it('listTesters - filters by stage');
  it('getTester - includes computed stats');
  it('createTester - sets default stage');
  it('updateStage - updates timestamp fields');
});

// tests/integration/routes/testers.test.ts
describe('Testers API', () => {
  it('GET /api/testers - requires auth');
  it('GET /api/testers - returns tester list');
  it('POST /api/testers - creates new tester');
  it('POST /api/testers - validates required fields');
  it('PATCH /api/testers/:id - updates tester');
  it('POST /api/testers/:id/stage - updates stage');
});
```
```bash
npm test -- --testPathPattern=testers
```

### Phase 6 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 6: Testers API"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 6.1, 6.2, 6.3 above**

---

## Phase 7: Feedback & Incidents API

### 7.1 Feedback Controller & Routes
- [x] Create `src/controllers/feedback.controller.ts`
- [x] Implement CRUD: list, get, create, update, delete
- [x] Create `src/routes/feedback.routes.ts`
- [x] Wire up all endpoints with validation

### 7.2 Incidents Controller & Routes
- [x] Create `src/controllers/incidents.controller.ts`
- [x] Implement CRUD: list, get, create, update, delete
- [x] Create `src/routes/incidents.routes.ts`
- [x] Wire up all endpoints with validation

### 7.3 Communications Controller & Routes
- [x] Create `src/controllers/communications.controller.ts`
- [x] Implement: list (with tester filter), get, create (log manual comms)
- [x] Create `src/routes/communications.routes.ts`

### Phase 7 Tests ✓
```typescript
// tests/integration/routes/feedback.test.ts
describe('Feedback API', () => {
  it('GET /api/feedback - returns feedback list');
  it('POST /api/feedback - creates feedback');
  it('PATCH /api/feedback/:id - updates status');
});

// tests/integration/routes/incidents.test.ts
describe('Incidents API', () => {
  it('GET /api/incidents - returns incidents list');
  it('POST /api/incidents - creates incident');
  it('PATCH /api/incidents/:id - resolves incident');
});
```
```bash
npm test -- --testPathPattern="feedback|incidents|communications"
```

### Phase 7 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 7: Feedback and incidents API"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 7.1, 7.2, 7.3 above**

---

## Phase 8: Email Service

### 8.1 Resend Integration
- [x] Install `resend`
- [x] Create `src/services/email.service.ts`
- [x] Initialize Resend client with API key
- [x] Implement `sendEmail(to, subject, html)` - basic send

### 8.2 Template Rendering
- [x] Create `src/services/template.service.ts`
- [x] Implement `renderTemplate(template, variables)` - replace `{{var}}`
- [x] Implement `getTemplateVariables(tester)` - compute standard variables

### 8.3 Template Email Method
- [x] Implement `sendTemplateEmail(tester, templateName, extraVars)`
- [x] Fetch template from Baserow
- [x] Render with tester variables
- [x] Send via Resend
- [x] Log communication to Baserow

### 8.4 Tester Email Endpoint
- [x] Add `sendEmail` to testers controller
- [x] Create `POST /api/testers/:id/send-email` route
- [x] Support template name or custom subject/body

### Phase 8 Tests ✓
```typescript
// tests/unit/services/template.service.test.ts
describe('TemplateService', () => {
  it('renderTemplate - replaces single variable');
  it('renderTemplate - replaces multiple variables');
  it('renderTemplate - handles missing variables');
  it('getTemplateVariables - calculates days remaining');
});

// tests/unit/services/email.service.test.ts (mock Resend)
describe('EmailService', () => {
  it('sendTemplateEmail - fetches template');
  it('sendTemplateEmail - renders variables');
  it('sendTemplateEmail - logs communication');
  it('sendTemplateEmail - throws for missing template');
});
```
```bash
npm test -- --testPathPattern="email|template"
```

### Phase 8 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 8: Email service"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 8.1, 8.2, 8.3, 8.4 above**

---

## Phase 9: Dashboard API

### 9.1 Dashboard Controller
- [x] Create `src/controllers/dashboard.controller.ts`
- [x] Implement `getStats` - total testers, active count, open incidents, retention rate
- [x] Implement `getFunnel` - count per stage
- [x] Implement `getActivity` - recent communications, feedback, incidents
- [x] Implement `getAlerts` - inactive testers, new incidents, pending feedback

### 9.2 Dashboard Routes
- [x] Create `src/routes/dashboard.routes.ts`
- [x] `GET /api/dashboard/stats`
- [x] `GET /api/dashboard/funnel`
- [x] `GET /api/dashboard/activity`
- [x] `GET /api/dashboard/alerts`

### Phase 9 Tests ✓
```typescript
// tests/integration/routes/dashboard.test.ts
describe('Dashboard API', () => {
  it('GET /api/dashboard/stats - returns stats object');
  it('GET /api/dashboard/funnel - returns stage counts');
  it('GET /api/dashboard/activity - returns recent items');
  it('GET /api/dashboard/alerts - returns attention items');
});
```
```bash
npm test -- --testPathPattern=dashboard
```

### Phase 9 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 9: Dashboard API"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 9.1, 9.2 above**

---

## Phase 10: Cron Jobs

### 10.1 Job Scheduler
- [x] Install `node-cron`
- [x] Create `src/jobs/index.ts` - job scheduler initialization
- [x] Call scheduler from `src/index.ts` after server starts

### 10.2 Daily Email Job
- [x] Create `src/jobs/dailyEmailJob.ts`
- [x] Schedule at 9:00 AM daily
- [x] Query active testers
- [x] Send day 3, 7, 12, 14 emails based on `started_at`
- [x] Update stage to 'completed' on day 14

### 10.3 Inactivity Check Job
- [x] Create `src/jobs/inactivityCheck.ts`
- [x] Schedule at 10:00 AM daily
- [x] Query active testers inactive 3+ days
- [x] Create dropout incident if not exists
- [x] Optionally send re-engagement email

### Phase 10 Tests ✓
```typescript
// tests/unit/jobs/dailyEmailJob.test.ts
describe('dailyEmailJob', () => {
  it('sends day 3 email for testers at day 3');
  it('sends day 7 email for testers at day 7');
  it('sends day 14 email and marks completed');
  it('skips testers without started_at');
  it('handles email send failures gracefully');
});

// tests/unit/jobs/inactivityCheck.test.ts
describe('inactivityCheck', () => {
  it('creates incident for inactive testers');
  it('skips if incident already exists');
  it('calculates inactivity correctly');
});
```
```bash
npm test -- --testPathPattern=jobs
```

### Phase 10 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 10: Cron jobs"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 10.1, 10.2, 10.3 above**

---

## Phase 11: Public Routes & Health Check

### 11.1 Public Feedback Endpoint
- [x] Create `src/routes/public.routes.ts`
- [x] `POST /public/feedback` - accept feedback without auth
- [x] Apply strict rate limiting
- [x] Validate tester ID exists
- [x] Create feedback and acknowledgment

### 11.2 Health Check
- [x] `GET /public/health` - returns status, uptime, timestamp

### Phase 11 Tests ✓
```typescript
// tests/integration/routes/public.test.ts
describe('Public routes', () => {
  it('POST /public/feedback - creates feedback without auth');
  it('POST /public/feedback - rate limited');
  it('GET /public/health - returns ok status');
});
```
```bash
npm test -- --testPathPattern=public
```

### Phase 11 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 11: Public routes and health check"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 11.1, 11.2 above**

---

## Phase 12: Frontend API Client & Auth

### 12.1 API Client
- [x] Create `src/api/client.ts` - axios instance with `withCredentials`
- [x] Add response interceptor for 401 → redirect to login
- [x] Create `src/api/auth.ts` - login, logout, me functions

### 12.2 Auth Store (Zustand)
- [x] Create `src/store/authStore.ts`
- [x] State: `isAuthenticated`, `email`, `isLoading`
- [x] Actions: `login`, `logout`, `checkAuth`
- [x] Persist email to localStorage

### 12.3 Protected Route Component
- [x] Create `src/components/layout/ProtectedRoute.tsx`
- [x] Check auth state, redirect to `/login` if not authenticated
- [x] Show loading spinner while checking

### 12.4 Login Page
- [x] Create `src/pages/LoginPage.tsx`
- [x] Email and password form
- [x] Error display for invalid credentials
- [x] Redirect to dashboard on success

### Phase 12 Tests ✓
```typescript
// src/store/authStore.test.ts
describe('authStore', () => {
  it('login sets isAuthenticated');
  it('logout clears state');
  it('checkAuth validates session');
});

// src/components/layout/ProtectedRoute.test.tsx
describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated');
  it('renders children when authenticated');
  it('shows loader while checking');
});
```
```bash
npm test
```

### Phase 12 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 12: Frontend API client and auth"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 12.1, 12.2, 12.3, 12.4 above**

---

## Phase 13: Frontend Layout & Navigation

### 13.1 App Layout
- [x] Create `src/components/layout/AppLayout.tsx` - sidebar + main content
- [x] Create `src/components/layout/Sidebar.tsx` - navigation links
- [x] Create `src/components/layout/Header.tsx` - user info, logout

### 13.2 Routing Setup
- [x] Configure routes in `App.tsx`:
  - `/login` - LoginPage
  - `/` - Dashboard (protected)
  - `/testers` - TestersPage (protected)
  - `/testers/:id` - TesterDetailPage (protected)
  - `/feedback` - FeedbackPage (protected)
  - `/incidents` - IncidentsPage (protected)

### 13.3 shadcn/ui Components
- [x] Add components: Button, Card, Input, Label, Table, Badge, Dialog, Select, Tabs

### Phase 13 Tests ✓
```bash
npm run build              # Build succeeds
npm run dev                # Navigate through routes manually
```

### Phase 13 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 13: Frontend layout and navigation"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 13.1, 13.2, 13.3 above**

---

## Phase 14: Dashboard Page

### 14.1 Dashboard API Hooks
- [x] Create `src/api/dashboard.ts` - API functions
- [x] Create `src/hooks/useDashboard.ts` - TanStack Query hooks

### 14.2 Dashboard Components
- [x] Create `src/components/dashboard/StatsCard.tsx` - metric card
- [x] Create `src/components/dashboard/StageDistribution.tsx` - stage counts
- [x] Create `src/components/dashboard/TesterFunnel.tsx` - funnel visualization
- [x] Create `src/components/dashboard/ActivityFeed.tsx` - recent activity list

### 14.3 Dashboard Page
- [x] Create `src/pages/DashboardPage.tsx`
- [x] Grid layout with stats cards
- [x] Activity feed section
- [x] Alerts section (needs attention items)

### Phase 14 Tests ✓
```typescript
// src/components/dashboard/StatsCard.test.tsx
describe('StatsCard', () => {
  it('renders label and value');
  it('renders loading state');
});

// src/pages/DashboardPage.test.tsx
describe('DashboardPage', () => {
  it('fetches and displays stats');
  it('shows loading state');
});
```
```bash
npm test -- --testPathPattern=dashboard
```

### Phase 14 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 14: Dashboard page"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 14.1, 14.2, 14.3 above**

---

## Phase 15: Testers Pages

### 15.1 Testers API Hooks
- [x] Create `src/api/testers.ts` - all tester API functions
- [x] Create `src/hooks/useTesters.ts` - list, single, mutations

### 15.2 Testers List Components
- [x] Create `src/components/testers/TesterTable.tsx` - sortable table
- [x] Create `src/components/testers/TesterRow.tsx` - table row with actions
- [x] Create `src/components/testers/StageSelect.tsx` - stage dropdown
- [x] Create `src/components/testers/TesterForm.tsx` - create/edit form

### 15.3 Testers Page
- [x] Create `src/pages/TestersPage.tsx`
- [x] Table with filters (stage, activity)
- [x] "Add Tester" button → dialog with form
- [x] Row actions: view, edit stage, send email

### 15.4 Tester Detail Page
- [x] Create `src/pages/TesterDetailPage.tsx`
- [x] Profile header with stage badge
- [x] Days in test / remaining display
- [x] Create `src/components/testers/TesterTimeline.tsx` - event timeline
- [x] Feedback and incidents tabs
- [x] Send email dialog

### Phase 15 Tests ✓
```typescript
// src/components/testers/TesterTable.test.tsx
describe('TesterTable', () => {
  it('renders tester rows');
  it('shows empty state');
  it('handles loading state');
});

// src/pages/TestersPage.test.tsx
describe('TestersPage', () => {
  it('fetches and displays testers');
  it('opens add tester dialog');
  it('filters by stage');
});
```
```bash
npm test -- --testPathPattern=testers
```

### Phase 15 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 15: Testers pages"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 15.1, 15.2, 15.3, 15.4 above**

---

## Phase 16: Feedback & Incidents Pages

### 16.1 Feedback Page
- [x] Create `src/api/feedback.ts` and `src/hooks/useFeedback.ts`
- [x] Create `src/components/feedback/FeedbackCard.tsx` - card display
- [x] Create `src/components/feedback/FeedbackList.tsx` - list/kanban view
- [x] Create `src/pages/FeedbackPage.tsx` - list with status filters

### 16.2 Incidents Page
- [x] Create `src/api/incidents.ts` and `src/hooks/useIncidents.ts`
- [x] Create `src/components/incidents/IncidentCard.tsx`
- [x] Create `src/components/incidents/IncidentList.tsx`
- [x] Create `src/pages/IncidentsPage.tsx` - list with status/type filters

### Phase 16 Tests ✓
```typescript
// src/pages/FeedbackPage.test.tsx
describe('FeedbackPage', () => {
  it('fetches and displays feedback');
  it('filters by status');
  it('updates feedback status');
});

// src/pages/IncidentsPage.test.tsx
describe('IncidentsPage', () => {
  it('fetches and displays incidents');
  it('filters by type');
  it('resolves incident');
});
```
```bash
npm test -- --testPathPattern="feedback|incidents"
```

### Phase 16 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 16: Feedback and incidents pages"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 16.1, 16.2 above**

---

## Phase 17: Email Components

### 17.1 Email Template Management
- [x] Create `src/api/templates.ts` and `src/hooks/useTemplates.ts`
- [x] Create `src/components/email/EmailTemplateEditor.tsx` - template form
- [x] Create `src/components/email/EmailPreview.tsx` - rendered preview
- [x] Create `src/pages/EmailTemplatesPage.tsx` - list and edit templates

### 17.2 Send Email Dialog
- [x] Create `src/components/email/SendEmailDialog.tsx`
- [x] Template selector or custom message
- [x] Preview before sending
- [x] Send action with loading state

### Phase 17 Tests ✓
```typescript
// src/components/email/SendEmailDialog.test.tsx
describe('SendEmailDialog', () => {
  it('loads available templates');
  it('shows preview');
  it('sends email on confirm');
});
```
```bash
npm test -- --testPathPattern=email
```

### Phase 17 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 17: Email components"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 17.1, 17.2 above**

---

## Phase 18: Deployment Configuration

### 18.1 Backend Deployment
- [x] Create `Dockerfile` (multi-stage build)
- [x] Create `.do/app.yaml` for Digital Ocean
- [x] Configure all environment variables in DO
- [x] Test deployment manually

### 18.2 Frontend Deployment
- [x] Create `.github/workflows/deploy.yml` for GitHub Pages
- [x] Configure `VITE_API_URL` in GitHub repo variables
- [x] Configure `vite.config.ts` base path for GitHub Pages
- [x] Test deployment manually

### Phase 18 Tests ✓
```bash
# Backend
docker build -t beta-manager-api .
docker run -p 8080:8080 --env-file .env beta-manager-api
curl localhost:8080/public/health

# Frontend
npm run build
npx serve dist
# Visit http://localhost:3000
```

### Phase 18 Completion
- [x] All tests pass
- [x] `git commit -m "Phase 18: Deployment configuration"`
- [x] `git push origin main`
- [x] **After successful push: check all boxes in 18.1, 18.2 above**

---

## Phase 19: End-to-End Testing

### 19.1 Setup E2E Testing
- [ ] Install Playwright or Cypress in frontend
- [ ] Configure test environment with test API

### 19.2 Core User Flows
- [ ] Test: Login flow
- [ ] Test: Add new tester
- [ ] Test: Update tester stage
- [ ] Test: Send email to tester
- [ ] Test: View dashboard stats
- [ ] Test: Submit public feedback
- [ ] Test: Logout flow

### Phase 19 Tests ✓
```bash
npm run test:e2e            # All E2E tests pass
```

### Phase 19 Completion
- [ ] All E2E tests pass
- [ ] `git commit -m "Phase 19: End-to-end testing"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 19.1, 19.2 above**

---

## Final Verification Checklist

Before considering the project complete:

- [ ] All 19 phases completed and pushed to GitHub
- [ ] All unit tests pass: `npm test` in both projects
- [ ] All integration tests pass
- [ ] E2E tests pass
- [ ] Backend deploys to Digital Ocean successfully
- [ ] Frontend deploys to GitHub Pages successfully
- [ ] Login works in production
- [ ] Can add and manage testers
- [ ] Emails send successfully (test with real Resend account)
- [ ] Cron jobs execute on schedule (check logs)
- [ ] Public feedback form works

### Final Commit
```bash
git commit -m "Project complete: Beta Manager v1.0"
git push origin main
git tag v1.0.0
git push origin v1.0.0
```
