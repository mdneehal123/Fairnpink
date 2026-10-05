# ---------------- Journal ----------------
body = top('Journal', 'The Fair N Pink journal', 'Plain guides to the cream, its ingredients and everyday skin care.') + '    <section>\n' + jlist(ARTICLES) + '\n    </section>\n' + CTA
page('/journal/', 'Fair N Pink Journal | Guides to the Cream and Skin Care',
     'Guides from Fair N Pink: the price of the cream, its benefits and side effects, glutathione, niacinamide and alpha arbutin, and a routine for dark spots.',
     body, crumbs='Journal')

for i, (slug, h1, seo, desc, tag, teaser, inner) in enumerate(ARTICLES):
    others = [a for a in ARTICLES if a[0] != slug]
    nxt = (others[i % len(others):] + others)[:3]
    path = '/journal/%s/' % slug
    body = '''    <div class="page-top">
      <span class="eyebrow"><a href="/journal/" style="text-decoration:none">Journal</a> · %s</span>
      <h1>%s</h1>
      <p class="byline">By Fair N Pink · Updated 5 October 2026</p>
    </div>
    <section>
      <div class="prose">%s
      </div>
    </section>
''' % (tag, h1, inner) + CTA + sec('Journal', 'Keep reading', '', jlist(nxt))
    page(path, seo, desc, body, crumbs=h1, schema=[{
        '@type': 'Article', 'headline': h1, 'description': desc, 'image': SITE + '/assets/og.jpg',
        'datePublished': TODAY, 'dateModified': TODAY, 'mainEntityOfPage': SITE + path,
        'author': {'@id': SITE + '/#org'}, 'publisher': {'@id': SITE + '/#org'}}])
