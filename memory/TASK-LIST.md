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
- [ ] Install `winston`
- [ ] Create `src/utils/logger.ts` with console transport
- [ ] Configure log levels based on `NODE_ENV`
- [ ] Add request logging to Express app

### 3.2 Error Handler Middleware
- [ ] Create `src/middleware/errorHandler.ts`
- [ ] Define custom `AppError` class with status codes
- [ ] Handle Zod validation errors
- [ ] Handle unknown errors with generic 500 response
- [ ] Log errors with Winston

### 3.3 Validation Middleware
- [ ] Install `zod`
- [ ] Create `src/middleware/validate.ts` - generic Zod validation middleware
- [ ] Create `src/schemas/auth.schema.ts` - login request schema
- [ ] Create `src/schemas/tester.schema.ts` - create/update tester schemas
- [ ] Create `src/schemas/feedback.schema.ts`
- [ ] Create `src/schemas/incident.schema.ts`

### 3.4 CORS Middleware
- [ ] Install `cors`
- [ ] Create `src/middleware/cors.ts`
- [ ] Configure allowed origins from `FRONTEND_URL` env var
- [ ] Allow credentials for cookie-based auth

### 3.5 Rate Limiter Middleware
- [ ] Install `express-rate-limit`
- [ ] Create `src/middleware/rateLimiter.ts`
- [ ] Create standard limiter: 100 req/min
- [ ] Create strict limiter for public routes: 10 req/min

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 3: Backend core middleware"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 3.1, 3.2, 3.3, 3.4, 3.5 above**

---

## Phase 4: Authentication System

### 4.1 JWT Utilities
- [ ] Install `jsonwebtoken`, `@types/jsonwebtoken`
- [ ] Create `src/utils/jwt.ts` with `signToken()` and `verifyToken()` functions
- [ ] Configure token expiry from env (default 24h)

### 4.2 Auth Middleware
- [ ] Install `cookie-parser`
- [ ] Create `src/middleware/auth.ts`
- [ ] Extract JWT from httpOnly cookie
- [ ] Verify token and attach user to request
- [ ] Return 401 for invalid/missing tokens

### 4.3 Auth Controller
- [ ] Install `bcrypt`, `@types/bcrypt`
- [ ] Create `src/controllers/auth.controller.ts`
- [ ] Implement `login` - validate credentials, issue JWT, set cookie
- [ ] Implement `logout` - clear cookie
- [ ] Implement `me` - return current user info

### 4.4 Auth Routes
- [ ] Create `src/routes/auth.routes.ts`
- [ ] `POST /auth/login` - login handler with validation
- [ ] `POST /auth/logout` - logout handler (requires auth)
- [ ] `GET /auth/me` - get current user (requires auth)

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 4: Authentication system"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 4.1, 4.2, 4.3, 4.4 above**

---

## Phase 5: Baserow Service

### 5.1 Baserow Client
- [ ] Install `axios`
- [ ] Create `src/services/baserow.service.ts`
- [ ] Implement `BaserowService` class with axios instance
- [ ] Configure base URL and API token from env
- [ ] Store table IDs from env vars

### 5.2 Baserow CRUD Methods
- [ ] Implement `listRows<T>(table, options)` - with filters, pagination, ordering
- [ ] Implement `getRow<T>(table, id)`
- [ ] Implement `createRow<T>(table, data)`
- [ ] Implement `updateRow<T>(table, id, data)`
- [ ] Implement `deleteRow(table, id)`
- [ ] Export singleton `baserow` instance

### 5.3 Baserow Error Handling
- [ ] Create custom `BaserowError` class
- [ ] Handle network errors
- [ ] Handle 4xx/5xx responses with meaningful messages
- [ ] Log all Baserow API calls

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 5: Baserow service"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 5.1, 5.2, 5.3 above**

---

## Phase 6: Testers API

### 6.1 Testers Controller
- [ ] Create `src/controllers/testers.controller.ts`
- [ ] Implement `listTesters` - with stage/activity filters
- [ ] Implement `getTester` - single tester with computed stats
- [ ] Implement `createTester` - create with default stage 'prospect'
- [ ] Implement `updateTester` - partial update
- [ ] Implement `deleteTester` - soft or hard delete
- [ ] Implement `updateStage` - update stage with timestamp logging
- [ ] Implement `getTesterTimeline` - fetch communications + events

### 6.2 Testers Routes
- [ ] Create `src/routes/testers.routes.ts`
- [ ] `GET /api/testers` - list with query params
- [ ] `GET /api/testers/:id` - single tester
- [ ] `POST /api/testers` - create (validated)
- [ ] `PATCH /api/testers/:id` - update (validated)
- [ ] `DELETE /api/testers/:id` - delete
- [ ] `POST /api/testers/:id/stage` - update stage
- [ ] `GET /api/testers/:id/timeline` - timeline

### 6.3 Date Utilities
- [ ] Create `src/utils/dates.ts`
- [ ] Implement `calculateDaysInTest(startDate)` - days since started
- [ ] Implement `calculateDaysRemaining(startDate)` - days left of 14
- [ ] Implement `isInactive(lastActive, days)` - check inactivity

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 6: Testers API"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 6.1, 6.2, 6.3 above**

---

## Phase 7: Feedback & Incidents API

### 7.1 Feedback Controller & Routes
- [ ] Create `src/controllers/feedback.controller.ts`
- [ ] Implement CRUD: list, get, create, update, delete
- [ ] Create `src/routes/feedback.routes.ts`
- [ ] Wire up all endpoints with validation

### 7.2 Incidents Controller & Routes
- [ ] Create `src/controllers/incidents.controller.ts`
- [ ] Implement CRUD: list, get, create, update, delete
- [ ] Create `src/routes/incidents.routes.ts`
- [ ] Wire up all endpoints with validation

### 7.3 Communications Controller & Routes
- [ ] Create `src/controllers/communications.controller.ts`
- [ ] Implement: list (with tester filter), get, create (log manual comms)
- [ ] Create `src/routes/communications.routes.ts`

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 7: Feedback and incidents API"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 7.1, 7.2, 7.3 above**

---

## Phase 8: Email Service

### 8.1 Resend Integration
- [ ] Install `resend`
- [ ] Create `src/services/email.service.ts`
- [ ] Initialize Resend client with API key
- [ ] Implement `sendEmail(to, subject, html)` - basic send

### 8.2 Template Rendering
- [ ] Create `src/services/template.service.ts`
- [ ] Implement `renderTemplate(template, variables)` - replace `{{var}}`
- [ ] Implement `getTemplateVariables(tester)` - compute standard variables

### 8.3 Template Email Method
- [ ] Implement `sendTemplateEmail(tester, templateName, extraVars)`
- [ ] Fetch template from Baserow
- [ ] Render with tester variables
- [ ] Send via Resend
- [ ] Log communication to Baserow

### 8.4 Tester Email Endpoint
- [ ] Add `sendEmail` to testers controller
- [ ] Create `POST /api/testers/:id/send-email` route
- [ ] Support template name or custom subject/body

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 8: Email service"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 8.1, 8.2, 8.3, 8.4 above**

---

## Phase 9: Dashboard API

### 9.1 Dashboard Controller
- [ ] Create `src/controllers/dashboard.controller.ts`
- [ ] Implement `getStats` - total testers, active count, open incidents, retention rate
- [ ] Implement `getFunnel` - count per stage
- [ ] Implement `getActivity` - recent communications, feedback, incidents
- [ ] Implement `getAlerts` - inactive testers, new incidents, pending feedback

### 9.2 Dashboard Routes
- [ ] Create `src/routes/dashboard.routes.ts`
- [ ] `GET /api/dashboard/stats`
- [ ] `GET /api/dashboard/funnel`
- [ ] `GET /api/dashboard/activity`
- [ ] `GET /api/dashboard/alerts`

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 9: Dashboard API"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 9.1, 9.2 above**

---

## Phase 10: Cron Jobs

### 10.1 Job Scheduler
- [ ] Install `node-cron`
- [ ] Create `src/jobs/index.ts` - job scheduler initialization
- [ ] Call scheduler from `src/index.ts` after server starts

### 10.2 Daily Email Job
- [ ] Create `src/jobs/dailyEmailJob.ts`
- [ ] Schedule at 9:00 AM daily
- [ ] Query active testers
- [ ] Send day 3, 7, 12, 14 emails based on `started_at`
- [ ] Update stage to 'completed' on day 14

### 10.3 Inactivity Check Job
- [ ] Create `src/jobs/inactivityCheck.ts`
- [ ] Schedule at 10:00 AM daily
- [ ] Query active testers inactive 3+ days
- [ ] Create dropout incident if not exists
- [ ] Optionally send re-engagement email

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 10: Cron jobs"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 10.1, 10.2, 10.3 above**

---

## Phase 11: Public Routes & Health Check

### 11.1 Public Feedback Endpoint
- [ ] Create `src/routes/public.routes.ts`
- [ ] `POST /public/feedback` - accept feedback without auth
- [ ] Apply strict rate limiting
- [ ] Validate tester ID exists
- [ ] Create feedback and acknowledgment

### 11.2 Health Check
- [ ] `GET /public/health` - returns status, uptime, timestamp

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 11: Public routes and health check"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 11.1, 11.2 above**

---

## Phase 12: Frontend API Client & Auth

### 12.1 API Client
- [ ] Create `src/api/client.ts` - axios instance with `withCredentials`
- [ ] Add response interceptor for 401 → redirect to login
- [ ] Create `src/api/auth.ts` - login, logout, me functions

### 12.2 Auth Store (Zustand)
- [ ] Create `src/store/authStore.ts`
- [ ] State: `isAuthenticated`, `email`, `isLoading`
- [ ] Actions: `login`, `logout`, `checkAuth`
- [ ] Persist email to localStorage

### 12.3 Protected Route Component
- [ ] Create `src/components/layout/ProtectedRoute.tsx`
- [ ] Check auth state, redirect to `/login` if not authenticated
- [ ] Show loading spinner while checking

### 12.4 Login Page
- [ ] Create `src/pages/LoginPage.tsx`
- [ ] Email and password form
- [ ] Error display for invalid credentials
- [ ] Redirect to dashboard on success

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 12: Frontend API client and auth"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 12.1, 12.2, 12.3, 12.4 above**

---

## Phase 13: Frontend Layout & Navigation

### 13.1 App Layout
- [ ] Create `src/components/layout/AppLayout.tsx` - sidebar + main content
- [ ] Create `src/components/layout/Sidebar.tsx` - navigation links
- [ ] Create `src/components/layout/Header.tsx` - user info, logout

### 13.2 Routing Setup
- [ ] Configure routes in `App.tsx`:
  - `/login` - LoginPage
  - `/` - Dashboard (protected)
  - `/testers` - TestersPage (protected)
  - `/testers/:id` - TesterDetailPage (protected)
  - `/feedback` - FeedbackPage (protected)
  - `/incidents` - IncidentsPage (protected)

### 13.3 shadcn/ui Components
- [ ] Add components: Button, Card, Input, Label, Table, Badge, Dialog, Select, Tabs

### Phase 13 Tests ✓
```bash
npm run build              # Build succeeds
npm run dev                # Navigate through routes manually
```

### Phase 13 Completion
- [ ] All tests pass
- [ ] `git commit -m "Phase 13: Frontend layout and navigation"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 13.1, 13.2, 13.3 above**

---

## Phase 14: Dashboard Page

### 14.1 Dashboard API Hooks
- [ ] Create `src/api/dashboard.ts` - API functions
- [ ] Create `src/hooks/useDashboard.ts` - TanStack Query hooks

### 14.2 Dashboard Components
- [ ] Create `src/components/dashboard/StatsCard.tsx` - metric card
- [ ] Create `src/components/dashboard/StageDistribution.tsx` - stage counts
- [ ] Create `src/components/dashboard/TesterFunnel.tsx` - funnel visualization
- [ ] Create `src/components/dashboard/ActivityFeed.tsx` - recent activity list

### 14.3 Dashboard Page
- [ ] Create `src/pages/DashboardPage.tsx`
- [ ] Grid layout with stats cards
- [ ] Activity feed section
- [ ] Alerts section (needs attention items)

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 14: Dashboard page"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 14.1, 14.2, 14.3 above**

---

## Phase 15: Testers Pages

### 15.1 Testers API Hooks
- [ ] Create `src/api/testers.ts` - all tester API functions
- [ ] Create `src/hooks/useTesters.ts` - list, single, mutations

### 15.2 Testers List Components
- [ ] Create `src/components/testers/TesterTable.tsx` - sortable table
- [ ] Create `src/components/testers/TesterRow.tsx` - table row with actions
- [ ] Create `src/components/testers/StageSelect.tsx` - stage dropdown
- [ ] Create `src/components/testers/TesterForm.tsx` - create/edit form

### 15.3 Testers Page
- [ ] Create `src/pages/TestersPage.tsx`
- [ ] Table with filters (stage, activity)
- [ ] "Add Tester" button → dialog with form
- [ ] Row actions: view, edit stage, send email

### 15.4 Tester Detail Page
- [ ] Create `src/pages/TesterDetailPage.tsx`
- [ ] Profile header with stage badge
- [ ] Days in test / remaining display
- [ ] Create `src/components/testers/TesterTimeline.tsx` - event timeline
- [ ] Feedback and incidents tabs
- [ ] Send email dialog

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 15: Testers pages"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 15.1, 15.2, 15.3, 15.4 above**

---

## Phase 16: Feedback & Incidents Pages

### 16.1 Feedback Page
- [ ] Create `src/api/feedback.ts` and `src/hooks/useFeedback.ts`
- [ ] Create `src/components/feedback/FeedbackCard.tsx` - card display
- [ ] Create `src/components/feedback/FeedbackList.tsx` - list/kanban view
- [ ] Create `src/pages/FeedbackPage.tsx` - list with status filters

### 16.2 Incidents Page
- [ ] Create `src/api/incidents.ts` and `src/hooks/useIncidents.ts`
- [ ] Create `src/components/incidents/IncidentCard.tsx`
- [ ] Create `src/components/incidents/IncidentList.tsx`
- [ ] Create `src/pages/IncidentsPage.tsx` - list with status/type filters

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 16: Feedback and incidents pages"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 16.1, 16.2 above**

---

## Phase 17: Email Components

### 17.1 Email Template Management
- [ ] Create `src/api/templates.ts` and `src/hooks/useTemplates.ts`
- [ ] Create `src/components/email/EmailTemplateEditor.tsx` - template form
- [ ] Create `src/components/email/EmailPreview.tsx` - rendered preview
- [ ] Create `src/pages/EmailTemplatesPage.tsx` - list and edit templates

### 17.2 Send Email Dialog
- [ ] Create `src/components/email/SendEmailDialog.tsx`
- [ ] Template selector or custom message
- [ ] Preview before sending
- [ ] Send action with loading state

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 17: Email components"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 17.1, 17.2 above**

---

## Phase 18: Deployment Configuration

### 18.1 Backend Deployment
- [ ] Create `Dockerfile` (multi-stage build)
- [ ] Create `.do/app.yaml` for Digital Ocean
- [ ] Configure all environment variables in DO
- [ ] Test deployment manually

### 18.2 Frontend Deployment
- [ ] Create `.github/workflows/deploy.yml` for GitHub Pages
- [ ] Configure `VITE_API_URL` in GitHub repo variables
- [ ] Configure `vite.config.ts` base path for GitHub Pages
- [ ] Test deployment manually

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
- [ ] All tests pass
- [ ] `git commit -m "Phase 18: Deployment configuration"`
- [ ] `git push origin main`
- [ ] **After successful push: check all boxes in 18.1, 18.2 above**

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
