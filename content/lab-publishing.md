Title: mltru.com publishing
Date: 2024-10-24 10:20
Modified: 2025-01-06 07:25
Category: lab
Tags: lab
Slug: mltru.com publishing
Authors: Mircea
Summary: details on how i push content on mltru.com


All content and publishing is public [mltru.com](http://github.com/micmnm/mltru.com).
Content is pushed to git repository and on-demand after a pull on the hosting maching everything gets published.

Building the static website is straightforward for *local* and *publish* modes.

```
# to build local
make html

# to test local; enable also autopublish for quick increments
pelican --autoreload --listen

# to publish
make publish
```