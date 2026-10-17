# NoteHub

NoteHub is a notes application built with Next.js App Router, TypeScript,
TanStack Query, Axios, CSS Modules, and Zustand. Notes can be browsed by tag,
searched, created, and deleted. An unfinished note is persisted in the browser
so its draft can be resumed after navigation or a page reload.

## Requirements

- Node.js 20 or newer
- A NoteHub API access token

## Local development

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_NOTEHUB_TOKEN` to
   your NoteHub API token.

3. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run build
```

## Deployment

Import this repository into Vercel and add `NEXT_PUBLIC_NOTEHUB_TOKEN` in the
project's Environment Variables settings for the environments you use. Redeploy
after changing environment variables. Once the production URL is available,
update the Open Graph URLs currently using `https://notehub.com/`.
