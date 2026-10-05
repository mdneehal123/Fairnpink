const crypto = require('crypto');
const { keys } = require('./_shared');

// Owner-only list of customers who are due a reorder reminder.
// Protected by the ADMIN_KEY environment variable. Returns names and phone numbers, so never open it to the public.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const admin = process.env.ADMIN_KEY || '';
  const given = String((req.headers && req.headers['x-admin-key']) || '');
  if (admin.length < 8) return res.status(503).json({ error: 'admin_key_not_set' });
  const a = crypto.createHash('sha256').update(admin).digest();
  const b = crypto.createHash('sha256').update(given).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'wrong_key' });
  const k = keys();
  if (!k) return res.status(503).json({ error: 'not_configured' });

  const q = req.query || {};
  const minDays = Math.max(0, Math.min(365, Number(q.from) || 22));
  const maxDays = Math.max(minDays, Math.min(365, Number(q.to) || 35));
  const now = Math.floor(Date.now() / 1000);
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  try {
    const out = [];
    for (let skip = 0; skip < 500; skip += 100) {
      const r = await fetch('https://api.razorpay.com/v1/orders?count=100&skip=' + skip + '&from=' + (now - maxDays * 86400) + '&to=' + (now - minDays * 86400), { headers: auth });
      const d = await r.json();
      if (!r.ok) return res.status(502).json({ error: 'razorpay_list_failed' });
      const items = d.items || [];
      items.forEach((o) => {
        const n = o.notes || {};
        if (o.status !== 'paid' || !/Fair N Pink/i.test(String(n.product || ''))) return;
        out.push({
          id: o.id, name: String(n.name || ''), phone: String(n.phone || '').replace(/\D/g, '').slice(-10),
          pack: String(n.pack || ''), city: String(n.city || ''), amount: Math.round(Number(o.amount) / 100),
          days: Math.floor((now - o.created_at) / 86400), date: new Date(o.created_at * 1000).toISOString().slice(0, 10)
        });
      });
      if (items.length < 100) break;
    }
    out.sort((x, y) => y.days - x.days);
    return res.status(200).json({ from: minDays, to: maxDays, customers: out });
  } catch (e) {
    return res.status(502).json({ error: 'lookup_failed' });
  }
};
