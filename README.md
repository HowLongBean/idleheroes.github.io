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

The three skill-tree selectors are centered, with information and save buttons
stacked vertically to the right of the arrow. The information and arrow artwork
align at their visible top edges, accounting for the transparent image padding.
The information button has no action yet. The save button generates a share URL
and attempts to copy it to the clipboard, with a manual-copy field if copying is
unavailable or denied.

Skill-tree share links point to
https://howlongbean.github.io/idleheroes.github.io/Imprint/imprint.html
and restore all three trees' selections, defaulting to the shield tree.
The displayed tree is not saved; older links' active-tree fields are ignored.
Invalid links show an error without applying partial selections; the 63-point
limit and node prerequisites still apply. Editing selections clears the displayed
share URL until it is generated again; switching trees leaves it unchanged.

Both tools use [shared-state.js](shared-state.js) for `z1.` DEFLATE/Base64URL state
encoding, decoding, and share/copy feedback. Existing Cloud Island share links
remain compatible.