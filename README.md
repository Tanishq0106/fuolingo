# Fuolingo — The Duolingo for Fitness | Full-Stack SaaS

Fuolingo is a habit-first fitness SaaS built with **React**, **Vite**, **Tailwind CSS**, **Express**, and **Supabase**. The paid product is the **Daily Coach**: a server-side Gemini assistant that turns a member's real streak and progress into one practical next action.

## Local development

```bash
npm install
npm run dev
```

This starts the Express API on port 3001 and the Vite client on port 5173. Vite proxies `/api` to Express. For a production-style local run:

```bash
npm run build
npm start
```

Copy `.env.example` to `.env` and add the existing Supabase values. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser build values. Keep `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and Razorpay secrets server-only.

## Supabase setup

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Run `supabase/003_revenue_ai.sql`.
4. Configure Supabase Auth email settings and the deployed app URL/redirect URL.

The base schema uses `auth.uid()` ownership policies. The new migration adds subscription state, a subscription record, and daily AI usage tracking. The browser can read its own subscription/usage rows, while server-side billing and usage updates use the service-role key.

## Monetization setup

Create Razorpay Test Mode keys first, then create the webhook endpoint as:

```text
https://YOUR_PAGES_DOMAIN/api/billing/webhook
```

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in local development or as Cloudflare Pages secrets. The browser creates an order through the API, opens Razorpay Standard Checkout, sends the returned payment fields back to the API for HMAC-SHA256 verification, and then the webhook confirms payment. The webhook updates `profiles.subscription_plan`, `profiles.subscription_status`, and `profiles.plan_expires_at`, which controls AI access. If Razorpay is not configured, the app returns a clear setup response and does not attempt a fake checkout.

## Gemini setup

Create a Google Gemini API key and set `GEMINI_API_KEY`. The key is only read by Express and is never bundled into the browser. `GEMINI_MODEL` defaults to `gemini-2.0-flash` and can be changed without editing source.

## Primary deployment: Cloudflare Pages + Functions

Cloudflare Pages is the preferred free-tier target for Fuolingo. Static asset requests are free and unlimited; Pages Functions use the Workers Free quota. Deploy with the included helper:

1. Create a Cloudflare Pages project named `fuolingo`.
2. Add the Pages variables `SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `GEMINI_MODEL`.
3. Add the Pages secrets `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
4. Submit the deployment from PowerShell:

```powershell
.\deploy-cloudflare.ps1 -ProjectName 'fuolingo'
```

The Pages Functions serve `/api/health`, `/api/ai/coach`, `/api/billing/checkout`, `/api/billing/verify`, and `/api/billing/webhook`. Static SPA assets are served by Pages. Cloudflare's Workers Free plan currently documents a 100,000-request daily limit for Functions; monitor usage before public launch.

The existing `Dockerfile`, `cloudbuild.yaml`, and `deploy-cloud-run.ps1` remain available as a secondary Google Cloud Run deployment path if the project later needs a Node server instead of Pages Functions.

## Verification

```bash
npm run build
node server/testAcceptance.js
```

The app also exposes `GET /api/health`, which reports service status and whether optional Gemini/Razorpay configuration is present without exposing secrets.

## SEO, analytics, and public pages

The project now includes `robots.txt`, `sitemap.xml`, a custom `404.html`, canonical and Open Graph metadata, an SVG social preview image, Organization/WebSite/Breadcrumb structured data, clean public `/contact` and `/privacy` pages, and canonical redirect rules. Replace `https://fuolingo.pages.dev` in the public SEO files with the final custom domain before launch.

For Google Analytics 4, create a Web data stream, copy its Measurement ID into `VITE_GA_MEASUREMENT_ID`, and redeploy. Analytics is disabled when the variable is blank. For Search Console, add the property for the final domain, choose HTML-tag verification, and place the supplied token in `VITE_GSC_VERIFICATION`; the app will emit the verification meta tag. Submit `/sitemap.xml` after verification.

The Contact page posts to `/api/contact`, validates input server-side, and returns a user-visible success or error state. On Cloudflare Pages, set `CONTACT_WEBHOOK_URL` to a private webhook that receives the validated message. Without that optional variable, the endpoint still accepts and logs messages in the server runtime; connect it to an email/helpdesk provider before public launch so messages reach your team.

## Health disclaimer

Fuolingo is an educational habit-support product, not a medical diagnosis, treatment, or individualized prescription service. Members should consult qualified professionals for medical, nutrition, or exercise decisions.
