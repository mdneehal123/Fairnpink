// Sends a website order into the Order Desk inbox (server to server, protected by WEB_ORDER_KEY).
// Order Desk keeps one entry per ref, so sending the same order twice never makes a duplicate.
const deskUrl = () => (process.env.ORDERDESK_URL || 'https://www.skinday.shop').replace(/\/+$/, '');
const deskOn = () => Boolean(process.env.WEB_ORDER_KEY);

// c: customer() result; q: quote() result (total = amount actually charged / to collect).
async function pushToDesk({ ref, c, q, pay, paid, payId, courier, awb, note }) {
  if (!deskOn()) return { ok: false, error: 'WEB_ORDER_KEY not set' };
  const body = {
    ref, src: 'web', site: 'fairnpink.in', brand: 'fn', pay, paid: Boolean(paid), payId: payId || '',
    total: q.total, sub: q.sub, disc: q.disc, coupon: '', courier: courier || '', awb: awb || '', note: note || '',
    name: c.name, phone: c.phone, email: '', house: c.address, area: c.city, landmark: '', pin: c.pincode, city: c.city, state: c.state || '',
    items: [[q.deskId || '', q.name, 1, q.sub]]
  };
  try {
    const r = await fetch(deskUrl() + '/api/web-order', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-web-order-key': process.env.WEB_ORDER_KEY }, body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok ? { ok: true, id: j.id, duplicate: !!j.duplicate } : { ok: false, error: j.error || 'Order Desk HTTP ' + r.status };
  } catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
}

module.exports = { pushToDesk, deskOn };
