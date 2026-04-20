import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const parser = new MarkdownIt();

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
      content: sanitizeHtml(parser.render(post.body ?? ""), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt", "title"],
        },
      }),
    })),
  });
}
