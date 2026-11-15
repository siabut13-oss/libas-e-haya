Libas-e-Haya - multi-page store (HTML/CSS/JS). Open the folder in VS Code > Live Server > index.html
Pages: index (home), shop, product?id=, cart (checkout), wishlist, track-order, about, contact, faq, policies, 404, admin/index.html
Core: assets/js/site.js (layout, cart, wishlist, products, checkout), assets/css/pages.css + typography.css (design + motion)
Settings (API_URL, WhatsApp, email, phone, Instagram): assets/js/config.js
Translations: assets/lang/en.js + ur.js. Theme: theme.js + light.css. Admin: admin/index.html (+ admin-extras.js CSV export)

Hero images: put your own photos in assets/img/model.jpg (styled outfit) and assets/img/flatlay.jpg (3-piece fabric flat-lay). If missing, cover.webp + a built-in SVG flat-lay are used.
Tailwind (CDN, preflight off) is used for hero layout utilities; luxury.css holds the hero styles so it still works offline.

Hero video: add assets/video/hero.mp4 (and optional hero.webm). See assets/video/README.txt. Without it the animated silk background shows.

Hero background: animated satin ribbons are drawn in assets/js/hero.js (section 'Flowing satin ribbons'); colours in the R / DK arrays.

Responsive: assets/css/responsive.css (phones 320px to 2560px, touch targets, safe areas, print).

Hero background: WebGL fabric waves in assets/js/fabric-gl.js (palette per theme in PAL; dark = original teal/gold).

Speed: products are cached in the browser (lh_pcache) and refreshed in the background; Tailwind CDN removed.
