import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

function stripMarkdown(body: string): string {
  return body
    .replace(/^---[\s\S]*?---/, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[#*>`_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getExcerpt(body: string): string {
  const plain = stripMarkdown(body);
  // Terminator must be followed by a space or end-of-text, so domains like
  // "mltru.com" don't get read as the end of the sentence.
  const match = plain.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return match ? match[0].trim() : plain.slice(0, 120).trim();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Structure follows llmstxt.org: H1, blockquote summary, free prose, then
// H2-delimited link lists.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://mltru.com");
  const url = (path: string) => new URL(path, base).href;

  const posts = await getCollection("posts");
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const postLines = posts.map((post) => {
    const link = url("/posts/" + post.id + "/");
    return `- [${post.data.title}](${link}): ${formatDate(post.data.date)} — ${getExcerpt(post.body ?? "")}`;
  });

  const body = `# mltru

> The personal site of Mircea, a computer hobbyist who writes about software,
> tinkering, and taking things apart to see how they work.

Short, first-person posts, usually about something recently built, broken, or
reconsidered. Recurring subjects: working alongside LLMs and agents, small
self-hosted tools, and how the craft of building software keeps changing shape.

There is nothing to sign up for here — no newsletter, no products, no tracking.
The site is a static Astro build written in Markdown, deployed to Kubernetes
behind nginx, and its source is public.

## Posts

${postLines.join("\n")}

## Optional

- [About](${url("/about/")}): Who writes this, in three sentences.
- [All posts](${url("/posts/")}): Full index, newest first.
- [RSS](${url("/rss.xml")}): Feed carrying full post content, not just summaries.
- [Source](https://github.com/micmnm/mltru.com): The repository this site is built from.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
