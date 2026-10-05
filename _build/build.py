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

CHAT_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>'

NAV = [('/', 'Shop'), ('/ingredients/', 'Ingredients'), ('/how-to-use/', 'How to use'),
       ('/about/', 'Our story'), ('/journal/', 'Journal'), ('/track/', 'Track order'), ('/faq/', 'Questions'), ('/contact/', 'Contact')]
FOOT = [('/', 'Shop the cream'), ('/ingredients/', 'Ingredients'), ('/how-to-use/', 'How to use'),
        ('/about/', 'Our story'), ('/journal/', 'Journal'), ('/original/', 'Identify the original'), ('/faq/', 'Questions'),
        ('/track/', 'Track order'), ('/contact/', 'Contact'), ('/shipping-policy/', 'Shipping'), ('/refund-policy/', 'Cancellation and refunds'),
        ('/privacy-policy/', 'Privacy'), ('/terms/', 'Terms')]


def wa_link(text):
    from urllib.parse import quote
    return 'https://wa.me/%s?text=%s' % (WA, quote(text))


def page(path, title, desc, body, schema=None, home=False, crumbs=None, index=True, js=''):
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
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
%(robots)s<link rel="canonical" href="%(url)s">
<meta name="theme-color" content="#FAF7F5">
<meta property="og:type" content="%(ogtype)s">
<meta property="og:site_name" content="Fair N Pink">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:url" content="%(url)s">
<meta property="og:image" content="%(site)s/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="/assets/site.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18495856180"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18495856180');</script>
<script type="application/ld+json">%(ld)s</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="strip">Complimentary shipping on prepaid orders · Dispatched within 24 hours</div>
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
           chat=wa_link('Hello, I have a question about Fair N Pink Advance Radiance Cream.'))
    out = os.path.join(ROOT, path.strip('/'), 'index.html') if path != '/404' else os.path.join(ROOT, '404.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(html)


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
        <div><h2>Advance Radiance Cream</h2><p>From ₹999 for a %s jar. Complimentary shipping on prepaid orders, and Cash on Delivery is available.</p></div>
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
        <thead><tr><th>Pack</th><th>Price</th><th>Per jar</th><th>Paid online</th></tr></thead>
        <tbody>
          <tr><td>Pack of 1</td><td>₹999</td><td>₹999</td><td>₹899</td></tr>
          <tr><td>Pack of 2</td><td>₹1,899</td><td>₹950</td><td>₹1,749</td></tr>
          <tr><td>Pack of 3</td><td>₹2,699</td><td>₹900</td><td>₹2,449</td></tr>
        </tbody>
      </table></div>'''

exec(open(os.path.join(B, 'journal_data.py')).read())

# Reels from the brand's own Instagram account, shown on the home page.
REELS = ['DPD4bkqks99', 'DQ9ZhewEtNJ', 'DLmVkaRxTiT', 'DHeKHHyMqgn', 'DNdB7wniENX', 'DQ_wpetjXKN']
REELS_HTML = '      <div class="reels" id="reels" tabindex="0" aria-label="Fair N Pink videos from Instagram">' + ''.join(
    '<div class="reel"><blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/%s/" data-instgrm-version="14">'
    '<a href="https://www.instagram.com/reel/%s/" target="_blank" rel="noopener">Watch this video on Instagram</a></blockquote></div>' % (r, r)
    for r in REELS) + '</div>\n      <p class="more"><a href="' + IG + '" target="_blank" rel="noopener">Follow @fairnpinkprofessional on Instagram</a></p>'

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
    ('What is the price of Fair N Pink Advance Radiance Cream?', 'One %s jar is ₹999. A pack of 2 is ₹1,899 and a pack of 3 is ₹2,699. You save ₹100, ₹150 or ₹250 when you pay online.' % NET),
    ('What size is the Fair N Pink cream jar?', 'Each jar holds %s of cream. The net weight is printed on the box.' % NET),
    ('How do I use it?', 'Apply a pea-sized amount to clean skin, morning and night, with sunscreen in the morning.'),
    ('How long does it take to show results?', 'It differs from person to person. Use it for a few weeks before you judge it.'),
    ('Can I buy Fair N Pink cream online with Cash on Delivery?', 'Yes. Order on this page and choose Cash on Delivery, or pay online by UPI, card or netbanking and save up to ₹250.'),
    ('When will my order arrive?', 'Orders are dispatched within 24 hours, except on Sundays and national holidays, and delivered in 3 to 7 working days.'),
]

home = hero + '''
    <section>
      <p class="creed">A quiet daily ritual for skin that looks luminous, morning and night.</p>
      <span class="creed-by">Fair N Pink</span>
    </section>

''' + sec('The cream', 'Fair N Pink Advance Radiance Cream', '', '''      <div class="about">
        <div>
          <p>Fair N Pink Advance Radiance Cream, often called Fair N Pink glutathione cream, is a face cream with glutathione, niacinamide and alpha arbutin in a moisturising base. It comes in a %s silver jar with a clear faceted lid, and the cream itself is a soft pink.</p>
          <p>It is meant for daily use. Apply a small amount after washing your face in the morning, under sunscreen, and again before bed. A pea-sized amount covers the face and neck.</p>
          <p>One %s jar costs ₹999, and each jar costs less when you buy a pack of 2 or 3. This is the brand's own store, so your order comes directly from Fair N Pink. <a href="/about/">Read our story</a>.</p>
        </div>
        <ul aria-label="What it is used for">
          <li>Helps skin look brighter and fresher</li>
          <li>Helps skin look more even</li>
          <li>Moisturises and leaves skin feeling soft</li>
          <li>One cream for morning and night</li>
        </ul>
      </div>''' % (NET, NET), id='about') + sec('On Instagram', 'See the cream in use', 'Videos from our Instagram, @fairnpinkprofessional. Swipe to see more.', REELS_HTML, id='videos') + sec('What is inside', 'Three ingredients it is built around', 'Each one has a clear job. The full list is printed on every box.',
    ACT_GRID + '\n      <p class="more"><a href="/ingredients/">More about the ingredients</a></p>') + sec('The ritual', 'How to use it', 'Morning and night, in under a minute.',
    RITUAL + '\n      <p class="more"><a href="/how-to-use/">The full routine and what to expect</a></p>') + '''    <section>
''' + NOTE + '''
    </section>
''' + sec('Price', 'Fair N Pink cream price', 'One 10 g jar is ₹999, inclusive of all taxes. Each jar costs less in a pack of 2 or 3, and paying online takes a little more off.', PRICE_TBL, id='price') + sec('Genuine product', 'Bought here, it comes from us', '', '''      <div class="split">
        <img src="/assets/jar-and-box.webp" alt="Fair N Pink Advance Radiance Cream jar beside its white box" width="1000" height="1000" loading="lazy">
        <div>
          <p>Every order placed on fairnpink.in is packed and sent by Fair N Pink. The jar arrives sealed, in its white box with the red leaf logo.</p>
          <p>If you are holding a jar and are not sure about it, our guide shows what to look for on the box and the jar.</p>
          <p class="more"><a href="/original/">How to identify original Fair N Pink</a></p>
        </div>
      </div>''') + '%%JOURNAL%%' + sec('Questions', 'Before you order', '', faq_html(HOME_FAQ) + '\n      <p class="more"><a href="/faq/">All questions and answers</a></p>')

page('/', 'Fair N Pink Advance Radiance Cream | Official Store, ₹999',
     'Buy Fair N Pink Advance Radiance Cream from the official Fair N Pink store. Glutathione, niacinamide and alpha arbutin in a 10 g jar. ₹999, Cash on Delivery available.',
     home.replace('%%JOURNAL%%', sec('Journal', 'Read before you buy', '', jlist(ARTICLES[:3]) + '\n      <p class="more"><a href="/journal/">All articles</a></p>')), home=True, schema=[{
         '@type': 'Product', '@id': SITE + '/#product', 'name': 'Fair N Pink Advance Radiance Cream',
         'description': 'A face cream with glutathione, niacinamide and alpha arbutin, in a %s jar.' % NET,
         'image': [SITE + '/assets/pack-1.webp', SITE + '/assets/jar-and-box.webp'], 'category': 'Face cream',
         'brand': {'@type': 'Brand', 'name': 'Fair N Pink'},
         'offers': {'@type': 'Offer', 'url': SITE + '/', 'price': '999', 'priceCurrency': 'INR',
                    'availability': 'https://schema.org/InStock', 'itemCondition': 'https://schema.org/NewCondition',
                    'seller': {'@id': SITE + '/#org'}}}])

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
          <p>fairnpink.in is the brand's own store, run by ''' + OWNER + ''' from Bhatkal, Karnataka. Orders are packed and dispatched by us within 24 hours, and you can reach a real person on WhatsApp before and after you buy.</p>
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
body = top('Genuine product', 'How to identify original Fair N Pink cream', 'What to look for on the box and the jar, and the simplest way to be sure.') + '''    <section>
      <div class="split">
        <img src="/assets/jar-and-box.webp" alt="Original Fair N Pink Advance Radiance Cream: silver jar with clear faceted lid beside its white box with the red leaf logo" width="1000" height="1000">
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
''' % NET + sec('The simplest check', 'Buy it from the brand', '', '''      <div class="prose">
        <p>Every order placed on fairnpink.in is packed and sent by Fair N Pink, so there is nothing to verify. If you bought a jar elsewhere and something looks different from this page, send us clear photos of the box and jar on WhatsApp and we will tell you what we see.</p>
        <p><a class="btn inline" href="%s" target="_blank" rel="noopener">Send photos on WhatsApp</a></p>
      </div>''' % wa_link('Hello, I want to check whether my Fair N Pink cream is original. Photos attached.')) + CTA
page('/original/', 'Original Fair N Pink Cream: How to Identify It',
     'How to identify original Fair N Pink Advance Radiance Cream: what the box, jar and seal look like, and how to check a jar with the brand on WhatsApp.',
     body, crumbs='Identify the original')

# ---------------- FAQ ----------------
FAQ = [
    ('What is Fair N Pink Advance Radiance Cream?', 'It is a face cream with glutathione, niacinamide and alpha arbutin, made for daily use, morning and night. It comes in a %s silver jar.' % NET),
    ('What is the price of Fair N Pink cream?', 'One jar is ₹999. A pack of 2 is ₹1,899 and a pack of 3 is ₹2,699. Prices include all taxes.'),
    ('Is there a discount for paying online?', 'Yes. You save ₹100 on one jar, ₹150 on a pack of 2 and ₹250 on a pack of 3 when you pay online by UPI, card or netbanking. Payments are processed securely by Razorpay.'),
    ('Which payment methods do you accept?', 'UPI, debit cards, credit cards and netbanking, all processed securely by Razorpay, and Cash on Delivery. Prices are in Indian rupees.'),
    ('Is Cash on Delivery available?', 'Yes. Choose Cash on Delivery in the order form and pay when the parcel arrives.'),
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
    ('What if my jar arrives damaged?', 'Contact us within 24 hours of delivery with a video of the package being opened. Approved refunds reach your bank account within 7 working days.'),
    ('How do I know my Fair N Pink cream is original?', 'Orders placed on fairnpink.in come directly from the brand. For a jar bought elsewhere, see <a href="/original/">how to identify original Fair N Pink</a>.'),
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
        <p>Fair N Pink is a brand owned by %s.</p>
        <p>Address: %s.</p>
        <p>Phone and WhatsApp: %s</p>
      </div>''' % (OWNER, ADDR, WA_SHOW)) + sec('Orders', 'About an order you placed', '', '''      <div class="prose">
        <p>Send us the name and mobile number you ordered with, and we will check the status for you. For a damaged parcel, include a video of the package being opened, within 24 hours of delivery. See the <a href="/refund-policy/">cancellation and refund policy</a>.</p>
      </div>''')
page('/contact/', 'Contact Fair N Pink | WhatsApp and Instagram',
     'Contact Fair N Pink on WhatsApp at +91 99808 81230 or on Instagram @fairnpinkprofessional for orders, delivery updates and product questions.',
     body, crumbs='Contact')

# ---------------- Track order ----------------
body = top('Your order', 'Track your Fair N Pink order', 'Enter your Payment ID or the courier tracking number to see where your parcel is.') + '''    <section>
      <form id="track-form" class="oform track" novalidate>
        <label for="track-id">Payment ID or tracking number</label>
        <input id="track-id" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="pay_XXXXXXXXXXXXXX" required>
        <button type="submit" class="btn" id="track-go">Track order</button>
      </form>
      <div id="track-out" class="track-out" role="status" aria-live="polite" hidden></div>
    </section>
''' + sec('Help', 'Where to find your ID', '', '''      <div class="use">
        <div><h3>Paid online</h3><p>Your Payment ID starts with <b>pay_</b>. It is shown on the confirmation screen after you pay, and in the payment SMS you receive.</p></div>
        <div><h3>Cash on Delivery</h3><p>Use the courier tracking number we send you on WhatsApp when your parcel is dispatched.</p></div>
      </div>
      <p class="more"><a href="/shipping-policy/">Delivery times and shipping policy</a></p>''')
page('/track/', 'Track Your Order | Fair N Pink',
     'Track your Fair N Pink order. Enter your Payment ID or courier tracking number to see whether your parcel is packed, shipped or delivered.',
     body, crumbs='Track order', js='track.js')

# ---------------- Policies ----------------
POL = [
    ('/shipping-policy/', 'Shipping policy', 'Shipping', 'Where we deliver, how fast we dispatch and what it costs.', '''
        <h2>Where we deliver</h2><p>We deliver across India.</p>
        <h2>Dispatch</h2><p>Orders are dispatched within 24 hours, except on Sundays and national holidays.</p>
        <h2>Delivery time</h2><p>Parcels are delivered in 3 to 7 working days from dispatch, depending on your pincode.</p>
        <h2>Shipping charges</h2><p>Shipping is free on orders paid online. Cash on Delivery orders are charged the regular pack price shown on the site, with no extra delivery or handling fee. The total you see before you confirm is the total you pay.</p>
        <h2>Tracking</h2><p>Use the <a href="/track/">Track order</a> page with your Payment ID or courier tracking number. You can also message us on WhatsApp with the name and mobile number on your order.</p>'''),
    ('/refund-policy/', 'Cancellation and refund policy', 'Cancellation and refunds', 'When you can cancel, and what happens if a parcel arrives damaged.', '''
        <h2>Cancellation</h2><p>You can cancel an order at any time before it is shipped. Message us on WhatsApp with the name and mobile number on the order.</p>
        <h2>Damaged on arrival</h2><p>If your jar arrives damaged, message us within 24 hours of delivery with a video that clearly shows the package being opened and the damage.</p>
        <h2>Refunds</h2><p>Approved refunds are credited to your bank account or UPI within 7 working days.</p>
        <h2>Opened products</h2><p>For hygiene reasons we cannot take back a jar that has been opened or used.</p>'''),
    ('/privacy-policy/', 'Privacy policy', 'Privacy', 'What we collect when you order, and what we do with it.', '''
        <h2>What we collect</h2><p>To deliver your order we collect your name, mobile number and delivery address. For online payments they are sent to Razorpay with your order so we can deliver it. For Cash on Delivery, the form prepares a WhatsApp message that you send to us yourself.</p>
        <h2>How we use it</h2><p>We use these details only to process and deliver your order and to reply to your messages.</p>
        <h2>Who we share it with</h2><p>We share your details only with the courier and payment partners needed to complete your order. We do not sell your information.</p>
        <h2>Payments</h2><p>Online payments are processed by Razorpay, a licensed payment gateway, and we do not see or store your card or bank details. UPI payments are made in your own UPI app. We never see or ask for your UPI PIN, card number or bank password.</p>
        <h2>Cookies and advertising</h2><p>This site uses the Google tag to measure visits and to record when an order placed after clicking one of our Google ads is completed. Google may set cookies in your browser for this purpose. We do not send Google your name, phone number or address. You can control ad personalisation in your Google account at adssettings.google.com, and you can block cookies in your browser settings.</p>
        <h2>Instagram videos</h2><p>The home page shows videos from our Instagram account. They are loaded from Instagram when you scroll to them, and Instagram may set its own cookies when they load.</p>
        <h2>Your choices</h2><p>To have your details removed from our records, message us on WhatsApp.</p>'''),
    ('/terms/', 'Terms and conditions', 'Terms', 'The terms that apply when you order from fairnpink.in.', '''
        <h2>The product</h2><p>Fair N Pink Advance Radiance Cream is a cosmetic product, not a medicine. Results vary from person to person. Please patch test before use.</p>
        <h2>Prices</h2><p>Prices are in Indian rupees and include all taxes. The online payment saving shown on the site applies when the order is paid in full online at the time of ordering.</p>
        <h2>Orders</h2><p>An online order is confirmed when your payment succeeds and you see the payment ID. A Cash on Delivery order is confirmed when we reply to your WhatsApp message.</p>
        <h2>Payment methods</h2><p>We accept UPI, debit cards, credit cards and netbanking through Razorpay, and Cash on Delivery. All prices are in Indian rupees.</p>
        <h2>Cash on Delivery</h2><p>Cash on Delivery orders are payable in full to the courier at the time of delivery.</p>
        <h2>Seller</h2><p>Orders on fairnpink.in are sold and shipped by ''' + OWNER + ''', ''' + ADDR + '''.</p>
        <h2>Other policies</h2><p>See the <a href="/shipping-policy/">shipping policy</a>, the <a href="/refund-policy/">cancellation and refund policy</a> and the <a href="/privacy-policy/">privacy policy</a>.</p>'''),
]
for path, h1, crumb, lead, inner in POL:
    body = top('Store policies', h1, lead) + '    <section>\n      <div class="prose">%s\n        <p class="stamp">Last updated 5 October 2026. Questions: <a href="/contact/">contact us</a>.</p>\n      </div>\n    </section>\n' % inner
    page(path, '%s | Fair N Pink' % h1, '%s for orders placed on fairnpink.in, the official Fair N Pink store. %s' % (h1, lead), body, crumbs=crumb)

exec(open(os.path.join(B, 'journal.py')).read())

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
open(os.path.join(ROOT, 'assets', 'icon.svg'), 'w').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#231B1E"/>'
    '<text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#FAF7F5">FP</text></svg>\n')

urls = ['/', '/ingredients/', '/how-to-use/', '/about/', '/original/', '/faq/', '/contact/', '/track/', '/journal/'] + ['/journal/%s/' % a[0] for a in ARTICLES] + [p[0] for p in POL]
open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join('  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n' % (SITE, u, TODAY) for u in urls) + '</urlset>\n')
open(os.path.join(ROOT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % SITE)
open(os.path.join(ROOT, 'vercel.json'), 'w').write(json.dumps({'cleanUrls': False}, indent=2) + '\n')
open(os.path.join(ROOT, '.vercelignore'), 'w').write('_build\nREADME.md\n')
print('built', len(urls), 'pages')
