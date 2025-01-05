AUTHOR = 'Mircea Militaru'
SITENAME = 'mltru'
SITEURL = "http://localhost:8000"

THEME = "pelican-hyde/"

PATH = "content"

TIMEZONE = 'Europe/Bucharest'

DEFAULT_LANG = 'English'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
FONT_BOOKERLY = "True"

# Blogroll
#LINKS = None
LINKS = (
    ("Pelican", "https://getpelican.com/"),
    ("Python.org", "https://www.python.org/"),
    ("Jinja2", "https://palletsprojects.com/p/jinja/"),
    ("You can modify those links in your config file", "#"),
)

# Social widget
#SOCIAL = None
SOCIAL = (
    ("linkedin", "https://www.linkedin.com/in/mircea-militaru-97201218/"),
    ("github", "https://github.com/micmnm/"),
)

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

# TEMPLATE VARS
SIDEBAR_SOCIAL = False
MENUITEMS = (
    ("texts", "category/texts.html"),
    ("lab", "category/lab.html"),
    ("about", "pages/about.html")
)
