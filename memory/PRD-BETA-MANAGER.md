# PRD: Beta Testing Management Dashboard

## 1. Product Overview

**Product Name**: Bonnenmonster Beta Manager
**Platform**: Web Dashboard (responsive)
**Target App**: Bonnenmonster (Flutter receipt digitization app)
**Distribution Channel**: Google Play Console (Closed Testing)

### 1.1 Vision
A streamlined command center for managing the complete beta testing lifecycle—from tester recruitment to production transition—with maximum automation and real-time visibility.

### 1.2 Mission
Reduce manual overhead in beta testing by 80% while ensuring no tester falls through the cracks during their 14-day testing journey.

---

## 2. Problem Statement

Managing beta testers manually involves:
- **Scattered communication** across email, WhatsApp, LinkedIn, etc.
- **No centralized view** of who accepted, who installed, who's actively testing
- **Manual follow-ups** to remind inactive testers
- **Lost feedback** across different channels
- **No incident tracking** for crashes, bugs, or dropouts
- **Manual transition** of testers to production after the test period

This leads to wasted time, missed feedback, and poor tester experience.

---

## 3. Objectives

| Objective | Success Metric |
|-----------|----------------|
| Centralize tester management | Single dashboard for all 5-20 testers |
| Automate outreach & follow-ups | < 5 min/day spent on manual communication |
| Track 14-day journey | 100% visibility into each tester's stage |
| Capture all feedback | Zero feedback lost across channels |
| Monitor incidents | All crashes, bugs, dropouts logged and tracked |
| Smooth production transition | Automated transition workflow for completed testers |

---

## 4. User Personas

### 4.1 Beta Manager (You)
- **Role**: App developer managing beta program
- **Goals**: Minimize time spent on beta logistics, maximize quality feedback
- **Pain Points**: Juggling multiple channels, losing track of testers, manual follow-ups

### 4.2 Beta Tester
- **Role**: Early adopter testing Bonnenmonster
- **Goals**: Easy onboarding, clear expectations, simple feedback submission
- **Pain Points**: Unclear instructions, no acknowledgment of feedback, forgotten after testing

---

## 5. Functional Requirements

### 5.1 Tester Management

#### 5.1.1 Tester Database
- Add testers manually (name, email, phone, source channel)
- Import from CSV/spreadsheet
- Sync with Google Play Console tester list (via API)
- Store tester metadata: recruitment source, communication preference

#### 5.1.2 Tester Lifecycle Stages
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  PROSPECT   │───▶│  INVITED    │───▶│  ACCEPTED   │───▶│  INSTALLED  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  COMPLETED  │◀───│  ACTIVE     │◀───│  ONBOARDED  │◀─────────┘
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐
│ TRANSITIONED│  (to production)
└─────────────┘

Alternative paths:
- INVITED → DECLINED
- Any stage → DROPPED_OUT
- Any stage → UNRESPONSIVE (after X days no activity)
```

#### 5.1.3 Tester Profile View
- Contact information
- Current stage + stage history with timestamps
- Communication log (all messages sent/received)
- Feedback submitted
- Incidents reported
- App activity (sessions, last active date)
- Days remaining in 14-day period

### 5.2 Outreach & Communication

#### 5.2.1 Email Integration (SendGrid/Resend)
- **Invitation email**: Personalized invite with Play Console opt-in link
- **Welcome email**: After acceptance, with installation instructions
- **Day 3 check-in**: "How's it going?" + feedback prompt
- **Day 7 mid-point**: Survey link + reminder of remaining time
- **Day 12 wrap-up warning**: "2 days left" + final feedback request
- **Day 14 completion**: Thank you + production transition instructions
- **Re-engagement**: For inactive testers (no activity in 3+ days)

#### 5.2.2 Email Templates
- Pre-built templates for each stage
- Variable substitution: `{{name}}`, `{{days_remaining}}`, `{{feedback_link}}`
- Preview before sending
- Track open rates and click rates

#### 5.2.3 Manual Outreach Logging
- Log messages sent via WhatsApp, LinkedIn, etc.
- Attach screenshots of conversations
- Mark channel used for each communication

### 5.3 Feedback Collection

#### 5.3.1 Feedback Portal
- Dedicated web form for testers (linked from emails)
- Categories: Bug, Feature Request, UX Issue, General Feedback
- Severity selection (for bugs): Critical, Major, Minor
- Screenshot/video upload capability
- Device info auto-capture (OS version, app version)

#### 5.3.2 In-App Feedback (Future)
- Shake-to-report integration in Bonnenmonster
- Automatic screenshot capture
- Session replay attachment

#### 5.3.3 Feedback Management
- Kanban board view: New → In Review → Addressed → Closed
- Link feedback to specific testers
- Bulk actions (close duplicates, merge similar)
- Export feedback for development team

### 5.4 Incident Tracking

#### 5.4.1 Incident Types
| Type | Source | Auto-Detection |
|------|--------|----------------|
| Crash | Firebase Crashlytics | Yes |
| Bug Report | Feedback portal | Manual |
| UX Complaint | Feedback portal | Manual |
| Dropout | Activity monitoring | Yes (3+ days inactive) |
| Uninstall | Play Console (if available) | Partial |

#### 5.4.2 Incident Dashboard
- Real-time incident feed
- Filter by type, severity, tester, date
- Incident detail view with full context
- Resolution tracking (Open → Investigating → Resolved)
- Link incidents to app releases/versions

#### 5.4.3 Crashlytics Integration
- Pull crash reports automatically
- Match crashes to specific testers (by user ID)
- Alert on new crash types
- Track crash-free rate across beta cohort

### 5.5 Dashboard & Analytics

#### 5.5.1 Overview Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│                    BETA TESTING DASHBOARD                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    12    │  │     8    │  │     3    │  │    85%   │        │
│  │  Total   │  │  Active  │  │ Incidents│  │ Retention│        │
│  │ Testers  │  │ Testers  │  │  Open    │  │   Rate   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  TESTER FUNNEL                    ACTIVITY HEATMAP              │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │ Invited      15 ████│         │ Mon ██████████      │       │
│  │ Accepted     12 ███ │         │ Tue ████████        │       │
│  │ Installed   10 ██   │         │ Wed ██████████████  │       │
│  │ Active       8 █    │         │ Thu ██████          │       │
│  │ Completed    4      │         │ Fri ████            │       │
│  └─────────────────────┘         └─────────────────────┘       │
│                                                                  │
│  RECENT ACTIVITY                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 10:32  Jan submitted feedback: "Love the receipt scan!" │   │
│  │ 10:15  Crash detected: NullPointerException (2 users)   │   │
│  │ 09:45  Maria completed 14-day period                     │   │
│  │ 09:30  Day 7 survey sent to 5 testers                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.5.2 Tester List View
- Table with sortable columns: Name, Stage, Days Active, Last Activity, Feedback Count, Incidents
- Quick filters: By stage, by activity level, by incident status
- Bulk actions: Send email, change stage, export

#### 5.5.3 Timeline View
- Visual timeline of each tester's 14-day journey
- Key events marked: Invited, Installed, Feedback, Incidents, Completed
- Upcoming automated actions highlighted

### 5.6 Automation Engine

#### 5.6.1 Automated Triggers
| Trigger | Action |
|---------|--------|
| New tester added | Send invitation email |
| Tester accepts (Play Console) | Send welcome email, update stage |
| Day 3 reached | Send check-in email |
| Day 7 reached | Send mid-point survey |
| No activity 3+ days | Send re-engagement email, flag as at-risk |
| Day 12 reached | Send wrap-up warning |
| Day 14 reached | Send completion email, mark as completed |
| New crash detected | Create incident, notify admin |
| Feedback submitted | Create feedback item, send acknowledgment |

#### 5.6.2 Automation Rules Builder (Future)
- Custom if-then rules
- Webhook triggers for external integrations
- Conditional logic based on tester attributes

### 5.7 Production Transition

#### 5.7.1 Transition Workflow
1. Tester completes 14-day period
2. Final survey sent automatically
3. Thank-you email with:
   - Production app link (Play Store public listing)
   - Option to leave a review
   - Discount code (if applicable)
4. Tester marked as "Transitioned"
5. Optional: Remove from Play Console beta group

#### 5.7.2 Testimonial Collection
- Request permission to use feedback as testimonial
- Collect star rating
- Store approved testimonials for marketing use

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Dashboard loads in < 2 seconds
- Real-time updates via WebSockets (incidents, activity)
- Support 20 concurrent testers without degradation

### 6.2 Security
- **Password-protected dashboard** - Login required to view any data
- Single admin user with email/password authentication
- JWT tokens for session management (stored in httpOnly cookies)
- All API endpoints require valid JWT (except login)
- Baserow API token stored securely in DO environment variables
- GDPR compliant: data export and deletion capabilities

**Auth Flow:**
```
User visits dashboard → Redirected to /login
        ↓
Enter email + password → Backend validates against stored hash
        ↓
Backend issues JWT (24h expiry) → Stored in httpOnly cookie
        ↓
All API calls include JWT → Backend validates before returning data
```

### 6.3 Reliability
- 99% uptime (hosted solution)
- Automated email retry on failure
- Graceful degradation if integrations unavailable

### 6.4 Usability
- Mobile-responsive design (check dashboard on phone)
- Clear visual hierarchy
- Minimal clicks to common actions
- Keyboard shortcuts for power users

---

## 7. Technical Architecture

### 7.1 Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Vite + React + TypeScript | Fast builds, modern tooling, type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, consistent design |
| Backend | Node.js + Express (or Hono) | Cron jobs, email sending, auth proxy |
| Database | Baserow (Free tier) | No-code database with REST API, free hosted |
| Cron Jobs | node-cron on DO App Platform | Scheduled tasks for automated emails |
| Email | Resend | Modern API, great deliverability, generous free tier |
| Frontend Hosting | GitHub Pages | Free, simple deployment via GitHub Actions |
| Backend Hosting | Digital Ocean App Platform | Easy deployment, managed infrastructure |

### 7.2 Hosting Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Pages                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Vite React SPA (Static files only - no secrets)        │    │
│  │  - Login page                                            │    │
│  │  - Dashboard UI (requires auth)                          │    │
│  │  - Public feedback form                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ALL API calls go through backend
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Digital Ocean App Platform                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Node.js API Server                                      │    │
│  │  - POST /auth/login    → Validate credentials, issue JWT │    │
│  │  - GET  /api/*         → Requires valid JWT              │    │
│  │  - POST /api/*         → Requires valid JWT              │    │
│  │  - POST /public/feedback → No auth (public form)         │    │
│  │  - Cron jobs           → Automated emails                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ Baserow API token (secret)        │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Baserow (Free) - API token stored in DO env vars only   │    │
│  │  Tables: testers, feedback, incidents, communications    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Key security points:**
- Frontend has NO access to Baserow API token
- All data requests go through authenticated backend
- Public feedback form uses dedicated endpoint (rate-limited)
- JWT stored in httpOnly cookie (not localStorage)

### 7.3 Cost Estimate

| Resource | Spec | Monthly Cost |
|----------|------|--------------|
| DO App Platform (Basic) | 1 container, 512MB RAM | $5 |
| Baserow | Free tier (3,000 rows, 2GB storage) | $0 |
| GitHub Pages | Free for public repos | $0 |
| Resend | Free tier (3,000 emails/month) | $0 |
| **Total** | | **~$5/month** |

*Note: Baserow free tier is sufficient for 5-20 testers*

### 7.4 Data Model (Baserow Tables)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   testers   │       │  feedback   │       │  incidents  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │──┐    │ id          │       │ id          │
│ name        │  │    │ tester_id   │───┐   │ tester_id   │───┐
│ email       │  │    │ type        │   │   │ type        │   │
│ phone       │  │    │ severity    │   │   │ severity    │   │
│ source      │  │    │ content     │   │   │ title       │   │
│ stage       │  │    │ status      │   │   │ description │   │
│ invited_at  │  │    │ created_at  │   │   │ status      │   │
│ started_at  │  │    └─────────────┘   │   │ source      │   │
│ last_active │  │                      │   │ created_at  │   │
│ metadata    │  │    ┌─────────────┐   │   └─────────────┘   │
└─────────────┘  │    │   comms     │   │                     │
                 │    ├─────────────┤   │                     │
                 │    │ id          │   │                     │
                 └───▶│ tester_id   │◀──┴─────────────────────┘
                      │ channel     │
                      │ direction   │
                      │ content     │
                      │ sent_at     │
                      │ opened_at   │
                      └─────────────┘

Baserow advantages:
- Link fields for relationships (tester_id)
- Built-in views (Grid, Kanban, Gallery)
- REST API with filtering and sorting
- Real-time collaboration (if needed later)
```

---

## 8. Integrations

### 8.1 Google Play Console API
- **Sync testers**: Pull list of opted-in beta testers
- **Match emails**: Link Play Console users to dashboard records
- **Limitations**: Limited real-time data, may need manual refresh

### 8.2 Firebase Crashlytics API
- **Pull crashes**: Fetch crash reports via REST API
- **Match users**: Link crashes to testers via Firebase User ID
- **Alerts**: Webhook for new crash types

### 8.3 Resend Email API
- **Send emails**: Transactional emails for all automated triggers
- **Track delivery**: Open rates, click rates, bounces
- **Templates**: Store and manage email templates

### 8.4 Future Integrations
- **Slack**: Notifications for new incidents, feedback
- **Google Sheets**: Export tester data for reporting
- **Calendly**: Schedule calls with testers

---

## 9. User Flows

### 9.1 Add New Tester
```
Admin clicks "Add Tester"
    │
    ▼
Fill form: Name, Email, Phone (optional), Source
    │
    ▼
System creates tester record (stage: PROSPECT)
    │
    ▼
Admin clicks "Send Invitation"
    │
    ▼
System sends invitation email via Resend
    │
    ▼
Stage updated to INVITED, comm logged
```

### 9.2 Daily Admin Workflow
```
Admin opens dashboard
    │
    ▼
Reviews "Needs Attention" section:
  - Inactive testers (3+ days)
  - New incidents
  - New feedback
    │
    ▼
Takes action on flagged items:
  - Send personal follow-up
  - Respond to feedback
  - Investigate incidents
    │
    ▼
Reviews automated actions queue:
  - Emails scheduled for today
  - Testers completing 14-day period
    │
    ▼
(Optional) Exports weekly report
```

### 9.3 Tester Journey (Automated)
```
Day 0:  Invited → Invitation email sent
Day 0:  Accepts → Welcome email + stage update
Day 1:  Installs app → Stage update (via manual check or analytics)
Day 3:  Check-in email sent automatically
Day 7:  Mid-point survey sent
Day 10: (If inactive 3+ days) Re-engagement email
Day 12: Wrap-up warning sent
Day 14: Completion email + transition workflow triggered
```

---

## 10. MVP Scope (Phase 1)

### 10.1 Must Have (MVP)
- [ ] Tester database with manual CRUD
- [ ] Lifecycle stage tracking
- [ ] Email sending via Resend (invitation, welcome, completion)
- [ ] Basic dashboard with tester list and stage counts
- [ ] Manual feedback logging
- [ ] Manual incident logging
- [ ] Communication log per tester

### 10.2 Should Have (Phase 2)
- [ ] Automated email triggers (Day 3, 7, 12, 14)
- [ ] Feedback portal for testers
- [ ] Firebase Crashlytics integration
- [ ] Activity heatmap
- [ ] Tester timeline view

### 10.3 Nice to Have (Phase 3)
- [ ] Google Play Console API sync
- [ ] Custom automation rules
- [ ] Testimonial collection
- [ ] Slack notifications
- [ ] Advanced analytics

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time spent on beta management | < 15 min/day | Self-reported |
| Tester retention (complete 14 days) | > 80% | Dashboard data |
| Feedback response rate | > 60% | Feedback count / tester count |
| Time to acknowledge feedback | < 24 hours | Dashboard data |
| Testers transitioned to production | > 90% of completions | Dashboard data |

---

## 12. Implementation Plan

### Phase 1: Foundation
**Database Setup (Baserow)**
1. Create Baserow account and workspace
2. Create tables: testers, feedback, incidents, communications
3. Set up link fields for relationships
4. Generate API token for backend access

**Backend Setup (Digital Ocean)**
1. Create DO App Platform project
2. Create Node.js + Express API project
3. Implement Baserow API client wrapper
4. Deploy initial API with health check

**Frontend Setup (GitHub Pages)**
1. Create Vite + React + TypeScript project
2. Set up Tailwind CSS + shadcn/ui
3. Configure GitHub Actions for auto-deploy
4. Implement basic routing (React Router)

### Phase 2: Core Features
1. Tester CRUD API endpoints + UI
2. Lifecycle stage management
3. Resend integration for email sending
4. Email templates (invitation, welcome, completion)
5. Communication logging per tester
6. Basic dashboard with tester list and stage counts

### Phase 3: Automation
1. Cron job for scheduled emails (Day 3, 7, 12, 14)
2. Activity monitoring and dropout detection
3. Manual feedback and incident logging
4. Tester detail view with timeline

### Phase 4: Polish & Integrations
1. Firebase Crashlytics integration (optional)
2. Feedback portal for testers (public form)
3. Dashboard analytics (charts, heatmaps)
4. Testing and bug fixes

---

## 13. Design Decisions

| Question | Decision |
|----------|----------|
| Activity tracking | Use existing Firebase Analytics (no changes to Bonnenmonster) |
| Multi-cohort support | Single beta round - no cohort grouping needed |
| Team access | Single admin only |
| Tech stack | Vite + React on GitHub Pages, Node.js API on Digital Ocean |

### Remaining Open Question

1. **Tester identification**: How to reliably match Play Console testers to dashboard records?
   - **Option A**: Manual email matching (simple, reliable)
   - **Option B**: Ask testers to register in feedback portal with same email
   - **Recommendation**: Start with manual matching, add portal registration later

---

## 14. Appendix

### A. Email Template Examples

#### Invitation Email
```
Subject: You're invited to test Bonnenmonster!

Hi {{name}},

I'm building Bonnenmonster, an app that helps freelancers digitize receipts
using AI. I'd love your help testing it before launch!

What's involved:
- 14-day testing period
- Try the core features (scan receipts, review data, export)
- Share your honest feedback

Ready to join?
👉 [Accept Beta Invitation]({{play_console_link}})

Thanks for considering!
Witold
```

#### Day 7 Check-in
```
Subject: How's your first week with Bonnenmonster?

Hi {{name}},

You're halfway through your beta testing period!

Quick questions:
1. Have you scanned any receipts yet?
2. Anything confusing or broken?
3. What would make the app more useful for you?

Reply to this email or use our feedback form:
👉 [Submit Feedback]({{feedback_link}})

{{days_remaining}} days left in your testing period.

Thanks for being a beta tester!
Witold
```

### B. Stage Definitions

| Stage | Definition | Trigger |
|-------|------------|---------|
| PROSPECT | Identified as potential tester | Manual add |
| INVITED | Invitation sent, awaiting response | Email sent |
| ACCEPTED | Opted in via Play Console | Play Console sync / manual |
| INSTALLED | App installed on device | Analytics / manual |
| ONBOARDED | Completed first receipt scan | Analytics / manual |
| ACTIVE | Regular usage during test period | Activity detected |
| COMPLETED | Finished 14-day period | Day 14 reached |
| TRANSITIONED | Moved to production | Transition workflow |
| DECLINED | Rejected invitation | Manual update |
| DROPPED_OUT | Stopped testing before completion | Manual / inactivity |
| UNRESPONSIVE | No response to outreach | Automation rule |
