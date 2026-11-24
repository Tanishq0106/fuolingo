# Fuolingo delivery checklist

## Deployable product shell and data safety

- [ ] The existing React/Vite app continues to run with Supabase auth, missions, streaks, weight logs, badges, and privacy export/delete flows.
- [ ] The production server serves the built frontend and API from one process and honors the platform `PORT` value used by Google Cloud Run.
- [ ] Supabase RLS defaults to `auth.uid()` ownership when the base schema is run, with the revenue/AI migration adding equivalent ownership rules for new records.
- [ ] Secret values remain server-only except for the Supabase browser publishable/anon key that is intentionally required by Supabase client auth.

## Daily AI Coach and paid value

- [ ] Authenticated members can open a dedicated Coach workspace from the main navigation.
- [ ] The Coach workspace sends questions to a server-side AI endpoint that uses the member's goal, current streak, recent mission activity, and weight progress as context.
- [ ] Free members receive a one-message daily preview, while active/trialing paid plans receive plan-specific daily limits enforced on the server.
- [ ] The Coach workspace shows the current plan, remaining daily guidance, suggested prompts, loading/error states, a safety disclaimer, and a clear upgrade path.
- [ ] Demo mode remains usable with a safe local preview response and does not pretend that a payment was completed.

## Revenue flow

- [ ] Paid plan CTAs create Razorpay Orders when Razorpay keys are configured and open Standard Checkout in the browser.
- [ ] The server verifies the Razorpay HMAC-SHA256 payment signature before granting paid AI access.
- [ ] A signed Razorpay webhook updates the Supabase subscription record and the member's paid plan/status so AI access follows confirmed payment.
- [ ] When Razorpay is not configured, the app returns a clear setup response instead of a broken redirect or unhandled exception.

## Google deployment

- [ ] The repository includes a Wrangler configuration, Pages Functions routes, and a PowerShell deploy helper for the Cloudflare free-tier primary deployment.
- [ ] The repository includes environment-variable documentation for Supabase, Gemini, Razorpay, and the public app URL.
- [ ] The SPA route manifest includes the landing, dashboard, workouts, log, coach, and profile pages.

## Validation evidence

- [ ] `npm run build` completes successfully.
- [ ] The existing acceptance suite completes successfully.
- [ ] The production server health endpoint reports an OK status without exposing secrets.
