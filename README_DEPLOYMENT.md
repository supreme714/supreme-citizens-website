# The Supreme Citizens Charter — Netlify-Ready Website

## Primary domain
Recommended production domain: `SupremeCitizens.org`

## Included pages
- `index.html` — Home
- `charter.html` — Full reading edition generated from the branded Charter document
- `principles.html` — 12 Principles
- `identity.html` — Meaning of “Supreme Citizens” and “a Supreme Citizen”
- `participate.html` — Citizen Action Guide, Political Coercion Test, Reversibility Test
- `about.html` — Civic-educational purpose
- `404.html` — Custom not-found page

## Included production files
- `netlify.toml`
- `_redirects`
- `_headers`
- `robots.txt`
- `sitemap.xml`
- `manifest.webmanifest`
- `/assets/styles.css`
- `/assets/site.js`
- `/assets/supreme-citizens-logo.png`

## Netlify deployment
1. Sign in to Netlify.
2. Create a new site and deploy this folder (or connect the repository containing these files).
3. The publish directory is the site root (`.`); `netlify.toml` is already configured.
4. In Netlify domain management, add `SupremeCitizens.org` as the custom production domain.
5. Follow Netlify's DNS instructions at your domain registrar, or delegate DNS to Netlify.
6. Enable HTTPS after DNS is correctly pointed. Netlify typically provisions the certificate automatically.
7. Verify `https://supremecitizens.org/robots.txt` and `https://supremecitizens.org/sitemap.xml`.
8. Submit the sitemap to your preferred search-engine webmaster tools.

## Important
Do not place secret keys, passwords, API tokens, or private credentials in `netlify.toml` or any public website file.

## Content note
This website is a civic and educational presentation of The Supreme Citizens Charter. It is not legal advice and does not replace governing law or the U.S. Constitution.
