# Autonomous Design Agency - Client Portal

An AI-powered web development agency that delivers full-service web development with 99% automation.

## Business Model

**Premium, High-Value, Low-Volume**
- 2-4 projects per quarter
- €8,000 - €50,000 per project
- 99% autonomous, 1% human oversight for escalations

## System Architecture

```
Layer 1: Client Portal (This Project)
  - Secure client onboarding
  - Project intake forms
  - Quote generation
  - Project tracking dashboard
  - Communication hub
  - Invoicing & payments

Layer 2: Requirements & Design
  - Parse client requirements
  - Generate design concepts
  - Create technical specifications
  - Provide cost estimates

Layer 3: Development
  - Generate all code
  - Implement all features
  - Apply design system
  - Handle responsive layouts

Layer 4: Quality Assurance
  - Automated testing
  - Security scanning
  - Performance optimization
  - Accessibility compliance

Layer 5: Deployment & Operations
  - GitHub repository creation
  - Vercel deployment
  - Domain configuration
  - SSL certificates
  - Monitoring & alerts
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Payments:** Stripe Connect
- **AI:** Cursor CLI, OpenHands
- **Testing:** Jest, Testing Foundation

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Business Priorities

### Non-Negotiables
✅ GDPR Compliance
✅ Data Privacy & Security
✅ No AI training on client data
✅ Professional Indemnity Insurance
✅ Legal contracts (ToS, IP, liability)
✅ QA before every deployment
✅ Rollback capability

### Quality Gates
✅ Tests passing
✅ Security scan clean
✅ Code review (AI + human spot-check)
✅ Client approval sign-off

### Risk Management
✅ Auto-escalation for delays > 1 week
✅ 50% refund if unsatisfactory
✅ Instant rollback capability
✅ Encrypted communications

## File Structure

```
autononomous-design-agency/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── projects/page.tsx
│   │   ├── quotes/page.tsx
│   │   ├── invoices/page.tsx
│   │   └── communications/page.tsx
│   ├── client/
│   │   ├── onboarding/page.tsx
│   │   ├── intake/page.tsx
│   │   ├── requirements/page.tsx
│   │   ├── design-approval/page.tsx
│   │   └── final-review/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── navigation/
│   ├── auth/
│   ├── projects/
│   ├── quotes/
│   ├── invoices/
│   └── communications/
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   └── orchestrator.ts
└── docs/
    ├── WORKFLOWS.md
    ├── SECURITY.md
    ├── ESCALATION.md
    └── TESTING.md
```

## Current Status

**Phase: Build Stage (Started 2026-02-10)**

### Completed
- ✅ Workspace created
- ✅ Next.js 16 initialized
- ✅ TypeScript configured
- ✅ Tailwind CSS configured

### Next Steps
1. Install Supabase client
2. Install Stripe SDK
3. Set up authentication system
4. Create client intake forms
5. Build project dashboard
6. Implement quote generation
7. Add Stripe payments
8. Create orchestrator system

## Contact

**Founder:** John Roche (@johnrochie)
**Location:** Ireland
**Business Type:** Ltd. (John handles business setup)

---
