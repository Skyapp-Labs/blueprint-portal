# Admin Portal – API Blueprint System

## Overview

This is a production-grade Admin Portal built to manage and monitor the API Blueprint system.

The portal is designed for:

* Internal use (admin, support, operators)
* High performance and low latency
* Scalability and modular architecture
* Clean separation from backend services

The system follows a feature-based architecture inspired by Flutter modular design.

---

## Tech Stack

* Framework: Next.js (App Router)
* UI: shadcn/ui + Tailwind CSS
* Data Fetching: TanStack Query
* State Management: Zustand (minimal usage)
* Language: TypeScript

---

## Architecture Principles

1. Feature-based structure (NOT file-type based)
2. Separation of concerns (API / UI / Logic)
3. Minimal global state
4. API-first design (no direct DB access)
5. Scalable and maintainable modules

---

## Project Structure

src/
app/                → Routing layer (Next.js pages)
core/               → Shared business logic
features/           → Feature modules
shared/             → Reusable UI components
lib/                → Low-level utilities
hooks/              → Global hooks
types/              → Global TypeScript types
config/             → App configuration

---

## Core Layer

core/
api/
apiClient.ts      → HTTP client (fetch wrapper)
endpoints.ts      → Centralized API routes

auth/
authService.ts    → Login / logout / session handling
rbac.ts           → Role-based access control

utils/
errors/

---

## Feature Structure

Each feature follows this structure:

features/{feature-name}/
api/                → API calls (no UI logic)
hooks/              → Business logic (data + state)
components/         → UI components
types/              → Feature-specific types

Example:

features/users/
api/getUsers.ts
hooks/useUsers.ts
components/UserTable.tsx
types/user.type.ts

---

## Routing (App Layer)

app/
admin/
users/page.tsx
logs/page.tsx
replay/page.tsx
notifications/page.tsx

login/page.tsx
layout.tsx

Rules:

* No business logic here
* Only composition and layout

---

## Data Fetching (TanStack Query)

All server state must be handled using TanStack Query.

Rules:

* No direct fetch calls inside components
* Always use hooks

Example:

useUsers.ts:

* fetch users
* cache results
* handle loading and error states

---

## State Management (Zustand)

Used ONLY for:

* Auth session
* UI state (sidebar, theme)

DO NOT use for:

* API data (use TanStack Query instead)

---

## UI System

All UI components should:

* Use shadcn/ui primitives
* Be reusable and composable
* Be placed in either:

  * feature components (feature-specific)
  * shared/components (global)

---

## Authentication & Authorization

* Authentication handled via API (JWT or external provider)
* Store session in Zustand or secure cookies
* Protect routes using Next.js middleware

RBAC:

* Define roles (admin, support, readonly)
* Restrict access at:

  * route level
  * component level

---

## Key Features

### 1. User Management

* View users
* Edit user data
* Manage sessions

### 2. Logs & Monitoring

* API request logs
* Error tracking
* Performance metrics

### 3. Replay System

* View user sessions
* Replay workflows
* Debug interactions

### 4. Notifications

* Manage SMS providers
* Manage email providers
* Trigger test notifications

### 5. Feature Flags

* Enable/disable features
* Control API behavior

---

## API Integration

* All communication goes through API
* No direct database access
* Use centralized apiClient

---

## Middleware

Use Next.js middleware for:

* Route protection
* Authentication checks
* Role validation

---

## Best Practices

* Keep components small and focused
* Avoid global state unless necessary
* Use hooks for logic reuse
* Keep API layer isolated
* Follow consistent naming

---

## Future Improvements

* Shared types between Admin + API + Flutter
* Audit logs for admin actions
* Real-time updates (WebSockets)
* Advanced analytics dashboard

---

## Goal

Build a clean, scalable, and production-ready admin system that:

* Integrates seamlessly with the API
* Supports internal operations efficiently
* Scales with future features
