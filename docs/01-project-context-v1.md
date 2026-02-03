# Project v1 Context (ClientFlow)

**Date:** Jan 31, 2026
**Version:** v1.0 (MVP)

## Project Overview
**Name:** ClientFlow
**Purpose:** A SaaS-style application for agencies to manage Google Business Reviews for their clients. It allows tracking review statuses (Pending, Live, Missing, etc.), managing client profiles, and handling associated tasks.

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with `tailwindcss-animate`), internal "Soft Gold" design system.
- **UI Components:** Radix UI primitives, Lucide React icons, Sonner (toast).
- **Database:** PostgreSQL via Prisma ORM v6.
- **State Management:** Redux Toolkit (specific use cases).
- **Auth:** NextAuth.js v5 (Beta).

## Design System Rules ("Soft Gold Theme")
1.  **Backgrounds:** Pure Black (`#000000`) for main sections.
2.  **Accents:** Soft Gold is the primary accent color.
3.  **Typography:** Inter.
4.  **Components:** Reference "Review Card" design—dark card, subtle borders, status badges.

## Data Model (Key Entities)
- **User:** Admin/Agency owner.
- **Client:** The business owner (has many GmbProfiles).
- **GmbProfile:** A specific location/business profile.
- **Review:** The core unit (Status: PENDING, LIVE, MISSING, etc.).
- **Task:** Secondary generic task manager.

## Key Features (v1)
1.  **Review Management:** Full CRUD, Status workflow, Email tracking.
2.  **Profiles:** Client/GMB details with Review lists.
3.  **Theme:** Dark mode default, Soft Gold aesthetic.
