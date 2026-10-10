#!/usr/bin/env python3
"""Builds the Fair N Pink static site into the repository root.

Run from the repository root:  python3 _build/build.py
Edit the copy in this file, re-run, commit. Product facts live in the block
below so the site can be kept identical to what is printed on the pack.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, '_build')
SITE = 'https://fairnpink.in'
TODAY = '2026-10-05'

# ---- Product facts: keep these identical to the printed pack ----
WA = '919980881230'
WA_SHOW = '+91 99808 81230'
IG = 'https://www.instagram.com/fairnpinkprofessional/'
NET = '10 g'
OWNER = 'Beauty Mart Pvt Ltd'
ADDR = 'Azad Nagar 4th Cross, near Anfa Park, Bhatkal, Uttara Kannada, Karnataka 581320, India'
ACTIVES = [
    ('L-Glutathione', 'An antioxidant used in creams made for brighter-looking skin.'),
    ('Niacinamide', 'Vitamin B3. Helps skin look smoother and more even.'),
    ('Alpha arbutin', 'Used to help reduce the look of dark spots and uneven tone.'),
]

# The official WhatsApp glyph, used unaltered from the WhatsApp Brand Resource Center pack supplied by the owner.
WA_GLYPH = '<img class="wa-glyph" src="/assets/whatsapp-glyph-green.svg" alt="" width="%d" height="%d">'
CHAT_SVG = WA_GLYPH % (52, 52)

NAV = [('/', 'Shop'), ('/ingredients/', 'Ingredients'), ('/how-to-use/', 'How to use'),
       ('/about/', 'Our story'), ('/journal/', 'Journal'), ('/track/', 'Track order'), ('/faq/', 'Questions'), ('/contact/', 'Contact')]
FOOT = [('/', 'Shop the cream'), ('/ingredients/', 'Ingredients'), ('/how-to-use/', 'How to use'),
        ('/about/', 'Our story'), ('/journal/', 'Journal'), ('/original/', 'Check your jar'), ('/faq/', 'Questions'),
        ('/track/', 'Track order'), ('/contact/', 'Contact'), ('/shipping-policy/', 'Shipping'), ('/refund-policy/', 'Returns and refunds'),
        ('/privacy-policy/', 'Privacy'), ('/terms/', 'Terms')]


def wa_link(text):
    from urllib.parse import quote
    return 'https://wa.me/%s?text=%s' % (WA, quote(text))


def page(path, title, desc, body, schema=None, home=False, crumbs=None, index=True, js='', og=None, preimg='pack-1.webp'):
    url = SITE + path
    nav = ''.join('<a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if h == path else '', t) for h, t in NAV)
    foot = ''.join('<a href="%s">%s</a>' % (h, t) for h, t in FOOT)
    graph = [{
        '@type': 'Organization', '@id': SITE + '/#org', 'name': 'Fair N Pink', 'url': SITE + '/',
        'logo': SITE + '/assets/icon.svg', 'sameAs': [IG], 'legalName': OWNER,
        'address': {'@type': 'PostalAddress', 'streetAddress': 'Azad Nagar 4th Cross, near Anfa Park', 'addressLocality': 'Bhatkal', 'addressRegion': 'Karnataka', 'postalCode': '581320', 'addressCountry': 'IN'},
        'contactPoint': {'@type': 'ContactPoint', 'telephone': '+' + WA, 'contactType': 'customer service', 'areaServed': 'IN'}
    }, {
        '@type': 'WebSite', '@id': SITE + '/#site', 'url': SITE + '/', 'name': 'Fair N Pink', 'publisher': {'@id': SITE + '/#org'}
    }]
    if crumbs:
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': crumbs, 'item': url}]})
    if schema:
        graph += schema
    ld = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False)
    if home:
        bar = '<div class="bar"><div><b id="bar-total">₹999</b><span id="bar-qty">Pack of 1 · Fair N Pink</span></div><button type="button" class="btn" id="buy-bar">Buy now</button></div>'
        script = '<script src="/assets/store.js" defer></script>'
    else:
        bar = '<div class="bar"><div><b>From ₹999</b><span>Advance Radiance Cream · %s</span></div><a class="btn" href="/#buy">Shop now</a></div>' % NET
        script = '<script src="/assets/%s" defer></script>' % js if js else ''
    html = '''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-site-verification" content="TFbjFZw5dygwLLIfSzMkKCKl0iaAG4a8xLqHDha4gwM">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
%(robots)s<link rel="canonical" href="%(url)s">
<meta name="theme-color" content="#FAF7F5">
<meta property="og:type" content="%(ogtype)s">
<meta property="og:site_name" content="Fair N Pink">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:url" content="%(url)s">
<meta property="og:image" content="%(site)s/assets/%(ogimg)s">
%(ogextra)s<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
%(preload)s<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="/assets/site.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18495856180"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18495856180');</script>
%(pixel)s<script type="application/ld+json">%(ld)s</script>
</head>
<body>
%(pixelimg)s<a class="skip" href="#main">Skip to content</a>
<div class="strip">Free shipping on every order · Dispatched within 24 hours</div>
<div class="wrap">
  <header class="head">
    <a class="brand" href="/">Fair N Pink</a>
    <nav class="nav" aria-label="Main">%(nav)s</nav>
  </header>
  <main id="main">
%(body)s
  </main>
  <footer>
    <nav class="foot-nav" aria-label="Footer">%(foot)s</nav>
    <p>WhatsApp: <a href="https://wa.me/%(wa)s">%(wa_show)s</a> · Instagram: <a href="%(ig)s" target="_blank" rel="noopener">@fairnpinkprofessional</a></p>
    <div class="accept" aria-label="Payment methods we accept"><span class="accept-h">We accept</span><span>UPI</span><span>Debit cards</span><span>Credit cards</span><span>Netbanking</span><span>Cash on Delivery</span></div>
    <p>Online payments are processed securely by Razorpay.</p>
    <p>Fair N Pink is a brand owned by %(owner)s, %(addr)s.</p>
    <p>© Fair N Pink. Results vary from person to person. This cream is a cosmetic and is not meant to treat any medical condition.</p>
  </footer>
</div>
<a class="chat" id="wa-chat" href="%(chat)s" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">%(svg)s<span>WhatsApp us</span></a>
%(bar)s
%(script)s
</body>
</html>
''' % dict(title=title, desc=desc, url=url, site=SITE, ld=ld, nav=nav, foot=foot, body=body, wa=WA, wa_show=WA_SHOW,
           ig=IG, svg=CHAT_SVG, owner=OWNER, addr=ADDR, bar=bar, script=script, ogtype='product' if home else 'website',
           robots='' if index else '<meta name="robots" content="noindex">\n',
           pixel=(PIXEL_HEAD if index else ''), pixelimg=(PIXEL_IMG if index else ''),
           ogextra=(og[0] if og else OG_PRODUCT if home else ''), ogimg=(og[1] if og else 'product-1080.jpg' if home else 'og.jpg'),
           preload='<link rel="preload" as="image" href="/assets/%s" fetchpriority="high">\n' % preimg if home else '',
           chat=wa_link('Hello, I have a question about Fair N Pink Advance Radiance Cream.'))
    out = os.path.join(ROOT, path.strip('/'), 'index.html') if path != '/404' else os.path.join(ROOT, '404.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(html)


PIXEL_IDS = ['904249834967161', '1959679618035331']  # Meta Pixels; every event goes to both. Left off the owner-only and not-found pages.
PIXEL_HEAD = """<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');%sfbq('track','PageView');</script>
""" % ''.join("fbq('init','%s');" % i for i in PIXEL_IDS)
PIXEL_IMG = ''.join('<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=%s&amp;ev=PageView&amp;noscript=1"></noscript>\n' % i for i in PIXEL_IDS)


# Product tags read by Instagram / Facebook shopping links and other link previews.
OG_PRODUCT = '''<meta property="product:brand" content="Fair N Pink">
<meta property="product:availability" content="in stock">
<meta property="product:condition" content="new">
<meta property="product:price:amount" content="999">
<meta property="product:price:currency" content="INR">
<meta property="product:retailer_item_id" content="FNP-ARC-P1">
<meta property="og:image:width" content="1080">
<meta property="og:image:height" content="1080">
<meta property="og:price:amount" content="999">
<meta property="og:price:currency" content="INR">
'''
PRODUCT_PATH = '/product/fair-n-pink-advance-radiance-cream/'


def sec(eyebrow, h, lead='', inner='', tag='h2', id=''):
    return '''    <section%s>
      <div class="sec-h"><span class="eyebrow">%s</span><%s>%s</%s>%s</div>
%s
    </section>
''' % (' id="%s"' % id if id else '', eyebrow, tag, h, tag, '<p>%s</p>' % lead if lead else '', inner)


def top(eyebrow, h1, lead):
    return '''    <div class="page-top">
      <span class="eyebrow">%s</span>
      <h1>%s</h1>
      <p class="sub">%s</p>
    </div>
''' % (eyebrow, h1, lead)


def faq_html(items, first_open=True):
    out = []
    for i, (q, a) in enumerate(items):
        out.append('      <details%s><summary>%s</summary><p>%s</p></details>' % (' open' if i == 0 and first_open else '', q, a))
    return '\n'.join(out)


def strip_tags(t):
    return re.sub(r'<[^>]+>', '', t)


CTA = '''    <section>
      <div class="cta">
        <div><h2>Advance Radiance Cream</h2><p>From ₹999 for a %s jar. Free shipping on every order. Cash on Delivery is available with a refundable ₹99 advance.</p></div>
        <a class="btn" href="/#buy">Shop the cream</a>
      </div>
    </section>
''' % NET

ACT_GRID = '      <div class="ing">' + ''.join('<div class="hero-ing"><h3>%s</h3><p>%s</p></div>' % a for a in ACTIVES) + '</div>'

RITUAL = '''      <div class="use">
        <div><h3>Morning</h3><ol><li>Wash your face and pat it dry.</li><li>Take a pea-sized amount of cream.</li><li>Spread a thin layer over face and neck.</li><li>Finish with sunscreen before you go out.</li></ol></div>
        <div><h3>Night</h3><ol><li>Wash off the day's dirt, sweat and sunscreen.</li><li>Take a pea-sized amount of cream.</li><li>Massage gently until it is absorbed.</li><li>Leave it on overnight.</li></ol></div>
      </div>'''

NOTE = '''      <div class="note">
        <div><h3>Patch test first</h3><p>Try a small amount on your inner arm for 24 hours before using it on your face.</p></div>
        <div><h3>Use sunscreen daily</h3><p>Sun exposure is the main cause of dullness and dark patches. No cream can keep up without it.</p></div>
        <div><h3>Give it time</h3><p>Skin changes slowly and results differ from person to person. Use it consistently for a few weeks.</p></div>
      </div>'''

WEEKS = '''      <ol class="weeks">
        <li><span class="wk">Week 1</span><h3>Settling in</h3><p>Use it morning and night after a patch test. Skin usually feels softer and better moisturised.</p></li>
        <li><span class="wk">Week 2</span><h3>Building the habit</h3><p>Keep to twice a day with sunscreen every morning. Skin may start to look fresher.</p></li>
        <li><span class="wk">Week 4</span><h3>First real check</h3><p>Compare your skin with a photo from day one, in the same light.</p></li>
        <li><span class="wk">Week 8</span><h3>Dark spots take longest</h3><p>Marks fade slowly and some may not change. No cream changes your natural skin tone.</p></li>
      </ol>'''

PRICE_TBL = '''      <div class="tbl"><table>
        <thead><tr><th>Pack</th><th>MRP (printed)</th><th>Price</th><th>Per jar</th><th>Paid online</th></tr></thead>
        <tbody>
          <tr><td>Pack of 1</td><td>₹3,000</td><td>₹999</td><td>₹999</td><td>₹899</td></tr>
          <tr><td>Pack of 2</td><td>₹6,000</td><td>₹1,899</td><td>₹950</td><td>₹1,749</td></tr>
          <tr><td>Pack of 3</td><td>₹9,000</td><td>₹2,699</td><td>₹900</td><td>₹2,449</td></tr>
        </tbody>
      </table></div>'''

exec(open(os.path.join(B, 'journal_data.py')).read())

# Reels from the brand's own Instagram account, shown on the home page.
SHOW_REELS = False  # Instagram answers 'link may be broken' for these reels when embedded, so the section stays off
REELS = ['DPD4bkqks99', 'DQ9ZhewEtNJ', 'DLmVkaRxTiT', 'DHeKHHyMqgn', 'DNdB7wniENX', 'DQ_wpetjXKN']
REELS_HTML = '''    <section id="videos">
      <div class="film" id="reels" data-reels="%s">
        <div class="film-copy">
          <span class="eyebrow">On Instagram</span>
          <h2>See the cream in use</h2>
          <p>Short films from our Instagram, @fairnpinkprofessional. Tap a film to play it.</p>
          <div class="film-nav">
            <button type="button" id="reel-prev" aria-label="Previous film">&#8592;</button>
            <span id="reel-count" aria-live="polite">1 / %d</span>
            <button type="button" id="reel-next" aria-label="Next film">&#8594;</button>
          </div>
          <a class="film-follow" href="%s" target="_blank" rel="noopener">Follow us on Instagram</a>
        </div>
        <div class="film-stage"><div class="film-slot" id="reel-slot"><a class="film-fallback" href="https://www.instagram.com/reel/%s/" target="_blank" rel="noopener">Watch on Instagram</a></div></div>
      </div>
    </section>
''' % (','.join(REELS), len(REELS), IG, REELS[0])

# Picture cards on the home page: a real product photo, a headline label and one small fact card each.
LOOKS = [
    ('jar-and-box-m.webp', 'Fair N Pink jar beside its box on satin', ['Your daily', 'radiance essential'], 'What is inside', 'Glutathione, niacinamide and alpha arbutin in one cream.'),
    ('pack-1.webp', 'Fair N Pink jar in front of a swatch of pink cream', ['A soft', 'pink cream'], 'How to use', 'A pea-sized amount, morning and night. Sunscreen in the morning.'),
    ('pack-2.webp', 'Two jars of Fair N Pink Advance Radiance Cream', ['Better', 'in pairs'], 'Pack of 2', '₹1,749 when you pay online. ₹875 a jar, with free shipping.'),
    ('pack-3.webp', 'Three jars of Fair N Pink Advance Radiance Cream', ['Stock up', 'and save'], 'Pack of 3', '₹2,449 when you pay online. ₹816 a jar, our best value.'),
]
FILMS = [('film-1', 'The cream on film', 'A short film of the jar, the cream and how it sits on skin.'),
         ('film-2', 'From jar to skin', 'Open the jar, take a little, and smooth it over the face.'),
         ('film-3', 'A pea-sized amount', 'The jar, the cream inside, and a small amount applied to the cheek.'),
         ('film-4', 'The texture', 'A close look at the soft pink cream in the jar.')]
FILMS_WITH_SOUND = ('film-1',)  # film-2 is a silent cut
FILM_CARD = '''        <figure class="filmcard">
          <div class="filmwrap"><video class="filmv" src="/assets/%s.mp4" poster="/assets/%s.webp" muted loop playsinline preload="none" width="720" height="1280" aria-label="%s"></video>%s</div>
          <figcaption><b>%s</b><span>Illustrative film made for the brand</span></figcaption>
        </figure>'''
FILMS_HTML = sec('On film', 'See it in motion', 'Four short films. They start without sound as you scroll.',
    '      <div class="films">\n' + '\n'.join(FILM_CARD % (f, f, d, '<button type="button" class="filmsound" aria-pressed="false">Tap for sound</button>' if f in FILMS_WITH_SOUND else '', t) for f, t, d in FILMS) + '\n      </div>', id='films')

LOOKS_HTML = '''    <section id="looks">
      <div class="sec-h"><span class="eyebrow">A closer look</span><h2>The cream, up close</h2></div>
      <div class="looks" tabindex="0" aria-label="Product pictures">''' + ''.join(
    '<article class="look"><div class="look-pic"><img src="/assets/%s" alt="%s" width="720" height="720" loading="lazy">'
    '<h3 class="look-h">%s</h3></div><div class="look-card"><b>%s</b><p>%s</p></div></article>'
    % (img, alt, ''.join('<span>%s</span>' % t for t in head), k, v) for img, alt, head, k, v in LOOKS) + '''</div>
    </section>
'''

# Ingredient spotlight cards for the home page. The small drawings are simple original line motifs.
SPOTS = [
    ('01', 'The antioxidant', 'L-Glutathione', 'Made of three amino acids. Used in creams made for brighter-looking skin.', 'blush',
     '<circle cx="34" cy="62" r="15"/><circle cx="86" cy="62" r="15"/><circle cx="60" cy="26" r="15"/><path d="M45 52l8-14M75 52l-8-14M49 62h22"/>'),
    ('02', 'Vitamin B3', 'Niacinamide', 'One of the most widely used skincare ingredients. Helps skin look smoother and more even.', 'sand',
     '<path d="M60 14c17 21 26 35 26 47a26 26 0 0 1-52 0c0-12 9-26 26-47Z"/><path d="M47 62a13 13 0 0 0 10 12"/>'),
    ('03', 'For uneven tone', 'Alpha arbutin', 'Used to help reduce the look of dark spots and uneven tone, gradually.', 'mist',
     '<circle cx="22" cy="46" r="12" fill="currentColor" fill-opacity=".55"/><circle cx="54" cy="46" r="12" fill="currentColor" fill-opacity=".3"/><circle cx="86" cy="46" r="12" fill="currentColor" fill-opacity=".12"/><path d="M14 76h80M86 70l8 6-8 6"/>'),
]
SPOTS_HTML = '      <div class="spots" tabindex="0" aria-label="Key ingredients">' + ''.join(
    '<article class="spot spot-%s"><span class="spot-n">%s</span>'
    '<svg viewBox="0 0 120 92" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%s</svg>'
    '<div><span class="spot-k">%s</span><h3>%s</h3><p>%s</p></div></article>' % (tone, n, art, k, name, text)
    for n, k, name, text, tone, art in SPOTS) + '</div>'

# Moving ribbon of short phrases, and a row of four assurance tiles, both on the home page.
RIBBON_WORDS = ['Glutathione', 'Niacinamide', 'Alpha arbutin', NET + ' jar', 'Morning and night', 'Free shipping', 'Cash on Delivery', 'Dispatched in 24 hours']
_run = ''.join('<span>%s</span>' % w for w in RIBBON_WORDS)
RIBBON_HTML = '    <div class="ribbon" aria-hidden="true"><div class="ribbon-track">%s%s</div></div>\n' % (_run, _run)
_ico = '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">%s</svg>'
BADGES = [
    ('<circle cx="24" cy="24" r="17"/><path d="M24 14v10l7 4"/>', 'Ships in 24 hours', 'Except Sundays and national holidays.'),
    ('<rect x="6" y="13" width="36" height="22" rx="3"/><circle cx="24" cy="24" r="5"/><path d="M12 19v10M36 19v10"/>', 'Cash on Delivery', 'Pay ₹99 now and the rest when it arrives.'),
    ('<rect x="10" y="21" width="28" height="19" rx="3"/><path d="M16 21v-5a8 8 0 0 1 16 0v5M24 28v5"/>', 'Secure payment', 'UPI, cards and netbanking through Razorpay.'),
    ('<path d="M24 6l15 6v10c0 10-6 17-15 20-9-3-15-10-15-20V12l15-6Z"/><path d="M17 24l5 5 9-10"/>', 'Sealed, from the brand', 'Packed and sent by Fair N Pink.'),
]
BADGES_HTML = '    <section>\n      <ul class="badges">' + ''.join(
    '<li>%s<b>%s</b><span>%s</span></li>' % (_ico % art, t, d) for art, t, d in BADGES) + '</ul>\n    </section>\n'

# ---------------- Home ----------------
hero = open(os.path.join(B, 'hero.html')).read()


def swap(text, old, new, count=1):
    assert text.count(old) == count, (old, text.count(old))
    return text.replace(old, new)


hero = swap(hero, 'A face cream with glutathione, niacinamide, alpha arbutin and kojic acid, in a silver jar with a soft pink texture.',
            'A face cream with glutathione, niacinamide and alpha arbutin, in a silver jar with a soft pink texture.')
hero = swap(hero, '<span>Alpha arbutin</span><span>Kojic acid</span>', '<span>Alpha arbutin</span><span>%s jar</span>' % NET)
hero = swap(hero, '<div class="buy">', '<div class="buy" id="buy">')
hero = swap(hero, 'href="#policies"', 'href="/privacy-policy/"')
hero = swap(hero, '<img id="media-photo" src="/assets/pack-1.webp"', '<img id="media-photo" src="/assets/pack-1.webp" fetchpriority="high"')

HOME_FAQ = [
    ('What is the price of Fair N Pink Advance Radiance Cream?', 'The MRP printed on the box is ₹3,000 for one %s jar. On this store one jar is ₹999, a pack of 2 is ₹1,899 and a pack of 3 is ₹2,699. You save a further ₹100, ₹150 or ₹250 when you pay online.' % NET),
    ('What size is the Fair N Pink cream jar?', 'Each jar holds %s of cream. The net weight is printed on the box.' % NET),
    ('How do I use it?', 'Apply a pea-sized amount to clean skin, morning and night, with sunscreen in the morning.'),
    ('How long does it take to show results?', 'It differs from person to person. Use it for a few weeks before you judge it.'),
    ('Can I buy Fair N Pink cream online with Cash on Delivery?', 'Yes. Choose Cash on Delivery, pay a ₹99 advance online to confirm, and pay the rest in cash when the parcel arrives. Or pay in full online and save up to ₹250.'),
    ('When will my order arrive?', 'Orders are dispatched within 24 hours, except on Sundays and national holidays, and delivered in 3 to 7 working days.'),
]

home = hero + RIBBON_HTML + BADGES_HTML + '''
    <section>
      <p class="creed">A quiet daily ritual for skin that looks luminous, morning and night.</p>
      <span class="creed-by">Fair N Pink</span>
    </section>

''' + sec('The cream', 'Fair N Pink Advance Radiance Cream', '', '''      <div class="about">
        <div>
          <p>Fair N Pink Advance Radiance Cream, often called Fair N Pink glutathione cream, is a face cream with glutathione, niacinamide and alpha arbutin in a moisturising base. It comes in a %s silver jar with a clear faceted lid, and the cream itself is a soft pink.</p>
          <p>It is meant for daily use. Apply a small amount after washing your face in the morning, under sunscreen, and again before bed. A pea-sized amount covers the face and neck.</p>
          <p>One %s jar costs ₹999, and each jar costs less when you buy a pack of 2 or 3. Your order is packed and sent sealed by our team at Beauty Mart in Bhatkal. <a href="/about/">Read our story</a>.</p>
        </div>
        <ul aria-label="What it is used for">
          <li>Helps skin look brighter and fresher</li>
          <li>Helps skin look more even</li>
          <li>Moisturises and leaves skin feeling soft</li>
          <li>One cream for morning and night</li>
        </ul>
      </div>''' % (NET, NET), id='about') + LOOKS_HTML + FILMS_HTML + (REELS_HTML if SHOW_REELS else '') + sec('What is inside', 'Three ingredients it is built around', 'Each one has a clear job. The full list is printed on every box.',
    SPOTS_HTML + '\n      <p class="more"><a href="/ingredients/">More about the ingredients</a></p>') + sec('The ritual', 'How to use it', 'Morning and night, in under a minute.',
    RITUAL + '\n      <p class="more"><a href="/how-to-use/">The full routine and what to expect</a></p>') + '''    <section>
''' + NOTE + '''
    </section>
''' + sec('Price', 'Fair N Pink cream price', 'One 10 g jar is ₹999, inclusive of all taxes. Each jar costs less in a pack of 2 or 3, and paying online takes a little more off.', PRICE_TBL, id='price') + sec('Packed by us', 'Sealed, and shipped from Bhatkal', '', '''      <div class="split">
        <img src="/assets/jar-and-box-m.webp" alt="Fair N Pink Advance Radiance Cream jar beside its white box" width="800" height="800" loading="lazy">
        <div>
          <p>Every order placed on fairnpink.in is packed and sent by our team at Beauty Mart in Bhatkal. The jar arrives sealed, in its white box with the red leaf logo.</p>
          <p>Our guide shows what the box, the jar and the seal look like, so you know what to expect when your parcel arrives.</p>
          <p class="more"><a href="/original/">What your jar should look like</a></p>
        </div>
      </div>''') + '%%JOURNAL%%' + sec('Questions', 'Before you order', '', faq_html(HOME_FAQ) + '\n      <p class="more"><a href="/faq/">All questions and answers</a></p>')

HOME_BODY = home.replace('%%JOURNAL%%', sec('Journal', 'Read before you buy', '', jlist(ARTICLES[:3]) + '\n      <p class="more"><a href="/journal/">All articles</a></p>'))
PACK_PRICE = {1: 999, 2: 1899, 3: 2699}   # keep identical to PACKS in store.js and to the server price table
PACK_PATH = {1: PRODUCT_PATH, 2: '/product/fair-n-pink-advance-radiance-cream-pack-of-2/', 3: '/product/fair-n-pink-advance-radiance-cream-pack-of-3/'}
PACK_IMG = {1: ['jar-and-box.jpg', 'merchant-pack-1.jpg'], 2: ['merchant-pack-2.jpg', 'jar-and-box.jpg'], 3: ['merchant-pack-3.jpg', 'jar-and-box.jpg']}


def product_schema(url, n=1):
    return [{
         '@type': 'Product', '@id': url + '#product', 'name': 'Fair N Pink Advance Radiance Cream' + ('' if n == 1 else ', Pack of %d' % n), 'sku': 'FNP-ARC-P%d' % n,
         'description': ('A face cream with glutathione, niacinamide and alpha arbutin, in a %s jar.' % NET) if n == 1 else ('%d jars of Fair N Pink Advance Radiance Cream (%d x %s), a face cream with glutathione, niacinamide and alpha arbutin.' % (n, n, NET)),
         'image': [SITE + '/assets/' + i for i in PACK_IMG[n]], 'category': 'Face cream',
         'brand': {'@type': 'Brand', 'name': 'Fair N Pink'},
         'offers': {'@type': 'Offer', 'url': url, 'price': str(PACK_PRICE[n]), 'priceCurrency': 'INR',
                    'availability': 'https://schema.org/InStock', 'itemCondition': 'https://schema.org/NewCondition',
                    'shippingDetails': {'@type': 'OfferShippingDetails',
                        'shippingRate': {'@type': 'MonetaryAmount', 'value': '0', 'currency': 'INR'},
                        'shippingDestination': {'@type': 'DefinedRegion', 'addressCountry': 'IN'},
                        'deliveryTime': {'@type': 'ShippingDeliveryTime',
                            'handlingTime': {'@type': 'QuantitativeValue', 'minValue': 0, 'maxValue': 1, 'unitCode': 'DAY'},
                            'transitTime': {'@type': 'QuantitativeValue', 'minValue': 3, 'maxValue': 7, 'unitCode': 'DAY'}}},
                    'seller': {'@id': SITE + '/#org'}}}]
page('/', 'Fair N Pink Advance Radiance Cream | Online Store, ₹999',
     'Buy Fair N Pink Advance Radiance Cream online from Beauty Mart, Bhatkal. Glutathione, niacinamide and alpha arbutin in a 10 g jar. ₹999, Cash on Delivery available.',
     HOME_BODY, home=True, schema=product_schema(SITE + '/'))
# The same store on a product address, for Instagram product tags and other places that need a product page link.
page(PRODUCT_PATH, 'Fair N Pink Advance Radiance Cream, 10 g | ₹999',
     'Fair N Pink Advance Radiance Cream, 10 g jar with glutathione, niacinamide and alpha arbutin. ₹999, MRP ₹3,000. Cash on Delivery available.',
     HOME_BODY, home=True, schema=product_schema(SITE + PRODUCT_PATH))

# One page per pack, so Google Merchant Center can check each pack's price on its own page.
def og_for(n):
    return (OG_PRODUCT.replace('content="999"', 'content="%d"' % PACK_PRICE[n]).replace('content="FNP-ARC-P1"', 'content="FNP-ARC-P%d"' % n), PACK_IMG[n][0])


for n in (2, 3):
    body = HOME_BODY.replace('class="pack on" role="radio" aria-checked="true" data-pack="1"', 'class="pack" role="radio" aria-checked="false" data-pack="1"')
    body = body.replace('class="pack" role="radio" aria-checked="false" data-pack="%d"' % n, 'class="pack on" role="radio" aria-checked="true" data-pack="%d"' % n)
    body = '<span id="start-pack" data-pack="%d" hidden></span>\n' % n + body
    # The price text is right before any script runs, so Google reads this pack's price straight from the page.
    was_n = 3000 * n
    for a, b2 in [('id="price-now">₹999<', 'id="price-now">₹%s<' % '{:,}'.format(PACK_PRICE[n])),
                  ('id="price-was" class="mrp-plain">MRP ₹3,000<', 'id="price-was" class="mrp-plain">MRP ₹%s<' % '{:,}'.format(was_n)),
                  ('id="price-note">inclusive of all taxes<', 'id="price-note">₹%d per jar, inclusive of all taxes<' % round(PACK_PRICE[n] / n)),
                  ('id="media-photo" src="/assets/pack-1.webp"', 'id="media-photo" src="/assets/pack-%d.webp"' % n)]:
        assert a in body, a
        body = body.replace(a, b2)
    each = round(PACK_PRICE[n] / n)
    page(PACK_PATH[n], 'Fair N Pink Advance Radiance Cream, Pack of %d (%d x 10 g) | ₹%s' % (n, n, '{:,}'.format(PACK_PRICE[n])),
         'Fair N Pink Advance Radiance Cream, pack of %d jars (%d x 10 g) with glutathione, niacinamide and alpha arbutin. ₹%s (₹%d a jar), free shipping, Cash on Delivery available.' % (n, n, '{:,}'.format(PACK_PRICE[n]), each),
         body, home=True, schema=product_schema(SITE + PACK_PATH[n], n), og=og_for(n), preimg='pack-%d.webp' % n)
    _f = os.path.join(ROOT, PACK_PATH[n].strip('/'), 'index.html')   # the floating bar lives in the page frame, outside the body
    _html = open(_f).read().replace('id="bar-total">₹999<', 'id="bar-total">₹%s<' % '{:,}'.format(PACK_PRICE[n]))
    open(_f, 'w').write(_html)

# ---------------- Ingredients ----------------
body = top('What is inside', 'Fair N Pink cream ingredients', 'Advance Radiance Cream is built around three ingredients: glutathione, niacinamide and alpha arbutin. Here is what each one is and why it is in the jar.') + '''    <section>
      <div class="prose">
        <h2>L-Glutathione</h2>
        <p>Glutathione is an antioxidant made of three amino acids, and it is found naturally in the body. In skincare it is used in creams made for brighter-looking skin. It is the ingredient the cream is named for: the French line on the jar, <i>crème éclat glutathione</i>, means glutathione radiance cream.</p>
        <h2>Niacinamide (vitamin B3)</h2>
        <p>Niacinamide is a form of vitamin B3 and one of the most widely used ingredients in modern skincare. It helps skin look smoother and more even, and it suits most skin types. On some skin it causes a brief warm or tingling feeling in the first few days of use.</p>
        <h2>Alpha arbutin</h2>
        <p>Alpha arbutin is used in creams that help reduce the look of dark spots and uneven tone. It works slowly, which is why we suggest judging the cream over weeks, not days, and always with sunscreen in the morning.</p>
        <h2>The full ingredient list</h2>
        <p>The complete ingredient list is printed on the box of every jar, in the order required for cosmetics. If you would like to read it before you buy, <a href="%s">message us on WhatsApp</a> and we will send you a photo of the box.</p>
        <h2>Who should be careful</h2>
        <p>The cream contains fragrance, so do not use it if you are allergic to perfumed products. Do a patch test on your inner arm for 24 hours before your first use. If you are pregnant, breastfeeding or under treatment for a skin condition, ask your doctor before using any new cream.</p>
        <p>This cream is a cosmetic. It is not a medicine and is not meant to treat any skin disease.</p>
      </div>
    </section>
''' % wa_link('Hello, please send me the full ingredient list of Fair N Pink Advance Radiance Cream.') + sec('At a glance', 'The three ingredients', '', ACT_GRID) + CTA
page('/ingredients/', 'Fair N Pink Cream Ingredients | Glutathione, Niacinamide, Alpha Arbutin',
     'What is in Fair N Pink Advance Radiance Cream: glutathione, niacinamide and alpha arbutin, what each one does, and who should patch test first.',
     body, crumbs='Ingredients')

# ---------------- How to use ----------------
body = top('The ritual', 'How to use Fair N Pink cream', 'Twice a day, a pea-sized amount, on clean skin. The whole routine takes under a minute.') + '''    <section>
''' + RITUAL + '''
    </section>
''' + sec('What to expect', 'How long does it take to work?', 'Skin renews itself slowly. This is a general guide, and results differ from person to person.', WEEKS) + '''    <section>
''' + NOTE + '''
    </section>
''' + sec('Good to know', 'Getting the most from one jar', '', '''      <div class="prose">
        <h3>How much to use</h3>
        <p>A pea-sized amount is enough for the face and neck. Using more does not make it work faster, and a %s jar lasts longer when you keep to a thin layer.</p>
        <h3>With other products</h3>
        <p>Use it after washing your face and before sunscreen in the morning. At night it goes on last. If you use a prescription cream, ask your doctor before adding a new product.</p>
        <h3>Precautions</h3>
        <p>Keep the cream away from your eyes and from broken skin. If your skin turns red, itches or burns, wash it off and stop using it. If the reaction does not settle, see a dermatologist. Store the jar closed, in a cool, dry place.</p>
      </div>''' % NET) + CTA
page('/how-to-use/', 'How to Use Fair N Pink Cream | Morning and Night Routine',
     'How to use Fair N Pink Advance Radiance Cream: the morning and night routine, how much to apply, what to expect week by week, and precautions.',
     body, crumbs='How to use', schema=[{
         '@type': 'HowTo', 'name': 'How to use Fair N Pink Advance Radiance Cream',
         'step': [{'@type': 'HowToStep', 'text': t} for t in [
             'Wash your face and pat it dry.', 'Take a pea-sized amount of cream.',
             'Spread a thin layer over face and neck and massage gently until absorbed.',
             'In the morning, finish with sunscreen. At night, leave it on.']]}])

# ---------------- About ----------------
body = top('Our story', 'About Fair N Pink', 'One cream, made to be used every day, sold by the people who own the brand.') + '''    <section>
      <div class="split">
        <img src="/assets/jar-and-box.webp" alt="Fair N Pink Advance Radiance Cream jar beside its white box" width="1000" height="1000">
        <div class="prose">
          <h2>One product, done properly</h2>
          <p>Fair N Pink is a skincare brand built around a single product: Advance Radiance Cream, a face cream with glutathione, niacinamide and alpha arbutin. We would rather make one cream people come back to than a shelf of products nobody finishes.</p>
          <h2>Plain claims</h2>
          <p>We describe the cream the way it is. It is a cosmetic that helps skin look brighter and more even with regular use and daily sunscreen. It does not change your natural skin tone, and no honest cream does. You will not find before-and-after promises on this site.</p>
          <h2>Direct from us</h2>
          <p>fairnpink.in is run by ''' + OWNER + ''' from Bhatkal, Karnataka. Orders are packed and dispatched by us within 24 hours, and you can reach a real person on WhatsApp before and after you buy.</p>
        </div>
      </div>
    </section>
''' + '''    <section>
      <p class="creed">A quiet daily ritual for skin that looks luminous, morning and night.</p>
      <span class="creed-by">Fair N Pink</span>
    </section>
''' + CTA
page('/about/', 'About Fair N Pink | The Brand Behind Advance Radiance Cream',
     'Fair N Pink is a skincare brand built around one product, Advance Radiance Cream. Read how we describe it, how we sell it and how to reach us.',
     body, crumbs='About')

# ---------------- Original ----------------
body = top('Your jar', 'What your Fair N Pink jar should look like', 'The box, the jar and the seal, so you know what to expect when your parcel arrives.') + '''    <section>
      <div class="split">
        <img src="/assets/jar-and-box.webp" alt="Fair N Pink Advance Radiance Cream: silver jar with clear faceted lid beside its white box with the red leaf logo" width="1000" height="1000">
        <div class="prose">
          <h2>The box</h2>
          <p>The cream comes in a white box. The Fair N Pink name sits at the top with a red three-leaf mark beside it, above a picture of the jar. Below it are the words Advance Radiance Cream and a red band. The net weight, %s, and a barcode are printed on the box.</p>
          <h2>The jar</h2>
          <p>The jar is silver with a mirror-finish band and a clear faceted lid. The Fair N Pink name and leaf mark are printed on the front, with the same wording as the box. The cream inside is a soft pink.</p>
          <h2>The seal</h2>
          <p>A new jar arrives sealed. If the seal is broken or the jar looks as if it has been opened, do not use it.</p>
        </div>
      </div>
    </section>
''' % NET + sec('Not sure about a jar?', 'Send us photos', '', '''      <div class="prose">
        <p>Every order placed on fairnpink.in is packed and sent sealed by our team in Bhatkal. If a jar looks different from this page or the seal is broken, do not use it: send us clear photos of the box and jar on WhatsApp and we will help.</p>
        <p><a class="btn inline" href="%s" target="_blank" rel="noopener">Send photos on WhatsApp</a></p>
      </div>''' % wa_link('Hello, I want to check my Fair N Pink jar. Photos attached.')) + CTA
page('/original/', 'Fair N Pink Cream Box, Jar and Seal: What to Expect',
     'What a Fair N Pink Advance Radiance Cream box, jar and seal look like, and what to do if a jar looks different or the seal is broken.',
     body, crumbs='Check your jar')

# ---------------- FAQ ----------------
FAQ = [
    ('What is Fair N Pink Advance Radiance Cream?', 'It is a face cream with glutathione, niacinamide and alpha arbutin, made for daily use, morning and night. It comes in a %s silver jar.' % NET),
    ('What is the price of Fair N Pink cream?', 'The MRP printed on the box is ₹3,000 a jar. On this store one jar is ₹999, a pack of 2 is ₹1,899 and a pack of 3 is ₹2,699. Prices include all taxes.'),
    ('Is there a discount for paying online?', 'Yes. You save ₹100 on one jar, ₹150 on a pack of 2 and ₹250 on a pack of 3 when you pay online by UPI, card or netbanking. Payments are processed securely by Razorpay.'),
    ('Which payment methods do you accept?', 'UPI, debit cards, credit cards and netbanking, all processed securely by Razorpay, and Cash on Delivery. Prices are in Indian rupees.'),
    ('Can I order on WhatsApp?', 'Yes. Fill in the order form, choose Order on WhatsApp and send the message. We reply on chat to confirm the order and how you would like to pay.'),
    ('Is Cash on Delivery available?', 'Yes. Choose Cash on Delivery in the order form and pay a ₹99 advance online to confirm the order. You pay the rest of the pack price in cash when the parcel arrives. The ₹99 is part of the price, not an extra charge.'),
    ('Why is there a ₹99 advance on Cash on Delivery?', 'It confirms the order before we dispatch it. It is deducted from what you pay at the door, so it is not an extra charge. If you cancel, refuse the parcel or it cannot be delivered, the ₹99 is refunded to your bank account or UPI within 7 working days.'),
    ('How do I use it?', 'Apply a pea-sized amount to clean skin, morning and night. In the morning, finish with sunscreen. <a href="/how-to-use/">See the full routine</a>.'),
    ('How long does it take to show results?', 'It differs from person to person. Skin usually feels softer in the first week. Give it at least four weeks of regular use before you judge it.'),
    ('Does Fair N Pink cream whiten skin?', 'No cream changes your natural skin tone. Advance Radiance Cream is a cosmetic made to help skin look brighter and more even with regular use and daily sunscreen.'),
    ('Does it have side effects?', 'Most people use face creams without any problem, but every skin is different. Patch test first, and stop using it if you notice redness, itching or burning.'),
    ('Which skin types is it for?', 'It is made for all skin types. If your skin is sensitive, do the 24-hour patch test before you use it on your face.'),
    ('Can men use it?', 'Yes. The cream is for anyone who wants a daily face cream.'),
    ('Can I use it during pregnancy?', 'If you are pregnant or breastfeeding, ask your doctor before using any new cream.'),
    ('How long does one jar last?', 'It depends on how much you apply. A pea-sized amount twice a day is enough for the face and neck.'),
    ('When will my order arrive?', 'Orders are dispatched within 24 hours, except on Sundays and national holidays, and delivered in 3 to 7 working days.'),
    ('How do I track my order?', 'Open the <a href="/track/">Track order</a> page and enter your Payment ID, which starts with pay_ and is in your payment SMS, or the courier tracking number we send you.'),
    ('Can I cancel my order?', 'Yes, at any time before it is shipped. Message us on WhatsApp with your name and mobile number.'),
    ('What if my jar arrives damaged?', 'Contact us within 48 hours of delivery with photos or a short video of the package and the damage. We replace it or refund you in full. Refunds reach your bank account or UPI within 7 working days.'),
    ('Can I return a jar?', 'Yes. Unopened, sealed jars can be returned within 7 days of delivery. Message us on WhatsApp first; once we receive the jar back, we refund the price within 7 working days. Opened jars cannot be returned for hygiene reasons, unless they arrived damaged or wrong.'),
    ('How can I check my jar?', 'Orders placed on fairnpink.in are packed and sent sealed by our team in Bhatkal. See <a href="/original/">what the box, jar and seal look like</a>. If the seal is broken, do not use the jar and message us.'),
]
body = top('Questions', 'Fair N Pink cream: questions and answers', 'Price, use, results, delivery and returns. If yours is not here, message us on WhatsApp.') + '''    <section>
''' + faq_html(FAQ) + '''
    </section>
''' + CTA
page('/faq/', 'Fair N Pink Cream FAQ | Price, Use, Results, Delivery',
     'Answers about Fair N Pink Advance Radiance Cream: price, how to use it, how long it takes, side effects, Cash on Delivery, delivery time and returns.',
     body, crumbs='Questions', schema=[{'@type': 'FAQPage', 'mainEntity': [
         {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': strip_tags(a)}} for q, a in FAQ]}])

# ---------------- Contact ----------------
body = top('Contact', 'Contact Fair N Pink', 'The fastest way to reach us is WhatsApp. We reply to order questions, delivery updates and product queries there.') + '''    <section>
      <div class="use">
        <div><h3>WhatsApp</h3><p>%s</p><p style="margin-top:14px"><a class="btn inline" href="%s" target="_blank" rel="noopener">Message us</a></p></div>
        <div><h3>Instagram</h3><p>@fairnpinkprofessional</p><p style="margin-top:14px"><a class="btn wa inline" href="%s" target="_blank" rel="noopener">Open Instagram</a></p></div>
      </div>
    </section>
''' % (WA_SHOW, wa_link('Hello, I have a question about Fair N Pink Advance Radiance Cream.'), IG) + sec('Business details', 'Who we are', '', '''      <div class="prose">
        <p>fairnpink.in is run by %s.</p>
        <p>Address: %s.</p>
        <p>Phone and WhatsApp: %s</p>
      </div>''' % (OWNER, ADDR, WA_SHOW)) + sec('Orders', 'About an order you placed', '', '''      <div class="prose">
        <p>Send us the name and mobile number you ordered with, and we will check the status for you. For a damaged or wrong item, send photos or a short video within 48 hours of delivery. See the <a href="/refund-policy/">returns and refund policy</a>.</p>
      </div>''')
page('/contact/', 'Contact Fair N Pink | WhatsApp and Instagram',
     'Contact Fair N Pink on WhatsApp at +91 99808 81230 or on Instagram @fairnpinkprofessional for orders, delivery updates and product questions.',
     body, crumbs='Contact')

# ---------------- Track order ----------------
body = top('Your order', 'Track your Fair N Pink order', 'Use the mobile number and pincode from your order, or your Payment ID, to see where your parcel is.') + '''    <section>
      <form id="track-form" class="oform track" novalidate>
        <div class="track-by" role="tablist" aria-label="Track with">
          <button type="button" role="tab" id="by-phone" aria-selected="true" class="on">Mobile number</button>
          <button type="button" role="tab" id="by-id" aria-selected="false">Payment ID or tracking no.</button>
        </div>
        <div id="by-phone-box">
          <label for="track-phone">Mobile number used on the order</label>
          <input id="track-phone" type="tel" inputmode="numeric" maxlength="16" autocomplete="tel" placeholder="10-digit mobile number">
          <label for="track-pin">Delivery pincode</label>
          <input id="track-pin" type="text" inputmode="numeric" maxlength="6" autocomplete="postal-code" placeholder="6-digit pincode">
        </div>
        <div id="by-id-box" hidden>
          <label for="track-id">Payment ID or tracking number</label>
          <input id="track-id" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="pay_XXXXXXXXXXXXXX">
        </div>
        <button type="submit" class="btn" id="track-go">Track order</button>
      </form>
      <div id="track-out" class="track-out" role="status" aria-live="polite" hidden></div>
    </section>
''' + sec('Help', 'Where to find your ID', '', '''      <div class="use">
        <div><h3>Paid online</h3><p>Your Payment ID starts with <b>pay_</b>. It is shown on the confirmation screen after you pay, and in the payment SMS you receive.</p></div>
        <div><h3>Cash on Delivery</h3><p>You paid a ₹99 advance online, so you also have a Payment ID starting with <b>pay_</b>. Use it here, or use the courier tracking number.</p></div>
      </div>
      <p class="more"><a href="/shipping-policy/">Delivery times and shipping policy</a></p>''')
page('/track/', 'Track Your Order | Fair N Pink',
     'Track your Fair N Pink order with your mobile number and pincode, your Payment ID or the courier tracking number, and see whether your parcel is packed, shipped or delivered.',
     body, crumbs='Track order', js='track.js')

# ---------------- Policies ----------------
POL = [
    ('/shipping-policy/', 'Shipping policy', 'Shipping', 'Where we deliver, how fast we dispatch and what it costs.', '''
        <h2>Where we deliver</h2><p>We deliver across India.</p>
        <h2>Dispatch</h2><p>Orders are dispatched within 24 hours, except on Sundays and national holidays.</p>
        <h2>Delivery time</h2><p>Parcels are delivered in 3 to 7 working days from dispatch, depending on your pincode.</p>
        <h2>Shipping charges</h2><p>Shipping is <b>free on every order</b>, whether you pay online or by Cash on Delivery. There is no extra delivery, handling or Cash on Delivery fee. The total you see before you confirm is the total you pay.</p>
        <h2>Tracking</h2><p>Use the <a href="/track/">Track order</a> page with the mobile number and pincode from your order, your Payment ID or the courier tracking number. You can also message us on WhatsApp with the name and mobile number on your order.</p>'''),
    ('/refund-policy/', 'Returns, cancellation and refund policy', 'Returns and refunds', 'When you can return or cancel, how refunds work, and what happens if a parcel arrives damaged.', '''
        <div class="pol-sum"><div><b>7 days</b><span>to return an unopened, sealed jar</span></div><div><b>48 hours</b><span>to report a damaged or wrong item, replaced or refunded in full</span></div><div><b>7 working days</b><span>for an approved refund to reach you</span></div></div>
        <h2>Returns</h2><p>You can return <b>unopened, sealed jars within 7 days of delivery</b>. Message us on WhatsApp first with the name and mobile number on the order, and we will tell you where to send it. Return shipping for a change of mind is paid by you. Once we receive the jar and check that it is sealed, we refund the price you paid.</p>
        <h2>Opened products</h2><p>For hygiene reasons we cannot take back a jar that has been opened or used, unless it arrived damaged, defective or wrong.</p>
        <h2>Damaged or wrong items</h2><p>If your jar arrives damaged, leaking or is not what you ordered, message us within 48 hours of delivery with photos or a short video of the package and the problem. We send a replacement free of charge or refund you in full, including shipping.</p>
        <h2>Cancellation</h2><p>You can cancel an order at any time before it is shipped. Message us on WhatsApp with the name and mobile number on the order. Anything you paid is refunded in full.</p>
        <h2>Cash on Delivery advance</h2><p>The ₹99 advance on a Cash on Delivery order is part of the pack price, not an extra charge. It is refunded in full if the order is cancelled, refused at delivery or cannot be delivered.</p>
        <h2>How refunds are paid</h2><p>Online payments are refunded to the original payment method through Razorpay. Cash on Delivery amounts are refunded to the bank account or UPI ID you share with us. Approved refunds are credited within 7 working days.</p>'''),
    ('/privacy-policy/', 'Privacy policy', 'Privacy', 'What we collect when you order, and what we do with it.', '''
        <h2>What we collect</h2><p>To deliver your order we collect your name, mobile number and delivery address. For online payments they are sent to Razorpay with your order so we can deliver it. This applies to Cash on Delivery orders too, since the advance is paid through Razorpay.</p>
        <h2>How we use it</h2><p>We use these details only to process and deliver your order and to reply to your messages.</p>
        <h2>If you start an order and do not finish it</h2><p>When you fill in the order form and open the payment window, your name, mobile number and address are saved with that order. If the payment is not completed, we may message you once on that number to ask whether you need help. Tell us if you would rather not be contacted and we will not message you again.</p>
        <h2>Who we share it with</h2><p>We share your details only with the courier and payment partners needed to complete your order. We do not sell your information.</p>
        <h2>Payments</h2><p>Online payments are processed by Razorpay, a licensed payment gateway, and we do not see or store your card or bank details. UPI payments are made in your own UPI app. We never see or ask for your UPI PIN, card number or bank password.</p>
        <h2>Details saved on your device</h2><p>When you place an order, or start a payment and do not finish it, your name, mobile number, delivery address and chosen pack are saved in your own browser on that device, so that you can finish or repeat the order without typing again. The payment ID of orders placed on that device is also kept there, so the Track order page can show them without you typing it. They are not sent anywhere by this. You can remove them at any time with the Clear button in the order form, or by clearing your browser data.</p>
        <h2>Cookies and advertising</h2><p>This site uses the Google tag to measure visits and to record when an order placed after clicking one of our Google ads is completed. Google may set cookies in your browser for this purpose. We do not send Google your name, phone number or address.</p>
        <p>This site also uses the Meta Pixel, from the company that runs Facebook and Instagram. It tells Meta that your browser visited this site, opened the order form, started a payment or completed an order, with the order value, so that we can measure our Facebook and Instagram ads and show them to people who have visited. We do not send Meta your name, phone number or address. You can manage this in your Facebook or Instagram ad preferences.</p>
        <p>We also use Google Ads remarketing. This means Google may use cookies to note that your browser visited this site, opened the order form or started a payment, and may later show you Fair N Pink ads on Google Search and on other websites. These notes are tied to your browser, not to your name or number. You can switch off personalised ads at adssettings.google.com, opt out of third-party advertising cookies at aboutads.info/choices, and block cookies in your browser settings.</p>
        <h2>Your choices</h2><p>To have your details removed from our records, message us on WhatsApp.</p>'''),
    ('/terms/', 'Terms and conditions', 'Terms', 'The terms that apply when you order from fairnpink.in.', '''
        <h2>The product</h2><p>Fair N Pink Advance Radiance Cream is a cosmetic product, not a medicine. Results vary from person to person. Please patch test before use.</p>
        <h2>Prices</h2><p>Prices are in Indian rupees and include all taxes. The online payment saving shown on the site applies when the order is paid in full online at the time of ordering.</p>
        <h2>Orders</h2><p>An online order is confirmed when your payment succeeds and you see the payment ID. A Cash on Delivery order is confirmed when your ₹99 advance succeeds.</p>
        <h2>Payment methods</h2><p>We accept UPI, debit cards, credit cards and netbanking through Razorpay, and Cash on Delivery. All prices are in Indian rupees.</p>
        <h2>Cash on Delivery</h2><p>Cash on Delivery orders need a ₹99 advance, paid online when you order. The advance is part of the pack price. The balance is payable in cash to the courier at the time of delivery. The advance is refunded in full if the order is cancelled, refused at delivery or cannot be delivered.</p>
        <h2>Seller</h2><p>Orders on fairnpink.in are sold and shipped by ''' + OWNER + ''', ''' + ADDR + '''.</p>
        <h2>Other policies</h2><p>See the <a href="/shipping-policy/">shipping policy</a>, the <a href="/refund-policy/">cancellation and refund policy</a> and the <a href="/privacy-policy/">privacy policy</a>.</p>'''),
]
for path, h1, crumb, lead, inner in POL:
    body = top('Store policies', h1, lead) + '    <section>\n      <div class="prose">%s\n        <p class="stamp">Last updated 5 October 2026. Questions: <a href="/contact/">contact us</a>.</p>\n      </div>\n    </section>\n' % inner
    page(path, '%s | Fair N Pink' % h1, '%s for orders placed on fairnpink.in, the Fair N Pink online store run by Beauty Mart, Bhatkal. %s' % (h1, lead), body, crumbs=crumb)

exec(open(os.path.join(B, 'journal.py')).read())

# ---------------- Reorder reminders (owner only, not linked, not indexed) ----------------
page('/reorder/', 'Reorder reminders | Fair N Pink', 'Owner page.',
     top('Owner only', 'Orders and follow-ups', 'Paid orders, people who started an order and did not pay, and customers due a reorder.') + '''    <section>
      <form id="ro-form" class="oform track" novalidate>
        <label for="ro-key">Admin key</label>
        <input id="ro-key" type="password" autocomplete="off" required>
        <label for="ro-range">Show</label>
        <select id="ro-range"><option value="today">Paid orders today</option><option value="week">Paid orders, last 7 days</option><option value="left">Started an order, did not pay (last 3 days)</option><option value="22-35">Ordered 22 to 35 days ago (reorder due)</option><option value="36-60">Ordered 36 to 60 days ago (missed)</option><option value="0-21">Ordered 0 to 21 days ago (not due yet)</option></select>
        <button type="submit" class="btn" id="ro-go">Show</button>
      </form>
      <div id="ro-out" class="track-out" hidden></div>
    </section>
''', index=False, js='reorder.js')

# ---------------- 404 ----------------
page('/404', 'Page not found | Fair N Pink', 'This page could not be found.',
     top('Not found', 'This page is not here', 'The link may be old or mistyped.') + '    <section><p><a class="btn inline" href="/">Go to the store</a></p></section>\n', index=False)

# ---------------- Assets ----------------
css = open(os.path.join(B, 'base.css')).read()
css = re.sub(r'\.todo[^{]*\{[^}]*\}\n', '', css)
css += open(os.path.join(B, 'extra.css')).read()
open(os.path.join(ROOT, 'assets', 'site.css'), 'w').write(css)
open(os.path.join(ROOT, 'assets', 'store.js'), 'w').write(open(os.path.join(B, 'store.js')).read())
open(os.path.join(ROOT, 'assets', 'track.js'), 'w').write(open(os.path.join(B, 'track.js')).read())
open(os.path.join(ROOT, 'assets', 'reorder.js'), 'w').write(open(os.path.join(B, 'reorder.js')).read())
open(os.path.join(ROOT, 'assets', 'icon.svg'), 'w').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#231B1E"/>'
    '<text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#FAF7F5">FP</text></svg>\n')

urls = ['/', PRODUCT_PATH, PACK_PATH[2], PACK_PATH[3], '/ingredients/', '/how-to-use/', '/about/', '/original/', '/faq/', '/contact/', '/track/', '/journal/'] + ['/journal/%s/' % a[0] for a in ARTICLES] + [p[0] for p in POL]
# Product feed for Google Merchant Center. Price is the regular ₹999 every customer pays
# (the online-payment saving is payment-method specific, so it is not used here).
FEED_ITEM = '''<item>
  <g:id>FNP-ARC-P%(n)d</g:id>
  <title>%(title)s</title>
  <description>%(desc)s</description>
  <link>%(site)s%(path)s</link>
  <g:image_link>%(site)s/assets/%(img)s</g:image_link>
  <g:additional_image_link>%(site)s/assets/%(img2)s</g:additional_image_link>
  <g:availability>in_stock</g:availability>
  <g:price>%(price)d.00 INR</g:price>
  <g:brand>Fair N Pink</g:brand>
  <g:condition>new</g:condition>
  <g:identifier_exists>no</g:identifier_exists>%(multi)s
  <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Skin Care &gt; Lotion &amp; Moisturizer</g:google_product_category>
  <g:product_type>Skin Care &gt; Face Cream</g:product_type>
  <g:size>%(size)s</g:size>
  <g:shipping><g:country>IN</g:country><g:service>Standard</g:service><g:price>0.00 INR</g:price></g:shipping>
  <g:shipping_weight>%(grams)d g</g:shipping_weight>
</item>'''
_DESC = 'A face cream with L-glutathione, niacinamide (vitamin B3) and alpha arbutin, used for brighter-looking, more even-looking skin. Apply a small amount to clean skin and use sunscreen in the daytime. Patch test before use. Cosmetic product; results vary. Free shipping across India, Cash on Delivery available.'
_items = []
for n in (1, 2, 3):
    _items.append(FEED_ITEM % dict(n=n, site=SITE, path=PACK_PATH[n], img=PACK_IMG[n][0], img2=PACK_IMG[n][1], price=PACK_PRICE[n],
        title=('Fair N Pink Advance Radiance Cream 10 g - Glutathione, Niacinamide, Alpha Arbutin' if n == 1 else 'Fair N Pink Advance Radiance Cream, Pack of %d (%d x 10 g) - Glutathione Face Cream' % (n, n)),
        desc=('Fair N Pink Advance Radiance Cream in a %s jar. ' % NET if n == 1 else 'Pack of %d jars of Fair N Pink Advance Radiance Cream (%d x %s). ' % (n, n, NET)) + _DESC,
        multi='' if n == 1 else '\n  <g:multipack>%d</g:multipack>' % n, size=NET, grams=60 * n))
FEED = '''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Fair N Pink</title><link>%s/</link><description>Fair N Pink product feed</description>
%s
</channel>
</rss>
''' % (SITE, '\n'.join(_items))
os.makedirs(os.path.join(ROOT, 'feeds'), exist_ok=True)
open(os.path.join(ROOT, 'feeds', 'products.xml'), 'w').write(FEED)

open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join('  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n' % (SITE, u, TODAY) for u in urls) + '</urlset>\n')
open(os.path.join(ROOT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % SITE)
# Pictures may be kept by the browser for a day and reused while a fresh copy is fetched; pages, styles and scripts are always checked.
open(os.path.join(ROOT, 'vercel.json'), 'w').write(json.dumps({'cleanUrls': False, 'headers': [
    {'source': '/assets/(.*)\\.(webp|jpg|svg|mp4)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=86400, stale-while-revalidate=604800'}]}]}, indent=2) + '\n')
open(os.path.join(ROOT, '.vercelignore'), 'w').write('_build\nREADME.md\n')
print('built', len(urls), 'pages')
