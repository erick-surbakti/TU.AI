## TUAI

AI-native platform for workflow automation, knowledge operations, and intelligent execution.
TUAI is designed with a modular, scalable, production-ready architecture.

---

# Overview

TUAI combines:

* Multi-tenant SaaS architecture
* AI agent orchestration
* Supabase backend
* Queue-based task execution
* Real-time events
* Billing and subscriptions
* Audit trails
* Plugin integrations
* Secure admin operations

---

# Core Vision

TUAI helps users execute repetitive and complex work through AI:

* Generate content
* Analyze data
* Execute workflows
* Summarize documents
* Automate business processes
* Manage internal knowledge

---

# High Level Architecture

```text id="u7d4n2"
                         ┌──────────────────┐
                         │   Web Client     │
                         │   Next.js App    │
                         └────────┬─────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ API Gateway / BFF        │
                    │ Next.js Route Handlers   │
                    └────────┬─────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
      ▼                      ▼                      ▼
┌──────────────┐     ┌───────────────┐      ┌──────────────┐
│ Auth Layer   │     │ Core Services │      │ AI Runtime   │
│ Supabase     │     │ Domain Logic  │      │ LLM Agents   │
└──────┬───────┘     └──────┬────────┘      └──────┬───────┘
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────┐    ┌───────────────┐      ┌──────────────┐
│ PostgreSQL   │    │ Redis Queue   │      │ Vector Store │
│ Row Security │    │ Background Jobs│     │ Retrieval    │
└──────────────┘    └───────────────┘      └──────────────┘
```

---

# System Components

## Frontend

Built with Next.js.

Features:

* Server-side rendering
* App Router
* Dashboard UI
* Realtime updates
* Role-based pages
* Settings panel
* Billing pages

## Backend

API layer handles:

* Authentication
* Tenant resolution
* Workflow execution
* Rate limiting
* File operations
* AI requests
* Webhooks

## Database

Supabase PostgreSQL stores:

* Users
* Organizations
* Memberships
* Workspaces
* Tasks
* Jobs
* Credits
* Billing data
* Audit logs
* Prompts
* Documents

## Queue Workers

Async workers process:

* Long AI jobs
* Scheduled tasks
* Email sending
* Embeddings
* Cleanup jobs
* Retry logic

## AI Layer

Supports multiple providers:

* OpenAI
* Anthropic
* Gemini
* Local models

Capabilities:

* Prompt routing
* Cost tracking
* Streaming
* Tool calling
* Memory context
* Multi-step chains

---

# Multi-Tenant Design

Each organization has isolated resources:

* users
* workspaces
* billing
* documents
* usage records

Enforced through:

* Row Level Security
* org_id boundaries
* signed sessions
* audit checks

---

# Security Model

## Secrets

Environment variables:

```env id="s1m5q8"
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
REDIS_URL=
ENCRYPTION_KEY=
```

## Access Control

* RBAC roles
* Owner
* Admin
* Member
* Viewer

## Internal Admin Actions

`SUPABASE_SERVICE_ROLE_KEY` is only used for:

* Delete account flows
* Admin recovery
* Background sync
* User cleanup
* Billing reconciliation

Never exposed to frontend.

---

# Suggested Folder Structure

```text id="g6p2w4"
apps/
  web/
packages/
  ui/
  db/
  auth/
  ai/
  queue/
  billing/
  shared/
workers/
infra/
docs/
```

---

# Example Data Model

```text id="m9r1k7"
organizations
users
memberships
projects
documents
tasks
runs
events
subscriptions
usage_logs
audit_logs
api_keys
```

---

# Account Deletion Flow

```text id="t4c8v1"
User requests deletion
→ Verify session
→ Confirm ownership
→ Queue deletion job
→ Remove user data
→ Delete auth identity
→ Write audit log
→ Return success
```

Uses service role only on secure backend workers.

---

# Scalability Strategy

## Horizontal Scaling

* Stateless web servers
* Dedicated workers
* Read replicas
* CDN assets
* Queue partitioning

## Performance

* Redis caching
* Edge middleware
* Streaming responses
* Batched writes
* DB indexes

---

# Observability

* Structured logs
* Error tracking
* Metrics dashboards
* Job tracing
* AI cost analytics
* Slow query alerts

---

# CI/CD

Pipeline:

```text id="p3x7n6"
Git push
→ Tests
→ Lint
→ Build
→ Migration checks
→ Deploy
→ Health checks
```

---

# Product Modes

TUAI can operate as:

* SaaS platform
* Internal enterprise tool
* White-label deployment
* API-first product

---

# Future Expansion

* Marketplace plugins
* Voice agents
* Team memory graph
* Autonomous workflows
* Browser automation
* Custom model fine-tuning

---

# Tech Stack

* Next.js
* TypeScript
* Supabase
* PostgreSQL

---

# Philosophy

TUAI is built for execution, not demos.

Reliable systems.
Fast iteration.
AI tied to real business outcomes.
