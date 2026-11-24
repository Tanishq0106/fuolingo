export function registerContactRoute(app, { corsHeaders = {} } = {}) {
  app.post('/api/contact', (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim(); const email = String(body.email || '').trim(); const message = String(body.message || '').trim();
    if (body.website) return res.json({ success: true });
    if (name.length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 3000) return res.status(400).json({ error: 'Please provide a valid name, email, and message.' });
    console.log(JSON.stringify({ type: 'fuolingo_contact', topic: body.topic || 'support', name, email, message, received_at: new Date().toISOString() }));
    res.json({ success: true });
  });
}
