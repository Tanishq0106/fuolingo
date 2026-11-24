# Fuolingo implementation plan

## Product outcome

Fuolingo will remain a habit-first fitness SaaS, but the primary paid value will be the **Daily Coach**: a server-side AI assistant that uses the member's goal, streak, mission history, and weight trend to give practical daily guidance. Free members can preview the experience once per day; paid members receive a higher daily allowance. The existing streak, missions, weight tracking, badges, Supabase auth, and privacy controls remain intact.

## Implementation approach

- Keep the existing React/Vite client and Express production server.
- Add a dedicated `/coach` workspace in the existing single-page shell rather than introducing a router dependency.
- Keep Gemini credentials and Razorpay secrets server-only. The browser sends the Supabase access token to the API; the API verifies the user, reads the profile with the Supabase service-role client, applies plan limits, and calls Gemini.
- Persist plan state on `profiles` and daily AI usage in a dedicated Supabase table. Add an idempotent migration that is safe to run after the existing schema.
- Add Razorpay Standard Checkout order creation, signature verification, and webhook handling. If Razorpay is not configured yet, the product remains usable and the UI gives a clear setup message instead of failing silently.
- Use Cloudflare Pages for the primary free-tier deployment: static Vite assets plus Pages Functions for the AI and billing endpoints. Keep the Express server and Docker/Cloud Run assets as a secondary self-hosting path.
- Correct the existing schema's default policies so a user who runs only `schema.sql` does not accidentally enable unauthenticated access.

## Design direction

### Candidate movements

- **Neon performance studio** (0.07): high-contrast dark surfaces, electric green, violet highlights, and compact training telemetry.
- **Editorial wellness lab** (0.06): warm paper-like surfaces, calm serif headlines, and slower reflective interactions.
- **Midnight arcade coach** (0.08): playful scoreboards, saturated tokens, and game-like progression moments.

### Chosen movement: Neon performance studio

- **Core principles:** make progress legible at a glance; turn advice into a next action; keep the paid value visible but respectful; make health copy encouraging rather than medicalizing.
- **Color philosophy:** deep navy creates focus, electric green signals momentum and completion, and violet marks intelligence and premium guidance.
- **Layout paradigm:** a left-aligned command-center header with a large coach conversation canvas and a narrow upgrade rail; avoid a centered marketing grid inside the product.
- **Signature elements:** the green streak signal, translucent telemetry cards, and compact “next best action” chips.
- **Interaction philosophy:** every action should either reduce today's friction or clarify the next move; loading states feel like the coach is thinking, not like the app is stuck.
- **Animation:** use short opacity/translate transitions for messages and cards; respect `prefers-reduced-motion`; reserve glow and celebration for meaningful progress.
- **Typography system:** Plus Jakarta Sans for the interface, Inter for dense numeric metadata; oversized weight only for the primary coach promise and key streak numbers.
- **Brand essence:** Fuolingo is a daily habit coach for people who want fitness consistency without another overwhelming spreadsheet. Personality: energetic, grounded, protective.
- **Brand voice:** “Make today easier to win.” and “You do not need a perfect week; you need the next useful move.”
- **Wordmark & logo:** retain the lightning mark but use it as a compact “momentum spark” next to the wordmark rather than as a generic app icon.
- **Signature brand color:** electric Fuolingo green `#10E774`.

## Project structure

- `src/pages/Coach.jsx`: paid AI coach workspace, usage meter, suggestions, upgrade actions.
- `src/services/coach.js`: browser-side API client for AI and billing endpoints.
- `src/utils/plans.js`: plan labels, entitlements, and safe client display rules.
- `server/index.js`: Express API, Supabase identity/profile lookup, AI usage enforcement, Gemini call, Razorpay checkout/verification/webhook, and production static serving.
- `functions/`: Cloudflare Pages Functions adapter for the same AI and Razorpay flows.
- `supabase/003_revenue_ai.sql`: subscription fields, subscription records, and daily AI usage table with RLS.
- `public/manus-routes.json`: route manifest for the existing single-page route set.
- `wrangler.toml`, `deploy-cloudflare.ps1`: primary Cloudflare Pages deployment helpers. `Dockerfile`, `.dockerignore`, `cloudbuild.yaml`, and `deploy-cloud-run.ps1` remain as a secondary Google-compatible path.

## Configuration boundaries

The browser only receives the Supabase URL, publishable/anon key, and Razorpay Key ID required by Standard Checkout. `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` must be configured as server/Pages secrets. No secret is committed to source. Razorpay amounts are kept server-side so customers cannot alter plan prices in the browser.
