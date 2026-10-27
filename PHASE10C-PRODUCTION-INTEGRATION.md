# Phase 10C production integration

The visual implementation is in `assets/phase10c-unified-nav.js` and is loaded by `phase-10c-navigation-preview.html` for Netlify review.

After the preview is approved, the production activation step is to load `assets/phase10c-unified-nav.js` after `assets/site.js` on existing pages (or merge its implementation into the shared site script). This deliberately separates visual approval from production activation.

Do not treat the production navigation as activated merely because this PR is merged unless the shared production pages have been wired to the Phase 10C script.
