import { supabase } from './supabase.js';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'The Fuolingo service is temporarily unavailable.');
    error.code = payload.code;
    error.upgradeRequired = Boolean(payload.upgradeRequired);
    error.retryAfter = payload.retryAfter;
    throw error;
  }
  return payload;
}

export async function askCoach({ question, context = {}, isDemo = false }) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders())
  };
  const response = await fetch('/api/ai/coach', {
    method: 'POST',
    headers,
    body: JSON.stringify({ question, context, demo: isDemo })
  });
  return parseResponse(response);
}

export async function startCheckout({ plan, billing = 'monthly' }) {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeaders())
    },
    body: JSON.stringify({ plan, billing })
  });
  const payload = await parseResponse(response);
  await loadRazorpayScript();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: payload.keyId,
      amount: payload.amount,
      currency: payload.currency,
      name: 'Fuolingo',
      description: `${payload.plan === 'coach' ? 'Coach & Team' : 'Pro Coach'} — ${payload.billing}`,
      order_id: payload.orderId,
      prefill: { name: payload.name, email: payload.email },
      theme: { color: '#10E774' },
      handler: async (payment) => {
        try {
          const verifyResponse = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
            body: JSON.stringify(payment)
          });
          resolve(await parseResponse(verifyResponse));
        } catch (error) {
          reject(error);
        }
      }
    });
    checkout.on('payment.failed', (event) => reject(new Error(event.error?.description || 'Payment was not completed.')));
    checkout.open();
  });
}

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Razorpay Checkout could not load. Check your network connection and try again.'));
    document.head.appendChild(script);
  });
}
