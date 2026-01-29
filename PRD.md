# PRD + Build Spec (Cursor Agent): VibeCards — Authenticated AI Flashcards App (Next.js + Clerk + Supabase + OpenAI + Vercel)

You are operating as a Cursor Agent inside a local codebase. You can read/write files and run terminal commands.

## Operating Rules
- Small steps, run often, no secrets in code, no surprise dependencies, explain + test each milestone.

## Product
Build VibeCards: signed-in users generate flashcards from a topic/notes using OpenAI Responses API Structured Outputs, save decks in Supabase, view later. Minimal UI.

## Stack
Next.js App Router + TS, Clerk auth, Supabase Postgres, OpenAI Responses API + Structured Outputs (Zod), deploy on Vercel.

## Documentation References
- **OpenAI Responses API**: https://platform.openai.com/docs/api-reference/responses
- **Clerk Next.js Quickstart**: https://clerk.com/docs/nextjs/getting-started/quickstart
- **Supabase Next.js Quickstart**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## Data Model
Supabase table `decks` with id uuid, owner_id text (Clerk userId), title, topic, cards jsonb, created_at.

## Routes
Public: `/` `/sign-in/*` `/sign-up/*`
Protected: `/dashboard` `/deck/[id]`
API (protected): `POST /api/generate-deck` (topic in, deckId out)

## Structured Output
Use Zod deck schema: title, topic, cards[8..12] of {front, back}. Model: gpt-5.2. Use responses.parse + zodTextFormat. Enforce max_output_tokens.

## Guardrails
Topic length caps, max cards, max_output_tokens. Basic workshop-only rate limit placeholder.

## Deliverables
README.md, .env.example, supabase/schema.sql, supabase/level2-rls.sql (optional), AGENTS.md.

## Implementation Notes
- Dashboard query MUST filter by `owner_id` to only show current user's decks
- Add `export const dynamic = 'force-dynamic'` to pages using Clerk auth (prevents static generation errors)
- Wrap ClerkProvider in a `'use client'` component (providers.tsx) for Next.js 16 compatibility
- Instantiate OpenAI client inside route handler, not at module level (avoids build errors without env vars)
- Next.js 16 prefers `proxy.ts` over `middleware.ts` but both work

## Acceptance Criteria
- /dashboard protected
- Generate deck works, saves to DB
- Can't view others' decks (dashboard filters by owner_id)
- Build passes and README includes Vercel deploy steps

Proceed now. Make small diffs and give test steps after each milestone.