# mltru.com Astro Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild mltru.com as an Astro static site with dark gray design, distinctive typography, auto-deploy via Woodpecker to LKE.

**Architecture:** Astro static site with Content Collections for markdown posts. nginx Docker image serves the built output. Woodpecker CI builds and deploys on git push to LKE Kubernetes cluster.

**Tech Stack:** Astro 5, @astrojs/rss, CSS (no framework), Docker (nginx:alpine), Kubernetes, Woodpecker CI

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`

**Step 1: Initialize Astro project**

Run from project root (replace existing Pelican files later):

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
```

If the CLI refuses to write into a non-empty directory, create in a temp dir and move:

```bash
npm create astro@latest /tmp/mltru-astro -- --template minimal --no-install --no-git --typescript strict
cp /tmp/mltru-astro/package.json /tmp/mltru-astro/astro.config.mjs /tmp/mltru-astro/tsconfig.json .
mkdir -p src
cp -r /tmp/mltru-astro/src/* src/
rm -rf /tmp/mltru-astro
```

**Step 2: Configure astro.config.mjs**

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mltru.com",
  output: "static",
});
```

**Step 3: Install dependencies**

```bash
npm install
npm install @astrojs/rss
```

**Step 4: Add .gitignore entries**

Append to existing `.gitignore`:

```
node_modules/
dist/
.astro/
```

**Step 5: Verify it builds**

```bash
npx astro build
```

Expected: Build succeeds, output in `dist/`

**Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/ .gitignore
git commit -m "feat: scaffold Astro project"
```

---

### Task 2: Set up Content Collections for posts

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/posts/2024/mltru-com-publishing.md`

**Step 1: Define the posts collection schema**

Create `src/content.config.ts`:

```ts
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = { posts };
```

Only `title` and `date` are required. Excerpt is auto-extracted from content at render time.

**Step 2: Create a test post**

Create `src/content/posts/2024/mltru-com-publishing.md`:

```markdown
---
title: "mltru.com publishing"
date: 2024-10-24
---

All content and publishing is public [mltru.com](http://github.com/micmnm/mltru.com).
Content is pushed to git repository and on-demand after a pull on the hosting machine everything gets published.

Building the static website is straightforward for *local* and *publish* modes.
```

**Step 3: Verify collections work**

```bash
npx astro build
```

Expected: Build succeeds without schema validation errors.

**Step 4: Commit**

```bash
git add src/content.config.ts src/content/posts/
git commit -m "feat: add content collection schema and first post"
```

---

### Task 3: Create base layout with typography and colors

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/styles/global.css`

**Step 1: Create global CSS**

Create `src/styles/global.css`:

```css
/* Fonts: Space Grotesk for headings, IBM Plex Mono for body */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap');

:root {
  --bg: #1a1a1a;
  --surface: #2a2a2a;
  --text: #d4d4d4;
  --text-bright: #f0f0f0;
  --accent: #7ab8b0;
  --accent-hover: #9ad0c8;
  --text-muted: #888;
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'IBM Plex Mono', 'Courier New', monospace;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.7;
  min-height: 100vh;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  color: var(--text-bright);
  line-height: 1.3;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

code {
  font-family: var(--font-body);
  background: var(--surface);
  padding: 0.15em 0.3em;
  border-radius: 3px;
  font-size: 0.9em;
}

pre {
  background: var(--surface);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  line-height: 1.4;
}

pre code {
  background: none;
  padding: 0;
}
```

**Step 2: Create base layout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
interface Props {
  title?: string;
}

const { title } = Astro.props;
const siteTitle = "mltru";
const pageTitle = title ? `${title} — ${siteTitle}` : siteTitle;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <nav>
      <a href="/" class="nav-title">{siteTitle}</a>
      <div class="nav-links">
        <a href="/posts">posts</a>
        <a href="/about">about</a>
      </div>
    </nav>
    <main>
      <slot />
    </main>
  </body>
</html>

<style>
  @import "../styles/global.css";

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    max-width: 48rem;
    margin: 0 auto;
  }

  .nav-title {
    font-family: var(--font-heading);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-bright);
  }

  .nav-title:hover {
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
  }

  .nav-links a {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: lowercase;
    letter-spacing: 0.05em;
  }

  .nav-links a:hover {
    color: var(--text-bright);
    text-decoration: none;
  }

  main {
    max-width: 48rem;
    margin: 0 auto;
    padding: 0 2rem 4rem;
  }
</style>
```

**Step 3: Update the default index page to use the layout**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout>
  <p>Site is coming together.</p>
</BaseLayout>
```

**Step 4: Verify**

```bash
npx astro dev
```

Open http://localhost:4321 — verify nav bar renders, dark background, fonts load.

**Step 5: Commit**

```bash
git add src/layouts/ src/styles/ src/pages/index.astro
git commit -m "feat: add base layout with nav, dark theme, typography"
```

---

### Task 4: Build the homepage

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Implement homepage with intro + post list grouped by year**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { getCollection } from "astro:content";

const posts = await getCollection("posts");

// Sort posts by date descending
posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Group by year
const postsByYear: Record<number, typeof posts> = {};
for (const post of posts) {
  const year = post.data.date.getFullYear();
  if (!postsByYear[year]) postsByYear[year] = [];
  postsByYear[year].push(post);
}
const years = Object.keys(postsByYear)
  .map(Number)
  .sort((a, b) => b - a);

// Extract first sentence from markdown body
function getExcerpt(body: string): string {
  // Strip markdown syntax, get first sentence
  const plain = body
    .replace(/^---[\s\S]*?---/, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[#*>`_~]/g, "")
    .trim();
  const match = plain.match(/[^.!?]*[.!?]/);
  return match ? match[0].trim() : plain.slice(0, 120);
}
---

<BaseLayout>
  <header class="intro">
    <h1>Hi, I'm Mircea.</h1>
    <p class="tagline">Computer hobbyist. Experimenting, tinkering, playing.</p>
    <div class="social">
      <a href="https://github.com/micmnm/" target="_blank">github</a>
      <a href="https://www.linkedin.com/in/mircea-militaru-97201218/" target="_blank">linkedin</a>
      <a href="/rss.xml">rss</a>
    </div>
  </header>

  <section class="posts">
    {years.map((year) => (
      <div class="year-group">
        <h2 class="year">{year}</h2>
        <ul>
          {postsByYear[year].map((post) => (
            <li>
              <a href={`/posts/${post.id}/`}>
                <span class="post-title">{post.data.title}</span>
                <span class="post-excerpt">{getExcerpt(post.body ?? "")}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </section>
</BaseLayout>

<style>
  .intro {
    margin: 2rem 0 3rem;
  }

  .intro h1 {
    font-size: 2rem;
    margin-bottom: 0.3rem;
  }

  .tagline {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .social {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
  }

  .social a {
    color: var(--text-muted);
    border: 1px solid var(--surface);
    padding: 0.25rem 0.6rem;
    border-radius: 3px;
  }

  .social a:hover {
    color: var(--text-bright);
    border-color: var(--text-muted);
    text-decoration: none;
  }

  .posts {
    margin-top: 2rem;
  }

  .year {
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 400;
    margin-bottom: 0.8rem;
    letter-spacing: 0.1em;
  }

  .year-group {
    margin-bottom: 2rem;
  }

  ul {
    list-style: none;
  }

  li {
    margin-bottom: 1rem;
  }

  li a {
    display: block;
    padding: 0.6rem 0.8rem;
    border-radius: 4px;
  }

  li a:hover {
    background: var(--surface);
    text-decoration: none;
  }

  .post-title {
    display: block;
    color: var(--text-bright);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .post-excerpt {
    display: block;
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-top: 0.2rem;
  }
</style>
```

**Step 2: Verify**

```bash
npx astro dev
```

Open http://localhost:4321 — verify intro, social links, post list with year grouping and excerpts.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build homepage with intro and year-grouped post list"
```

---

### Task 5: Create individual post page

**Files:**
- Create: `src/pages/posts/[...id].astro`

**Step 1: Create dynamic post route**

Create `src/pages/posts/[...id].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);

const dateStr = post.data.date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---

<BaseLayout title={post.data.title}>
  <article>
    <header>
      <h1>{post.data.title}</h1>
      <time datetime={post.data.date.toISOString()}>{dateStr}</time>
    </header>
    <div class="content">
      <Content />
    </div>
  </article>
</BaseLayout>

<style>
  article {
    margin-top: 2rem;
  }

  header {
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 1.8rem;
    margin-bottom: 0.4rem;
  }

  time {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .content {
    font-size: 0.9rem;
    line-height: 1.8;
  }

  .content :global(h2) {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }

  .content :global(h3) {
    margin-top: 1.5rem;
    margin-bottom: 0.4rem;
    font-size: 1rem;
  }

  .content :global(p) {
    margin-bottom: 1rem;
  }

  .content :global(ul),
  .content :global(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .content :global(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 1rem;
    color: var(--text-muted);
    margin: 1rem 0;
  }

  .content :global(img) {
    border-radius: 4px;
    margin: 1rem 0;
  }
</style>
```

**Step 2: Verify**

```bash
npx astro dev
```

Navigate to http://localhost:4321/posts/2024/mltru-com-publishing/ — verify the post renders with title, date, and content.

**Step 3: Commit**

```bash
git add src/pages/posts/
git commit -m "feat: add individual post page with dynamic routing"
```

---

### Task 6: Create posts index page and about page

**Files:**
- Create: `src/pages/posts/index.astro`
- Create: `src/pages/about.astro`

**Step 1: Create posts index page**

Create `src/pages/posts/index.astro` — same year-grouped list as homepage but without the intro:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getCollection } from "astro:content";

const posts = await getCollection("posts");
posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const postsByYear: Record<number, typeof posts> = {};
for (const post of posts) {
  const year = post.data.date.getFullYear();
  if (!postsByYear[year]) postsByYear[year] = [];
  postsByYear[year].push(post);
}
const years = Object.keys(postsByYear).map(Number).sort((a, b) => b - a);

function getExcerpt(body: string): string {
  const plain = body
    .replace(/^---[\s\S]*?---/, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[#*>`_~]/g, "")
    .trim();
  const match = plain.match(/[^.!?]*[.!?]/);
  return match ? match[0].trim() : plain.slice(0, 120);
}
---

<BaseLayout title="Posts">
  <h1 class="page-title">Posts</h1>
  <section class="posts">
    {years.map((year) => (
      <div class="year-group">
        <h2 class="year">{year}</h2>
        <ul>
          {postsByYear[year].map((post) => (
            <li>
              <a href={`/posts/${post.id}/`}>
                <span class="post-title">{post.data.title}</span>
                <span class="post-excerpt">{getExcerpt(post.body ?? "")}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </section>
</BaseLayout>

<style>
  .page-title {
    font-size: 1.6rem;
    margin: 2rem 0 1.5rem;
  }

  .year {
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 400;
    margin-bottom: 0.8rem;
    letter-spacing: 0.1em;
  }

  .year-group { margin-bottom: 2rem; }
  ul { list-style: none; }
  li { margin-bottom: 1rem; }

  li a {
    display: block;
    padding: 0.6rem 0.8rem;
    border-radius: 4px;
  }

  li a:hover {
    background: var(--surface);
    text-decoration: none;
  }

  .post-title {
    display: block;
    color: var(--text-bright);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .post-excerpt {
    display: block;
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-top: 0.2rem;
  }
</style>
```

**Step 2: Create about page**

Create `src/pages/about.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="About">
  <article class="about">
    <h1>About me</h1>
    <p>
      My name is Mircea and I'm a computer hobbyist.
      I like to play on my computer by experimenting with software, tinkering and playing.
    </p>
    <p>
      <a href="https://mltru.com/">mltru.com</a> was created to keep track of my discoveries.
    </p>
  </article>
</BaseLayout>

<style>
  .about {
    margin-top: 2rem;
  }

  .about h1 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  .about p {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    line-height: 1.8;
  }
</style>
```

**Step 3: Verify**

```bash
npx astro dev
```

Check http://localhost:4321/posts and http://localhost:4321/about

**Step 4: Commit**

```bash
git add src/pages/posts/index.astro src/pages/about.astro
git commit -m "feat: add posts index and about page"
```

---

### Task 7: Add RSS feed

**Files:**
- Create: `src/pages/rss.xml.ts`

**Step 1: Create RSS endpoint**

Create `src/pages/rss.xml.ts`:

```ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("posts");
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: "mltru",
    description: "Mircea's thoughts and discoveries",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
    })),
  });
}
```

**Step 2: Verify**

```bash
npx astro build
```

Check that `dist/rss.xml` exists and contains valid XML.

```bash
cat dist/rss.xml
```

**Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: add RSS feed"
```

---

### Task 8: Copy static assets (favicons)

**Files:**
- Copy: `content/static/*` → `public/`

**Step 1: Move static assets to Astro's public directory**

```bash
mkdir -p public
cp content/static/favicon.ico public/
cp content/static/favicon-16x16.png public/
cp content/static/favicon-32x32.png public/
cp content/static/apple-touch-icon.png public/
cp content/static/site.webmanifest public/
```

**Step 2: Verify build includes them**

```bash
npx astro build
ls dist/favicon.ico
```

Expected: File exists in dist/

**Step 3: Commit**

```bash
git add public/
git commit -m "feat: add favicon and static assets"
```

---

### Task 9: Create Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Step 1: Create .dockerignore**

```
node_modules
dist
.git
.astro
output
pelican-hyde
__pycache__
*.sketch
*.png
!public/*.png
```

**Step 2: Create multi-stage Dockerfile**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Step 3: Test Docker build locally**

```bash
docker build -t mltru-com .
docker run --rm -p 8080:80 mltru-com
```

Open http://localhost:8080 — verify site works.

**Step 4: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "feat: add Dockerfile for nginx static serving"
```

---

### Task 10: Create Kubernetes manifests

**Files:**
- Create: `k8s/namespace.yaml`
- Create: `k8s/deployment.yaml`
- Create: `k8s/service.yaml`
- Create: `k8s/ingress.yaml`

**Step 1: Create namespace**

Create `k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mltru-com
```

**Step 2: Create deployment**

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mltru-com
  namespace: mltru-com
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mltru-com
  template:
    metadata:
      labels:
        app: mltru-com
    spec:
      containers:
        - name: web
          image: REGISTRY_HOST/mltru-com:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "32Mi"
              cpu: "10m"
            limits:
              memory: "64Mi"
              cpu: "50m"
```

> **Note:** Replace `REGISTRY_HOST` with the actual Synology registry hostname during deployment setup.

**Step 3: Create service**

Create `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mltru-com
  namespace: mltru-com
spec:
  selector:
    app: mltru-com
  ports:
    - port: 80
      targetPort: 80
```

**Step 4: Create ingress**

Create `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mltru-com
  namespace: mltru-com
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - mltru.com
      secretName: mltru-com-tls
  rules:
    - host: mltru.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: mltru-com
                port:
                  number: 80
```

> **Note:** Adjust `cert-manager.io/cluster-issuer` annotation to match the existing cluster issuer name.

**Step 5: Commit**

```bash
git add k8s/
git commit -m "feat: add Kubernetes manifests for LKE deployment"
```

---

### Task 11: Create Woodpecker CI pipeline

**Files:**
- Create: `.woodpecker.yml`

**Step 1: Create pipeline config**

Create `.woodpecker.yml`:

```yaml
steps:
  - name: build
    image: node:22-alpine
    commands:
      - npm ci
      - npm run build

  - name: docker
    image: woodpeckerci/plugin-docker-buildx
    settings:
      repo: REGISTRY_HOST/mltru-com
      registry: REGISTRY_HOST
      tags: latest,${CI_COMMIT_SHA:0:8}
      username:
        from_secret: registry_username
      password:
        from_secret: registry_password

  - name: deploy
    image: bitnami/kubectl
    commands:
      - kubectl set image deployment/mltru-com web=REGISTRY_HOST/mltru-com:${CI_COMMIT_SHA:0:8} -n mltru-com
    environment:
      KUBECONFIG:
        from_secret: kubeconfig

when:
  branch: main
  event: push
```

> **Note:** Replace `REGISTRY_HOST` with Synology registry address. Secrets (`registry_username`, `registry_password`, `kubeconfig`) must be configured in Woodpecker.

**Step 2: Commit**

```bash
git add .woodpecker.yml
git commit -m "feat: add Woodpecker CI pipeline for build and deploy"
```

---

### Task 12: Clean up old Pelican files

**Files:**
- Remove: `pelicanconf.py`
- Remove: `publishconf.py`
- Remove: `tasks.py`
- Remove: `Makefile`
- Remove: `content/` (old Pelican content)
- Remove: `output/`
- Remove: `__pycache__/`
- Remove: `guide.md`
- Remove: `theme.sketch`
- Remove: `logo@1x.png`
- Remove: `favicon_io-2/`
- Keep: `pelican-hyde/` — remove as git submodule

**Step 1: Remove old files**

```bash
git rm pelicanconf.py publishconf.py tasks.py Makefile guide.md
git rm -r content/
git rm --cached pelican-hyde
rm -rf pelican-hyde __pycache__ output favicon_io-2 theme.sketch logo@1x.png
```

**Step 2: Update .gitignore**

Replace `.gitignore` contents:

```
node_modules/
dist/
.astro/
.DS_Store
```

**Step 3: Update README.md**

Replace `README.md`:

```markdown
# mltru.com

Personal website built with [Astro](https://astro.build), written in Markdown.

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
```

## Deploy

Pushes to `main` trigger Woodpecker CI which builds and deploys to LKE.
```

**Step 4: Verify clean build**

```bash
npx astro build
```

Expected: Builds successfully with no leftover Pelican references.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Pelican and clean up old files"
```

---

### Task 13: Final verification

**Step 1: Full build from clean state**

```bash
rm -rf node_modules dist .astro
npm install
npm run build
```

Expected: Builds cleanly.

**Step 2: Docker build and test**

```bash
docker build -t mltru-com .
docker run --rm -p 8080:80 mltru-com
```

Verify in browser:
- Homepage: intro + post list ✓
- Posts page: year-grouped list ✓
- Individual post: renders markdown ✓
- About: displays content ✓
- RSS: valid XML at /rss.xml ✓
- Navigation works across all pages ✓
- Fonts load (Space Grotesk, IBM Plex Mono) ✓
- Dark gray theme throughout ✓

**Step 3: Commit any fixes, then tag**

```bash
git tag v1.0.0
```
