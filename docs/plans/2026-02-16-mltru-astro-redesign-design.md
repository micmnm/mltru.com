# mltru.com Redesign — Astro Static Site

## Overview

Rebuild mltru.com as a personal website using Astro. Replace existing Pelican setup entirely. Simple markdown-based blog for publishing thoughts (text + images), with a short about page.

## Tech Stack

- **Framework:** Astro (static output)
- **Content:** Markdown files with Astro Content Collections
- **Styling:** Plain CSS (no framework)
- **Deploy:** Woodpecker CI (Synology) → Docker image (nginx) → LKE (Linode Kubernetes)

## Site Structure

```
mltru.com/              → Homepage (intro + post list)
mltru.com/posts/        → All posts grouped by year
mltru.com/posts/<slug>  → Individual post
mltru.com/about         → About page
mltru.com/rss.xml       → RSS feed
```

## Layout

### Navigation bar
- Site title "mltru" (links to home)
- "posts" link
- "about" link

### Homepage
1. **Header section:** Short intro ("Hi, I'm Mircea. One-liner.") + social icons (GitHub, LinkedIn) + RSS link
2. **Post list:** Posts grouped by year, each showing title + first sentence from post content (auto-extracted, no manual description field)

### Post page
- Title, date, full markdown content with images

### About page
- Short description

## Content Authoring

Directory structure (year folders for organization only):
```
src/content/posts/
  2025/
    mltru-com-publishing.md
  2026/
    some-new-thought.md
```

Minimal front matter:
```yaml
---
title: "Some thought"
date: 2026-02-16
---

First sentence becomes the excerpt on the homepage. Rest of the post continues here...
```

- Year grouping derived from `date` field, not folder structure
- Excerpt auto-extracted from first sentence of content
- Images via standard markdown `![alt](./image.png)`

## Design

### Color palette
- Dark gray background: ~#1a1a1a
- Surface/card: ~#2a2a2a
- Body text: ~#d4d4d4
- Headings: ~#f0f0f0
- Accent (links/hover): muted teal or warm orange — to be refined

### Typography (non-mainstream, geekish/artsy/punk personality)
- **Headings:** Space Grotesk or Syne (geometric, angular, character)
- **Body/nav:** IBM Plex Mono or JetBrains Mono (readable monospace)

### Vibe
Pleasant, clean, gray-ish — but with personality. Not corporate, not generic. Geekish, artsy, punk.

## Deploy Pipeline

```
git push
  → Woodpecker detects push
  → npm install + astro build (static output)
  → Build nginx Docker image containing static files
  → Push image to Synology container registry
  → kubectl apply to LKE (namespace: mltru-com)
```

### Kubernetes resources (namespace: mltru-com)
- Deployment: nginx serving static files
- Service: ClusterIP
- Ingress: route mltru.com to service (TLS via existing cert-manager)

## Migration

Existing content to migrate (trivial):
- `content/0001-lab-publishing.md` → `src/content/posts/2025/mltru-com-publishing.md`
- `content/0001-texts-first.md` → placeholder, can be dropped
- `content/pages/about.md` → `src/pages/about.astro`

## Out of scope
- Search
- Tags/categories
- Comments
- Analytics
- Dark/light mode toggle (dark only)
