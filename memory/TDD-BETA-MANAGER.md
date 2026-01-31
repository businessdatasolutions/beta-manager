# Technical Design Document (TDD): Bonnenmonster Beta Manager

## 1. Document Overview

**Document Version:** 1.0
**Last Updated:** 2025-01-31
**Project:** Bonnenmonster Beta Manager
**Platform:** Web Dashboard (Vite + React + Node.js)

**Related Documents:**
- [PRD-BETA-MANAGER.md](./PRD-BETA-MANAGER.md) - Product Requirements Document

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Pages (Static Hosting)                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           Vite + React SPA (TypeScript)                  │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Presentation Layer                              │    │    │
│  │  │  - React Components (shadcn/ui)                  │    │    │
│  │  │  - TanStack Query (data fetching)                │    │    │
│  │  │  - React Router (navigation)                     │    │    │
│  │  │  - Zustand (auth state)                          │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               Digital Ocean App Platform (Backend)               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Node.js + Express Server                    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  API Layer                                       │    │    │
│  │  │  - Authentication (JWT + bcrypt)                 │    │    │
│  │  │  - REST endpoints (testers, feedback, etc.)      │    │    │
│  │  │  - Input validation (zod)                        │    │    │
│  │  │  - Rate limiting                                 │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Service Layer                                   │    │    │
│  │  │  - Baserow client                                │    │    │
│  │  │  - Resend email service                          │    │    │
│  │  │  - Cron jobs (node-cron)                         │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (Baserow token)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Baserow (Database)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Tables                                                  │    │
│  │  - testers                                               │    │
│  │  - feedback                                              │    │
│  │  - incidents                                             │    │
│  │  - communications                                        │    │
│  │  - email_templates                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Resend    │  │  Crashlytics │  │ Play Console │          │
│  │   (Email)    │  │    (API)     │  │    (API)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
┌────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Browser │────▶│ GitHub  │────▶│ React   │────▶│ API     │
│        │     │ Pages   │     │ SPA     │     │ Request │
└────────┘     └─────────┘     └─────────┘     └────┬────┘
                                                     │
    ┌────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    DO App Platform                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   CORS   │───▶│   JWT    │───▶│  Route   │              │
│  │  Check   │    │  Verify  │    │ Handler  │              │
│  └──────────┘    └──────────┘    └────┬─────┘              │
│                                        │                    │
│                                        ▼                    │
│                               ┌──────────────┐             │
│                               │   Service    │             │
│                               │    Layer     │             │
│                               └──────┬───────┘             │
│                                      │                      │
└──────────────────────────────────────┼──────────────────────┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │   Baserow    │
                              │     API      │
                              └──────────────┘
```

---

## 3. Project Structure

### 3.1 Frontend (beta-manager-web)

```
beta-manager-web/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages deployment
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component with router
│   ├── vite-env.d.ts
│   │
│   ├── api/
│   │   ├── client.ts               # Axios instance with interceptors
│   │   ├── auth.ts                 # Auth API calls
│   │   ├── testers.ts              # Tester API calls
│   │   ├── feedback.ts             # Feedback API calls
│   │   ├── incidents.ts            # Incident API calls
│   │   └── communications.ts       # Communication API calls
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Main layout with sidebar
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ProtectedRoute.tsx  # Auth guard
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── TesterFunnel.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── StageDistribution.tsx
│   │   │
│   │   ├── testers/
│   │   │   ├── TesterTable.tsx
│   │   │   ├── TesterRow.tsx
│   │   │   ├── TesterDetail.tsx
│   │   │   ├── TesterForm.tsx
│   │   │   ├── StageSelect.tsx
│   │   │   └── TesterTimeline.tsx
│   │   │
│   │   ├── feedback/
│   │   │   ├── FeedbackList.tsx
│   │   │   ├── FeedbackCard.tsx
│   │   │   └── FeedbackForm.tsx
│   │   │
│   │   ├── incidents/
│   │   │   ├── IncidentList.tsx
│   │   │   ├── IncidentCard.tsx
│   │   │   └── IncidentForm.tsx
│   │   │
│   │   └── email/
│   │       ├── EmailTemplateEditor.tsx
│   │       ├── EmailPreview.tsx
│   │       └── SendEmailDialog.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth state hook
│   │   ├── useTesters.ts           # TanStack Query hooks
│   │   ├── useFeedback.ts
│   │   ├── useIncidents.ts
│   │   └── useDashboard.ts
│   │
│   ├── lib/
│   │   ├── utils.ts                # cn() and utilities
│   │   └── constants.ts            # Stage definitions, etc.
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TestersPage.tsx
│   │   ├── TesterDetailPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   ├── IncidentsPage.tsx
│   │   ├── EmailTemplatesPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── store/
│   │   └── authStore.ts            # Zustand auth store
│   │
│   ├── types/
│   │   ├── tester.ts
│   │   ├── feedback.ts
│   │   ├── incident.ts
│   │   ├── communication.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css             # Tailwind imports
│
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 3.2 Backend (beta-manager-api)

```
beta-manager-api/
├── src/
│   ├── index.ts                    # App entry point
│   ├── app.ts                      # Express app setup
│   │
│   ├── config/
│   │   ├── env.ts                  # Environment variables
│   │   └── constants.ts            # App constants
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification
│   │   ├── cors.ts                 # CORS configuration
│   │   ├── rateLimiter.ts          # Rate limiting
│   │   ├── errorHandler.ts         # Global error handler
│   │   └── validate.ts             # Zod validation middleware
│   │
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── auth.routes.ts          # /auth/*
│   │   ├── testers.routes.ts       # /api/testers/*
│   │   ├── feedback.routes.ts      # /api/feedback/*
│   │   ├── incidents.routes.ts     # /api/incidents/*
│   │   ├── communications.routes.ts
│   │   ├── dashboard.routes.ts     # /api/dashboard/*
│   │   └── public.routes.ts        # /public/* (no auth)
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── testers.controller.ts
│   │   ├── feedback.controller.ts
│   │   ├── incidents.controller.ts
│   │   ├── communications.controller.ts
│   │   └── dashboard.controller.ts
│   │
│   ├── services/
│   │   ├── baserow.service.ts      # Baserow API client
│   │   ├── email.service.ts        # Resend integration
│   │   ├── cron.service.ts         # Scheduled jobs
│   │   └── template.service.ts     # Email template rendering
│   │
│   ├── jobs/
│   │   ├── dailyEmailJob.ts        # Day 3, 7, 12, 14 emails
│   │   ├── inactivityCheck.ts      # Dropout detection
│   │   └── index.ts                # Job scheduler
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts          # Zod schemas
│   │   ├── tester.schema.ts
│   │   ├── feedback.schema.ts
│   │   └── incident.schema.ts
│   │
│   ├── types/
│   │   ├── tester.ts
│   │   ├── feedback.ts
│   │   ├── incident.ts
│   │   └── baserow.ts
│   │
│   └── utils/
│       ├── logger.ts               # Winston logger
│       ├── jwt.ts                  # JWT helpers
│       └── dates.ts                # Date utilities
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── controllers/
│   └── integration/
│       └── routes/
│
├── Dockerfile
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 4. Data Models

### 4.1 TypeScript Types (Shared)

```typescript
// types/tester.ts
export type TesterStage =
  | 'prospect'
  | 'invited'
  | 'accepted'
  | 'installed'
  | 'onboarded'
  | 'active'
  | 'completed'
  | 'transitioned'
  | 'declined'
  | 'dropped_out'
  | 'unresponsive';

export interface Tester {
  id: number;
  name: string;
  email: string;
  phone?: string;
  source: 'email' | 'linkedin' | 'whatsapp' | 'referral' | 'other';
  stage: TesterStage;
  invited_at?: string;      // ISO date
  started_at?: string;      // ISO date (when test period began)
  last_active?: string;     // ISO date
  completed_at?: string;    // ISO date
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TesterWithStats extends Tester {
  days_in_test: number;
  days_remaining: number;
  feedback_count: number;
  incident_count: number;
}
```

```typescript
// types/feedback.ts
export type FeedbackType = 'bug' | 'feature_request' | 'ux_issue' | 'general';
export type FeedbackSeverity = 'critical' | 'major' | 'minor';
export type FeedbackStatus = 'new' | 'in_review' | 'addressed' | 'closed';

export interface Feedback {
  id: number;
  tester_id: number;        // Link to testers table
  type: FeedbackType;
  severity?: FeedbackSeverity;
  title: string;
  content: string;
  status: FeedbackStatus;
  device_info?: string;
  app_version?: string;
  screenshot_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}
```

```typescript
// types/incident.ts
export type IncidentType = 'crash' | 'bug' | 'ux_complaint' | 'dropout' | 'uninstall';
export type IncidentSeverity = 'critical' | 'major' | 'minor';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface Incident {
  id: number;
  tester_id?: number;       // Link to testers table (optional for general crashes)
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  status: IncidentStatus;
  source: 'manual' | 'crashlytics' | 'automated';
  crash_id?: string;        // Crashlytics crash ID
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}
```

```typescript
// types/communication.ts
export type CommunicationChannel = 'email' | 'whatsapp' | 'linkedin' | 'phone' | 'other';
export type CommunicationDirection = 'outbound' | 'inbound';
export type CommunicationStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface Communication {
  id: number;
  tester_id: number;        // Link to testers table
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;         // For emails
  content: string;
  template_name?: string;   // e.g., 'invitation', 'day_7_checkin'
  status?: CommunicationStatus;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}
```

```typescript
// types/email_template.ts
export interface EmailTemplate {
  id: number;
  name: string;             // e.g., 'invitation', 'day_3_checkin'
  subject: string;
  body: string;             // HTML with {{variables}}
  variables: string[];      // ['name', 'days_remaining', 'feedback_link']
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 5. Database Schema (Baserow)

### 5.1 Table: testers

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Auto-increment | Yes | Primary key |
| name | Text | Yes | Full name |
| email | Email | Yes | Unique |
| phone | Phone | No | With country code |
| source | Single select | Yes | Options: email, linkedin, whatsapp, referral, other |
| stage | Single select | Yes | See TesterStage type |
| invited_at | Date | No | When invitation was sent |
| started_at | Date | No | When 14-day period began |
| last_active | Date | No | Last known activity |
| completed_at | Date | No | When test period ended |
| notes | Long text | No | Admin notes |
| created_at | Created on | Yes | Auto |
| updated_at | Last modified | Yes | Auto |

### 5.2 Table: feedback

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Auto-increment | Yes | Primary key |
| tester | Link to testers | Yes | Foreign key |
| type | Single select | Yes | bug, feature_request, ux_issue, general |
| severity | Single select | No | critical, major, minor |
| title | Text | Yes | Short summary |
| content | Long text | Yes | Full feedback |
| status | Single select | Yes | new, in_review, addressed, closed |
| device_info | Text | No | e.g., "Pixel 7, Android 14" |
| app_version | Text | No | e.g., "1.2.0 (45)" |
| screenshot_url | URL | No | Link to screenshot |
| admin_notes | Long text | No | Internal notes |
| created_at | Created on | Yes | Auto |
| updated_at | Last modified | Yes | Auto |

### 5.3 Table: incidents

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Auto-increment | Yes | Primary key |
| tester | Link to testers | No | Foreign key (optional) |
| type | Single select | Yes | crash, bug, ux_complaint, dropout, uninstall |
| severity | Single select | Yes | critical, major, minor |
| title | Text | Yes | Short summary |
| description | Long text | Yes | Full description |
| status | Single select | Yes | open, investigating, resolved |
| source | Single select | Yes | manual, crashlytics, automated |
| crash_id | Text | No | Crashlytics ID |
| resolved_at | Date | No | Resolution date |
| resolution_notes | Long text | No | How it was resolved |
| created_at | Created on | Yes | Auto |
| updated_at | Last modified | Yes | Auto |

### 5.4 Table: communications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Auto-increment | Yes | Primary key |
| tester | Link to testers | Yes | Foreign key |
| channel | Single select | Yes | email, whatsapp, linkedin, phone, other |
| direction | Single select | Yes | outbound, inbound |
| subject | Text | No | Email subject |
| content | Long text | Yes | Message content |
| template_name | Text | No | Template used |
| status | Single select | No | sent, delivered, opened, clicked, bounced, failed |
| sent_at | Date time | Yes | When sent |
| opened_at | Date time | No | Email opened |
| clicked_at | Date time | No | Link clicked |
| created_at | Created on | Yes | Auto |

### 5.5 Table: email_templates

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Auto-increment | Yes | Primary key |
| name | Text | Yes | Unique identifier |
| subject | Text | Yes | Email subject |
| body | Long text | Yes | HTML body |
| variables | Text | Yes | JSON array of variable names |
| is_active | Boolean | Yes | Default true |
| created_at | Created on | Yes | Auto |
| updated_at | Last modified | Yes | Auto |

---

## 6. API Endpoints

### 6.1 Authentication

```
POST   /auth/login          # Login with email/password
POST   /auth/logout         # Clear session
GET    /auth/me             # Get current user info
POST   /auth/refresh        # Refresh JWT token
```

### 6.2 Testers

```
GET    /api/testers                    # List all testers (with filters)
GET    /api/testers/:id                # Get single tester with stats
POST   /api/testers                    # Create new tester
PATCH  /api/testers/:id                # Update tester
DELETE /api/testers/:id                # Delete tester
POST   /api/testers/:id/stage          # Update stage (with history)
POST   /api/testers/:id/send-email     # Send email to tester
GET    /api/testers/:id/timeline       # Get tester timeline
```

### 6.3 Feedback

```
GET    /api/feedback                   # List all feedback
GET    /api/feedback/:id               # Get single feedback
POST   /api/feedback                   # Create feedback (admin)
PATCH  /api/feedback/:id               # Update feedback
DELETE /api/feedback/:id               # Delete feedback
```

### 6.4 Incidents

```
GET    /api/incidents                  # List all incidents
GET    /api/incidents/:id              # Get single incident
POST   /api/incidents                  # Create incident
PATCH  /api/incidents/:id              # Update incident
DELETE /api/incidents/:id              # Delete incident
```

### 6.5 Communications

```
GET    /api/communications             # List all communications
GET    /api/communications/:id         # Get single communication
POST   /api/communications             # Log communication
```

### 6.6 Dashboard

```
GET    /api/dashboard/stats            # Overview stats
GET    /api/dashboard/funnel           # Tester funnel data
GET    /api/dashboard/activity         # Recent activity feed
GET    /api/dashboard/alerts           # Items needing attention
```

### 6.7 Email Templates

```
GET    /api/templates                  # List all templates
GET    /api/templates/:id              # Get single template
POST   /api/templates                  # Create template
PATCH  /api/templates/:id              # Update template
DELETE /api/templates/:id              # Delete template
POST   /api/templates/:id/preview      # Preview with test data
```

### 6.8 Public (No Auth)

```
POST   /public/feedback                # Submit feedback (testers)
GET    /public/health                  # Health check
```

---

## 7. API Implementation Details

### 7.1 Authentication Flow

```typescript
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH;

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Verify credentials
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { email, role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.json({ success: true, email });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
};
```

### 7.2 Baserow Service

```typescript
// src/services/baserow.service.ts
import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';

class BaserowService {
  private client: AxiosInstance;
  private tableIds: Record<string, number>;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.baserow.io/api',
      headers: {
        Authorization: `Token ${env.BASEROW_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    this.tableIds = {
      testers: env.BASEROW_TESTERS_TABLE_ID,
      feedback: env.BASEROW_FEEDBACK_TABLE_ID,
      incidents: env.BASEROW_INCIDENTS_TABLE_ID,
      communications: env.BASEROW_COMMUNICATIONS_TABLE_ID,
      email_templates: env.BASEROW_TEMPLATES_TABLE_ID,
    };
  }

  async listRows<T>(
    table: keyof typeof this.tableIds,
    options?: {
      filters?: Record<string, any>;
      orderBy?: string;
      page?: number;
      size?: number;
    }
  ): Promise<{ results: T[]; count: number }> {
    const tableId = this.tableIds[table];
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.size) params.append('size', options.size.toString());
    if (options?.orderBy) params.append('order_by', options.orderBy);

    // Baserow filter format
    if (options?.filters) {
      Object.entries(options.filters).forEach(([field, value]) => {
        params.append(`filter__${field}__equal`, value);
      });
    }

    const response = await this.client.get(
      `/database/rows/table/${tableId}/?${params.toString()}`
    );

    return response.data;
  }

  async getRow<T>(table: keyof typeof this.tableIds, id: number): Promise<T> {
    const tableId = this.tableIds[table];
    const response = await this.client.get(
      `/database/rows/table/${tableId}/${id}/`
    );
    return response.data;
  }

  async createRow<T>(
    table: keyof typeof this.tableIds,
    data: Partial<T>
  ): Promise<T> {
    const tableId = this.tableIds[table];
    const response = await this.client.post(
      `/database/rows/table/${tableId}/`,
      data
    );
    return response.data;
  }

  async updateRow<T>(
    table: keyof typeof this.tableIds,
    id: number,
    data: Partial<T>
  ): Promise<T> {
    const tableId = this.tableIds[table];
    const response = await this.client.patch(
      `/database/rows/table/${tableId}/${id}/`,
      data
    );
    return response.data;
  }

  async deleteRow(table: keyof typeof this.tableIds, id: number): Promise<void> {
    const tableId = this.tableIds[table];
    await this.client.delete(`/database/rows/table/${tableId}/${id}/`);
  }
}

export const baserow = new BaserowService();
```

### 7.3 Email Service

```typescript
// src/services/email.service.ts
import { Resend } from 'resend';
import { env } from '../config/env';
import { baserow } from './baserow.service';
import { EmailTemplate, Tester, Communication } from '../types';

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  async sendTemplateEmail(
    tester: Tester,
    templateName: string,
    extraVariables?: Record<string, string>
  ): Promise<{ success: boolean; messageId?: string }> {
    // Get template
    const { results } = await baserow.listRows<EmailTemplate>('email_templates', {
      filters: { name: templateName, is_active: true },
    });

    if (results.length === 0) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const template = results[0];

    // Calculate days remaining
    const startDate = tester.started_at ? new Date(tester.started_at) : new Date();
    const daysPassed = Math.floor(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, 14 - daysPassed);

    // Render template
    const variables: Record<string, string> = {
      name: tester.name,
      email: tester.email,
      days_remaining: daysRemaining.toString(),
      days_passed: daysPassed.toString(),
      feedback_link: `${env.FRONTEND_URL}/feedback?tester=${tester.id}`,
      play_store_link: env.PLAY_STORE_LINK,
      ...extraVariables,
    };

    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    // Send email
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: tester.email,
      subject,
      html: body,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log communication
    await baserow.createRow<Communication>('communications', {
      tester: [tester.id], // Baserow link field format
      channel: 'email',
      direction: 'outbound',
      subject,
      content: body,
      template_name: templateName,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return { success: true, messageId: data?.id };
  }

  async sendCustomEmail(
    tester: Tester,
    subject: string,
    body: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: tester.email,
      subject,
      html: body,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log communication
    await baserow.createRow<Communication>('communications', {
      tester: [tester.id],
      channel: 'email',
      direction: 'outbound',
      subject,
      content: body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return { success: true, messageId: data?.id };
  }
}

export const emailService = new EmailService();
```

### 7.4 Cron Jobs

```typescript
// src/jobs/dailyEmailJob.ts
import cron from 'node-cron';
import { baserow } from '../services/baserow.service';
import { emailService } from '../services/email.service';
import { Tester } from '../types';
import { logger } from '../utils/logger';

export function scheduleDailyEmailJob() {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running daily email job');

    try {
      const { results: testers } = await baserow.listRows<Tester>('testers', {
        filters: { stage: 'active' },
      });

      for (const tester of testers) {
        if (!tester.started_at) continue;

        const startDate = new Date(tester.started_at);
        const daysPassed = Math.floor(
          (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send appropriate email based on day
        try {
          switch (daysPassed) {
            case 3:
              await emailService.sendTemplateEmail(tester, 'day_3_checkin');
              logger.info(`Sent day 3 email to ${tester.email}`);
              break;
            case 7:
              await emailService.sendTemplateEmail(tester, 'day_7_midpoint');
              logger.info(`Sent day 7 email to ${tester.email}`);
              break;
            case 12:
              await emailService.sendTemplateEmail(tester, 'day_12_wrapup');
              logger.info(`Sent day 12 email to ${tester.email}`);
              break;
            case 14:
              await emailService.sendTemplateEmail(tester, 'day_14_completion');
              // Update stage to completed
              await baserow.updateRow('testers', tester.id, {
                stage: 'completed',
                completed_at: new Date().toISOString(),
              });
              logger.info(`Sent completion email to ${tester.email}`);
              break;
          }
        } catch (error) {
          logger.error(`Failed to process tester ${tester.email}:`, error);
        }
      }
    } catch (error) {
      logger.error('Daily email job failed:', error);
    }
  });

  logger.info('Daily email job scheduled');
}
```

```typescript
// src/jobs/inactivityCheck.ts
import cron from 'node-cron';
import { baserow } from '../services/baserow.service';
import { Tester, Incident } from '../types';
import { logger } from '../utils/logger';

export function scheduleInactivityCheck() {
  // Run every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    logger.info('Running inactivity check');

    try {
      const { results: testers } = await baserow.listRows<Tester>('testers', {
        filters: { stage: 'active' },
      });

      const now = Date.now();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      for (const tester of testers) {
        if (!tester.last_active) continue;

        const lastActive = new Date(tester.last_active).getTime();
        const inactiveDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

        if (inactiveDays >= 3) {
          // Check if we already created a dropout incident
          const { results: existing } = await baserow.listRows<Incident>('incidents', {
            filters: {
              tester: tester.id,
              type: 'dropout',
              status: 'open',
            },
          });

          if (existing.length === 0) {
            // Create dropout incident
            await baserow.createRow<Incident>('incidents', {
              tester: [tester.id],
              type: 'dropout',
              severity: 'major',
              title: `${tester.name} inactive for ${inactiveDays} days`,
              description: `Tester has not shown activity since ${tester.last_active}`,
              status: 'open',
              source: 'automated',
            });

            logger.info(`Created dropout incident for ${tester.email}`);
          }
        }
      }
    } catch (error) {
      logger.error('Inactivity check failed:', error);
    }
  });

  logger.info('Inactivity check scheduled');
}
```

---

## 8. Frontend Implementation

### 8.1 API Client

```typescript
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 8.2 Auth Store (Zustand)

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        set({ isAuthenticated: true, email: response.data.email });
      },

      logout: async () => {
        await apiClient.post('/auth/logout');
        set({ isAuthenticated: false, email: null });
      },

      checkAuth: async () => {
        try {
          const response = await apiClient.get('/auth/me');
          set({ isAuthenticated: true, email: response.data.email, isLoading: false });
        } catch {
          set({ isAuthenticated: false, email: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ email: state.email }),
    }
  )
);
```

### 8.3 TanStack Query Hooks

```typescript
// src/hooks/useTesters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Tester, TesterWithStats } from '../types/tester';

export function useTesters(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testers', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await apiClient.get<{ results: Tester[]; count: number }>(
        `/api/testers?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useTester(id: number) {
  return useQuery({
    queryKey: ['testers', id],
    queryFn: async () => {
      const response = await apiClient.get<TesterWithStats>(`/api/testers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Tester>) => {
      const response = await apiClient.post<Tester>('/api/testers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
    },
  });
}

export function useUpdateTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Tester> }) => {
      const response = await apiClient.patch<Tester>(`/api/testers/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['testers', id] });
    },
  });
}

export function useUpdateTesterStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const response = await apiClient.post(`/api/testers/${id}/stage`, { stage });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['testers', id] });
    },
  });
}

export function useSendTesterEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      templateName,
      customSubject,
      customBody,
    }: {
      id: number;
      templateName?: string;
      customSubject?: string;
      customBody?: string;
    }) => {
      const response = await apiClient.post(`/api/testers/${id}/send-email`, {
        templateName,
        customSubject,
        customBody,
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testers', id] });
    },
  });
}
```

### 8.4 Protected Route Component

```typescript
// src/components/layout/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## 9. Deployment

### 9.1 GitHub Actions (Frontend)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ vars.API_URL }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 9.2 Dockerfile (Backend)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
```

### 9.3 Digital Ocean App Spec

```yaml
# .do/app.yaml
name: beta-manager-api
region: ams
services:
  - name: api
    source:
      repo: your-github-username/beta-manager-api
      branch: main
    run_command: node dist/index.js
    build_command: npm run build
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 8080
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        type: SECRET
      - key: ADMIN_EMAIL
        type: SECRET
      - key: ADMIN_PASSWORD_HASH
        type: SECRET
      - key: BASEROW_API_TOKEN
        type: SECRET
      - key: BASEROW_TESTERS_TABLE_ID
        type: SECRET
      - key: BASEROW_FEEDBACK_TABLE_ID
        type: SECRET
      - key: BASEROW_INCIDENTS_TABLE_ID
        type: SECRET
      - key: BASEROW_COMMUNICATIONS_TABLE_ID
        type: SECRET
      - key: BASEROW_TEMPLATES_TABLE_ID
        type: SECRET
      - key: RESEND_API_KEY
        type: SECRET
      - key: FRONTEND_URL
        value: https://your-username.github.io/beta-manager
      - key: PLAY_STORE_LINK
        value: https://play.google.com/store/apps/details?id=com.bonnenmonster
      - key: EMAIL_FROM
        value: "Bonnenmonster <beta@yourdomain.com>"
```

---

## 10. Environment Variables

### 10.1 Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=8080

# Auth
JWT_SECRET=your-secure-jwt-secret-min-32-chars
ADMIN_EMAIL=witold@example.com
ADMIN_PASSWORD_HASH=$2b$10$... # bcrypt hash

# Baserow
BASEROW_API_TOKEN=your-baserow-api-token
BASEROW_TESTERS_TABLE_ID=12345
BASEROW_FEEDBACK_TABLE_ID=12346
BASEROW_INCIDENTS_TABLE_ID=12347
BASEROW_COMMUNICATIONS_TABLE_ID=12348
BASEROW_TEMPLATES_TABLE_ID=12349

# Resend
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="Bonnenmonster <beta@yourdomain.com>"

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# App links
PLAY_STORE_LINK=https://play.google.com/store/apps/details?id=com.bonnenmonster
```

### 10.2 Frontend (.env)

```bash
VITE_API_URL=http://localhost:8080
```

---

## 11. Security Considerations

### 11.1 Authentication
- Single admin user with bcrypt-hashed password
- JWT tokens with 24-hour expiry
- Tokens stored in httpOnly cookies (not localStorage)
- CSRF protection via SameSite cookie attribute

### 11.2 API Security
- All `/api/*` routes require valid JWT
- Rate limiting on all endpoints (100 req/min)
- Stricter rate limiting on `/public/*` (10 req/min)
- Input validation with Zod schemas
- CORS restricted to frontend domain

### 11.3 Data Security
- Baserow API token stored only in backend env vars
- Frontend never has direct database access
- All PII handled server-side only
- No sensitive data in client-side storage

### 11.4 Infrastructure
- HTTPS enforced on all endpoints
- Environment variables for all secrets
- No secrets in code or version control

---

## 12. Testing Strategy

### 12.1 Backend Tests

```typescript
// tests/unit/services/email.service.test.ts
import { emailService } from '../../../src/services/email.service';

describe('EmailService', () => {
  describe('sendTemplateEmail', () => {
    it('should render template variables correctly', async () => {
      // ...
    });

    it('should log communication after sending', async () => {
      // ...
    });

    it('should throw error for invalid template', async () => {
      // ...
    });
  });
});
```

```typescript
// tests/integration/routes/testers.test.ts
import request from 'supertest';
import { app } from '../../../src/app';

describe('GET /api/testers', () => {
  it('should return 401 without auth', async () => {
    const response = await request(app).get('/api/testers');
    expect(response.status).toBe(401);
  });

  it('should return testers list with valid auth', async () => {
    const response = await request(app)
      .get('/api/testers')
      .set('Cookie', `token=${validToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
  });
});
```

### 12.2 Frontend Tests

```typescript
// src/components/testers/TesterTable.test.tsx
import { render, screen } from '@testing-library/react';
import { TesterTable } from './TesterTable';

describe('TesterTable', () => {
  it('should render loading state', () => {
    render(<TesterTable testers={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<TesterTable testers={[]} isLoading={false} />);
    expect(screen.getByText(/no testers/i)).toBeInTheDocument();
  });

  it('should render tester rows', () => {
    const testers = [{ id: 1, name: 'John', email: 'john@test.com', stage: 'active' }];
    render(<TesterTable testers={testers} isLoading={false} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

---

## 13. Monitoring & Logging

### 13.1 Logging (Winston)

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});
```

### 13.2 Health Check

```typescript
// src/routes/public.routes.ts
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

## 14. Migration & Setup Guide

### 14.1 Initial Setup Checklist

1. **Baserow Setup**
   - [ ] Create Baserow account
   - [ ] Create workspace "Beta Manager"
   - [ ] Create tables (see Section 5)
   - [ ] Generate API token
   - [ ] Note table IDs

2. **Backend Setup**
   - [ ] Clone repository
   - [ ] Copy `.env.example` to `.env`
   - [ ] Generate JWT secret: `openssl rand -base64 32`
   - [ ] Generate password hash: `npx bcrypt-cli <password> 10`
   - [ ] Fill in all env vars
   - [ ] Deploy to Digital Ocean

3. **Frontend Setup**
   - [ ] Clone repository
   - [ ] Update `VITE_API_URL` in GitHub repo variables
   - [ ] Push to trigger deployment

4. **Email Setup**
   - [ ] Create Resend account
   - [ ] Verify domain
   - [ ] Create API key
   - [ ] Add default email templates via API or Baserow

### 14.2 Default Email Templates

See [PRD-BETA-MANAGER.md Appendix A](./PRD-BETA-MANAGER.md#a-email-template-examples) for template content.

Templates to create:
- `invitation` - Initial invite
- `welcome` - After acceptance
- `day_3_checkin` - Day 3 check-in
- `day_7_midpoint` - Day 7 survey
- `day_12_wrapup` - Day 12 warning
- `day_14_completion` - Completion + transition
- `reengagement` - For inactive testers
