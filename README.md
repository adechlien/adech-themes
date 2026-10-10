# Adech

## Design System site

The public site uses `https://design.adechlien.com` with three public routes:

- `/`: Adech Design System overview.
- `/themes`: Adech Themes, with Branches, Workspaces and theme documentation
  available through its local navigation (`#branches`, `#workspaces`, `#docs`).
- `/tools`: design utilities across Adech, starting with the existing color tools.

The previous root hash links redirect to the corresponding area. Vercel rewrites
in `vercel.json` support direct visits and reloads for the area routes. Other
hosting providers must serve `index.html` for `/themes` and `/tools` as well.

The domain is registered with Hostinger and uses Vercel nameservers. Domain
configuration is managed in the existing Vercel project `adechthemes`, whose
production repository is `adechlien/adech-themes`.

The CMS backend described below is local; these route changes do not deploy it.

Adech is a color ecosystem built around the idea of **branches**: independent theme systems designed to be used across both **projects** and **workspaces**.

Instead of being limited to a single theme or a single palette, Adech is structured to grow as a collection of branches, where each one can be adopted in different environments depending on its purpose. Some branches are meant to be integrated into websites, apps, design systems, and frontend projects. Others are meant to become full workspace themes for tools such as editors, creative software, or productivity platforms.

The goal of Adech is to make color reusable, portable, and consistent across different contexts. A branch can live as design tokens in code, as styling utilities in development workflows, or as a complete visual identity inside a workspace.

## What Adech offers

- A branch-based ecosystem for theme creation
- Reusable color systems for digital projects
- Theme implementations for workspaces and tools
- A foundation that can scale from code to interface

## Adechen Admin

This repo now includes a small local backend for managing Branches.

- Public Branches are loaded from `GET /api/branches`.
- The private manager lives at `/admin`.
- The SQLite database is created locally at `data/adech.sqlite`.
- The default development admin token is `adech-local-admin`.

For a real deployment, set `ADECH_ADMIN_TOKEN` before starting the API.

```bash
npm run dev
```

The command starts the Vite app and the local API. The public site runs on:

```txt
http://localhost:5173
```

The admin URL is:

```txt
http://localhost:5173/admin
```

## Where Adech can be used

Adech is built to support two main areas:

### Projects
Websites, apps, design systems, and frontend workflows.

### Workspaces
Code editors, tools, and platforms where a branch becomes part of the working environment.

## Philosophy

Adech is not just a set of colors. It is a growing system for building visual identities that can move between products and spaces while preserving coherence.
