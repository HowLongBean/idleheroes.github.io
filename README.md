# idleheroes.github.io

Static site for GitHub Pages; no build step is required. Publish the repository
root to serve [index.html](index.html) as the homepage.

The top-left hamburger menu is available on all three pages and stays at the top
while scrolling. Its links, in order, are:

- [Home](index.html)
- [Cloud Island simulator](Cloud/CloudIsland.html)
- [Interactive skill tree](Imprint/imprint.html)

Navigation uses relative URLs to support both user and project GitHub Pages sites.
All pages share [site-navigation.css](site-navigation.css); the menu works without
JavaScript.

Cloud Island share links point to
https://howlongbean.github.io/idleheroes.github.io/Cloud/CloudIsland.html
and include the saved configuration in the `state` query parameter.