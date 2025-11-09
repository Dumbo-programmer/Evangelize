# Evangelize 2025 - Static redesign scaffold

This repository contains a small static redesign scaffold for the site described by the user: a 3-page site (Landing, Evangelize details, Gallery) with an animated navbar, logo fade-in, countdown timer, music lottery, gallery lightbox, and a dark theme with a theme-toggle.

Files added
- `index.html` — Landing page with animated logo and countdown.
- `evangelize.html` — Details page with background music lottery (YouTube embeds).
- `gallery.html` — Simple image grid with lightbox.
- `css/styles.css` — Styles and simple animations.
- `js/main.js` — Countdown logic, music lottery, gallery lightbox, nav highlight.
- `assets/logo.svg` — Placeholder logo (replace with final artwork).

How to run
1. Open the folder in your file explorer.
2. Double-click `index.html` (or open it in your browser). Since this is a static site, no server is required for basic testing.

Notes & assumptions
- I assumed an event date — currently set to `2025-12-25T00:00:00` in `js/main.js`. Change `EVENT_DATE` to the actual event time.
 - Event date set to `2025-11-21T16:00:00` (gates open 4:00 pm) in `js/main.js`. Change if needed.
- Music lottery uses the 4 YouTube IDs you provided. The page injects an embed URL into an iframe. Autoplay may be blocked by browsers; clicking "Play Random" will try to start playback.
- Images in the gallery use Unsplash random images as placeholders. Replace `href`/`src` in `gallery.html` with your own images.

- Default theme: the site now defaults to a dark theme. Use the moon/sun button in the header to toggle between dark and light. The theme selection is saved in `localStorage`.

- Registration & contacts: the site scaffold includes the registration instructions and contact numbers from the Canva site. Payment numbers shown in `evangelize.html`:
	- bKash / Nagad: +8801687671147
	- Alternate: +8801621070756

- Audio behavior: The Evangelize page now plays audio-only background music automatically with no visible player or controls. It uses the YouTube IFrame API and falls back to a hidden iframe if needed. Note that browser autoplay policies may prevent audible autoplay until the user interacts with the page; consider a muted-autoplay fallback or a small "Enable audio" CTA if you need guaranteed start.

Next steps / improvements
- Replace the placeholder logo with the real high-resolution SVG.
- (Optional) Use the YouTube IFrame API for improved playback control and detection of end-of-video events.
- Add accessibility improvements, translations, deployment instructions (GitHub Pages, Netlify), and real contact details.

If you want, I can:
- change the countdown date to the exact event date you provide.
- swap the YouTube embeds for hosted audio files.
- create a deployable package (Netlify/GitHub Pages) and a simple CI deploy workflow.
