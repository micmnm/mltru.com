---
title: pear-music
date: 2026-04-08
---

A weekend side quest that got out of hand, gently.

I listen to music in albums. Start to finish, in order, the way they were put together. Playlists and shuffles never quite did it for me — I want the thing the artist actually made, and I want the next one to be another album, not a song plucked out of one. Apple Music is great, but it doesn't really bend that way, so I wanted a small tool that did. Just mine, just on my machine.

I started describing what I wanted to Claude and we built it over a couple of evenings, arguing about the details more than I expected.

Then I got curious. What if a few friends could use it too? That one question turned a personal utility into a multi-tenant app, which is a very different animal. Not dramatically — there's still a soft cap of 15 users and a tiny admin page where I approve people off a waitlist — but enough that the shape of the thing had to change. Passkey-only login. No passwords. No emails. Ever.

Under the hood it's a Vite + TypeScript SPA sitting on top of Supabase — Postgres, edge functions, RLS, the usual suspects. Mostly I described what I wanted and Claude typed, and every so often one of us pushed back on the other.

It's live at [music.mltru.com](https://music.mltru.com) and the code is at [github.com/micmnm/pear-music](https://github.com/micmnm/pear-music).
