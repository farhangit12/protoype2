# Disha Boardroom (initial prototype)

An interactive prototype of Disha Startup Advisory's AI boardroom, built from the handwritten
reference photos and the prototype spec.

**Flow:** Clerk sign-in → Dashboard → create or pick a business → Sessions (previous or new) →
stage-specific Boardroom → specialists analyse via Groq → one consolidated Strategist answer.
Also: Personalised Call contact page and an example pricing page.

## Contents
1. [Stack](#stack)
2. [Run locally](#run-locally)
3. [Deploy on Vercel](#deploy-on-vercel)
4. [How the boardroom works](#how-the-boardroom-works-srcappapiboardroomroutets)
5. [Boards by stage](#boards-by-stage)
6. [Prototype limits (by design)](#prototype-limits-by-design)
7. [Project layout](#project-layout)

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- Clerk for sign-in and sign-up
- Groq API for real AI responses, called only from the server route `/api/boardroom`
- Browser storage (localStorage, per Clerk user) for businesses and sessions

## Run locally
```bash
npm install
cp .env.example .env.local     # add your Clerk and Groq keys
npm run dev                    # http://localhost:3000
```
Without Clerk keys the app runs in **demo mode** (one demo founder, no sign-in), which is handy
for a first look. Without `GROQ_API_KEY` everything works except answers: the boardroom shows a
clear error.

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. Vercel → **Add New → Project** → import the repo (framework is detected as Next.js).
3. **Environment Variables:** add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
   `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` and
   `GROQ_API_KEY` (plus the optional model names).
4. Deploy. In the Clerk dashboard, add your Vercel domain to the application's allowed domains
   (for a production instance).

Notes: the Groq route streams its progress and sets `maxDuration = 60` seconds. Vercel's free
Hobby plan is for non-commercial use, so check Vercel's terms before using it for a paid product.

## How the boardroom works (`src/app/api/boardroom/route.ts`)
1. The founder's query and the business (with its saved stage) go to the server.
2. The **Strategist** (`openai/gpt-oss-120b` on Groq) reads it and picks the specialists it needs, with one task each.
3. Chosen **specialists** (`openai/gpt-oss-20b`) work in parallel. Status tags update live:
   Waiting → Working → Completed, or Skipped.
4. The Strategist reviews their internal findings and writes **one** answer, with a verdict:
   Viable, Viable with conditions, or Not workable as proposed. Specialists never answer the founder.

Progress is streamed to the browser as one JSON event per line.

### Boards by stage
| Stage | Board | Seating |
|---|---|---|
| 1. Ideation | Strategist, CMO, Funding Finder | As in the photo: CMO top-left, FF top-right, Strategist centre |
| 2. MVP | Strategist, CMO, CFO, Funding Finder | Arc of three over the Strategist |
| 3. Early Traction | Strategist, CEO, CFO, COO, CMO, CCO | Half-circle around the Strategist |
| 4. Scaling | Strategist, CEO, CFO, COO, CMO, CCO | Board table, Strategist at the head |

The Strategist is the same coordinator in every stage; only its mascot accessory changes.
Stage is chosen once when a business is created; new sessions use it automatically.

## Prototype limits (by design)
- Document upload and voice input are **simulated**: file selection, upload progress, processing,
  a recording animation and an editable sample transcript. Files are not read; no audio is recorded.
- Businesses and sessions live in the browser, so they don't sync across devices.
- Pricing is static example data. No payments. Contact details are placeholders.
- Not included: RAG, advanced memory, admin dashboard, mentor booking, follow-ups, payments.

## Project layout
```
src/app/            pages: dashboard, businesses/new, businesses/[id], sessions,
                    boardroom/[sessionId], contact, pricing, sign-in, sign-up, api/boardroom
src/components/     UI: mascots, board layouts, composer (docs + voice), session list, header
src/lib/            stages and roles, browser store, Groq client, prompts, types
src/proxy.ts        Clerk route protection (Next.js 16 "proxy", formerly middleware)
```
