# Deployment research used for Fuolingo

Cloudflare Pages official documentation says Pages supports direct upload and Pages Functions for server-side code without maintaining a dedicated server. Pages static asset requests are free and unlimited, while Pages Functions count toward the Workers quota. The official Workers limits page lists 100,000 requests per day on the Workers Free plan.

Razorpay's official Standard Checkout documentation requires creating an order on the server, passing the order ID to Checkout, verifying the returned payment signature on the server, and using webhooks for reliable payment confirmation. The implementation follows those requirements and uses server-only Razorpay secrets.

References:

- https://developers.cloudflare.com/pages/
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://razorpay.com/docs/developer-tools/integrations/standard-checkout
- https://razorpay.com/docs/us/payments/payment-gateway/web-integration/standard/best-practices
