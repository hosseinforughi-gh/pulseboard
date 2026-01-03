# PulseBoard

A tiny project dashboard to practice React Query, Zustand, routing, and a polished UI with shadcn/ui.

## Live

- App (Vercel): https://hf-pulseboard.vercel.app
- API (Render / json-server): https://pulseboard-api.onrender.com

> Note: Render free instances can “sleep”, so the first request may take a few seconds.

## Screenshots

### Projects list + pagination

<img
  src="./assets/screenshot-projects-list.png"
  alt="PulseBoard projects list with pagination"
  width="1000"
/>

### Search (debounced) + URL sync

<img
  src="./assets/screenshot-projects-search.png"
  alt="PulseBoard projects search with URL query params"
  width="1000"
/>

## Features

- Auth (demo login) + protected routes + redirect back after login
- Projects list with:
  - Search (debounced) + URL query sync
  - Pagination (shadcn/ui)
  - Optimistic CRUD (create/update/delete) with rollback on error
  - Prefetching next page
  - Nice UX: skeleton/empty states + toast notifications
- Clean architecture: feature-based folder structure, query keys, reusable hooks

## Tech Stack

- React + TypeScript + Vite
- React Router
- TanStack Query (React Query)
- Zustand
- TailwindCSS + shadcn/ui
- Sonner (toasts)
- json-server (API)

## Run locally

### 1) Install

```bash
npm i
```
