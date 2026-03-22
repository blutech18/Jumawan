## Cristan Jade Jumawan – Portfolio (Frontend)

This project is the **public portfolio site** for Cristan Jade Jumawan.  
It is a React + TypeScript single‑page application built with Vite, Tailwind CSS, and shadcn‑ui, backed by Convex for data and storage.

The admin panel that manages this portfolio lives in a separate project: `Jumawan_Portfolio-Admin`.

---

## Features

- **Hero & About** – Intro, professional summary, and carousel imagery.
- **Skills & Tools** – Detailed skills grid and tools carousel.
- **Work Experience** – Dynamic timeline backed by the `work_experience` table in Convex.
- **Certificates & Achievements** – Dynamic list backed by the `certificates` table.
- **Featured Projects** – Dynamic grid backed by the `projects` table with modal view.
- **Contact / “Let’s Work Together”** – Contact form that writes to the `contact_messages` table.
- **Analytics** – Page‑view and contact‑form events stored in the `analytics` table, used by the admin Analytics page.

All dynamic content (projects, certificates, experience, contact messages, analytics) is managed via the **admin app** and rendered read‑only here.

---

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Tooling**: Vite
- **Styling**: Tailwind CSS, custom navy theme
- **UI Library**: shadcn‑ui (Radix primitives)
- **Data**: Convex (real-time backend)
- **State / Data Fetching**: @tanstack/react-query + Convex client
- **Animations**: Framer Motion

---

## Local Development

### 1. Prerequisites

- Node.js 18+ and npm
- A Convex project (shared with the admin app)

### 2. Install dependencies

```sh
cd Jumawan
npm install
```

### 3. Environment variables

Create a `.env.local` file with:

```sh
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment-name.convex.site
```

These are used by the Convex client in `src/lib/convexClient.ts`.

### 4. Database setup (Convex)

The schema is defined in `convex/schema.ts`. Deploy the backend with:

```sh
npx convex dev
```

This creates and syncs all tables:

- `projects` – Featured projects shown in **Featured Projects**.
- `certificates` – Certificates shown in **Certificates & Achievements**.
- `contact_messages` – Messages from the **Let’s Work Together** contact form.
- `analytics` – Page views and events used on the Analytics page in the admin app.
- `work_experience` – Entries for the **Work Experience** section.
- Public `images` storage bucket for project / certificate images.

> The admin app (`Jumawan_Portfolio-Admin`) shares the same Convex deployment.

### 5. Run the dev server

```sh
npm run dev
```

By default, Vite is configured to run on **http://localhost:8080** (see `vite.config.ts`).

---

## How this app talks to Convex

- Convex client is defined in `src/lib/convexClient.ts`.
- Convex functions live in `convex/` (queries, mutations, HTTP actions).
- Sections that read data:
  - Projects: `src/components/sections/projects-section.tsx` → `projects` table
  - Certificates: `src/components/sections/certificates-section-dynamic.tsx` → `certificates` table
  - Work Experience: `src/components/sections/experience-section.tsx` → `work_experience` table
  - Contact form: `src/components/sections/contact-section-dynamic.tsx` → `contact_messages` table
- Analytics events:
  - Section page views insert into `analytics` with `event_type = 'page_view'`.
  - Contact form submissions also add an `analytics` row for `contact_form_submission`.

These analytics are read on the admin side by `analytics.service.ts`.

---

## Relationship to the Admin App

- **This project**: public portfolio UI only; no authentication; all data comes from Convex.
- **`Jumawan_Portfolio-Admin`**: separate Vite/React + Convex project that:
  - Manages projects, certificates, work experience, and contact messages.
  - Shows dashboard stats and analytics based on the same Convex tables.

To see update flow end‑to‑end:

1. Log into the admin app and create / edit projects, certificates, or work experience.
2. Refresh this portfolio – the public sections will reflect the latest Convex data.

---

## Deployment Notes

You can deploy this Vite app to any static hosting that supports SPA builds:

1. Build:

```sh
npm run build
```

2. Deploy the `dist/` folder to your platform of choice (Vercel, Netlify, Cloudflare Pages, etc.).
3. Make sure the production environment has `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` set.

Convex backend stays the same for both local and production; only the frontend host changes.

---

## Scripts

- `npm run dev` – Start local dev server.
- `npm run build` – Build for production.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Run ESLint on the project.

