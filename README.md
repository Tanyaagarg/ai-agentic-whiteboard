# WhizBoard

An AI whiteboard. Sketch on an infinite canvas, or describe a flowchart or a
screen layout and have it drawn for you.

## Stack

| Piece | Used for |
| --- | --- |
| Next.js 16 (App Router) + React 19 | app framework |
| Clerk | authentication |
| Neon Postgres + Drizzle ORM | boards and canvas data |
| Excalidraw | the canvas itself |
| Google Gemini | generating diagrams from a prompt |
| Tailwind v4 + shadcn/Base UI | interface |

## Running it locally

```bash
npm install
cp .env.example .env   # then fill in the real values
npm run db:push        # create the tables on your Neon database
npm run dev
```

### Environment variables

Every key in `.env.example` is required. `GEMINI_API_KEY` is the only one
without a placeholder you can guess — get it from Google AI Studio.

## Layout

```
app/
  api/
    ai/          POST -> Gemini, returns canvas elements as JSON
    projects/    boards: create, list, rename, archive, restore, delete
    users/       creates the users row for a Clerk account on first load
    whiteboard/  saves and loads canvas data
  dashboard/     board grid, plus the archive page
  workspace/     a single board
components/
  custom/        this app's components, grouped by the page they belong to
  ui/            shadcn output — vendored, not linted
context/         small client-side providers (board search, user detail)
db/              Drizzle schema and client
proxy.ts         Clerk middleware (Next 16's replacement for middleware.ts)
```

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run lint        # eslint
npm run db:push     # push schema changes to Neon
npm run db:studio   # browse the database
```

## Deploying

Vercel: import the repo, add every variable from `.env.example` to the project's
environment, and deploy. A few things to do once:

- Point `NEXT_PUBLIC_APP_URL` at the deployed URL.
- Move Clerk from its development instance to a production one and swap in the
  live keys, otherwise sign-in shows a "Development mode" banner.
- Rename the application in the Clerk dashboard — the sign-in card's heading
  comes from there, not from this code.
