Aurexon v7.22 — Background Image Slots
========================================
Replace these two files with your real images:

  hero-bg.jpg   → Home page hero background
  about-bg.jpg  → About page hero background

Recommended: 1920×1080 px, JPEG or WebP, < 400 KB optimised.

Opacity is set in:
  src/app/[locale]/page.tsx  →  style={{ opacity: 0.22 }}
  src/app/[locale]/about/page.tsx  →  style={{ opacity: 0.18 }}

Gradient overlay is defined in src/app/globals.css under:
  .hero-image-overlay   (stronger — for bright photos)
  .hero-image-overlay-light  (softer — for dark photos)

The About page uses overlayVariant="normal" by default.
Change to overlayVariant="light" in about/page.tsx if your image is already dark.
