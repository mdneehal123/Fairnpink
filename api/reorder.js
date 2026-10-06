const crypto = require('crypto');
const { keys, PACKS, ADVANCE } = require('./_shared');

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
  if (q.kind === 'abandoned') return abandoned(k, res);
  if (q.kind === 'orders') return orders(k, res, Number(q.days) === 7 ? 7 : 1);
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

// Customers who filled in the order form and opened the payment window in the last 3 days but did not pay.
// Anyone who went on to pay (same phone number) is left out.
async function abandoned(k, res) {
  const now = Math.floor(Date.now() / 1000);
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  try {
    const all = [];
    for (let skip = 0; skip < 500; skip += 100) {
      const r = await fetch('https://api.razorpay.com/v1/orders?count=100&skip=' + skip + '&from=' + (now - 3 * 86400), { headers: auth });
      const d = await r.json();
      if (!r.ok) return res.status(502).json({ error: 'razorpay_list_failed' });
      const items = d.items || [];
      items.forEach((o) => { if (/Fair N Pink/i.test(String((o.notes || {}).product || ''))) all.push(o); });
      if (items.length < 100) break;
    }
    const phone = (o) => String((o.notes || {}).phone || '').replace(/\D/g, '').slice(-10);
    const paid = new Set(all.filter((o) => o.status === 'paid').map(phone));
    const seen = new Set();
    const out = [];
    all.sort((a, b) => b.created_at - a.created_at).forEach((o) => {
      const p = phone(o);
      if (o.status === 'paid' || p.length !== 10 || paid.has(p) || seen.has(p)) return;
      seen.add(p);
      const n = o.notes || {};
      out.push({ id: o.id, name: String(n.name || ''), phone: p, pack: String(n.pack || ''), city: String(n.city || ''),
        amount: Math.round(Number(o.amount) / 100), cod: n.mode === 'advance', hours: Math.floor((now - o.created_at) / 3600) });
    });
    return res.status(200).json({ kind: 'abandoned', customers: out });
  } catch (e) {
    return res.status(502).json({ error: 'lookup_failed' });
  }
}

// Paid orders for today or the last 7 days (Indian time), newest first, with totals.
async function orders(k, res, days) {
  const IST = 5.5 * 3600;
  const now = Math.floor(Date.now() / 1000);
  const todayStart = Math.floor((now + IST) / 86400) * 86400 - IST;
  const from = todayStart - (days - 1) * 86400;
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  try {
    const out = [];
    for (let skip = 0; skip < 1000; skip += 100) {
      const r = await fetch('https://api.razorpay.com/v1/orders?count=100&skip=' + skip + '&from=' + from, { headers: auth });
      const d = await r.json();
      if (!r.ok) return res.status(502).json({ error: 'razorpay_list_failed' });
      const items = d.items || [];
      items.forEach((o) => {
        const n = o.notes || {};
        if (o.status !== 'paid' || !/Fair N Pink/i.test(String(n.product || ''))) return;
        const cod = n.mode === 'advance';
        const pack = PACKS[Number(String(n.pack || '').replace(/\D/g, ''))];
        const t = new Date((o.created_at + IST) * 1000);
        out.push({
          id: o.id, at: o.created_at, name: String(n.name || ''), phone: String(n.phone || '').replace(/\D/g, '').slice(-10),
          pack: String(n.pack || ''), city: String(n.city || ''), pincode: String(n.pincode || ''), cod,
          paid: Math.round(Number(o.amount) / 100), collect: cod && pack ? pack.price - ADVANCE : 0,
          today: o.created_at >= todayStart,
          when: t.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][t.getUTCMonth()] + ', ' +
            ((t.getUTCHours() + 11) % 12 + 1) + ':' + String(t.getUTCMinutes()).padStart(2, '0') + (t.getUTCHours() < 12 ? ' am' : ' pm')
        });
      });
      if (items.length < 100) break;
    }
    out.sort((x, y) => y.at - x.at);
    const sum = (f) => out.reduce((a, o) => a + f(o), 0);
    return res.status(200).json({ kind: 'orders', days, orders: out, totals: {
      count: out.length, prepaid: out.filter((o) => !o.cod).length, cod: out.filter((o) => o.cod).length,
      received: sum((o) => o.paid), to_collect: sum((o) => o.collect) } });
  } catch (e) {
    return res.status(502).json({ error: 'lookup_failed' });
  }
}
