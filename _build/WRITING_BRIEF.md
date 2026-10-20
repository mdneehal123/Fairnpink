# Writing brief: Fair N Pink (fairnpink.in) journal guides

Used by people and by the daily SEO agent. Keep it identical to the printed pack.

## Product facts (only these)
- Fair N Pink Advance Radiance Cream, 10 g jar. Key actives (from ACTIVES in _build/build.py): L-glutathione, niacinamide (vitamin B3), alpha arbutin. Do not invent other ingredients or percentages.
- Price (from _build/store.js): 1 jar ₹999, 2 jars ₹1,899, 3 jars ₹2,699; MRP ₹1,200 per jar, inclusive of taxes.
- Order online (Razorpay), Cash on Delivery through Delhivery where available, or WhatsApp +91 99808 81230. Maker: Beauty Mart Pvt Ltd, Bhatkal, Karnataka. "Check your jar" page: /original/.

## Extra care: the brand name contains "Fair"
- NEVER promise or imply fairness, whitening, lightening of natural skin colour, "gora", permanent results, cure/treatment, guaranteed or day-count results, "No. 1", clinically proven, dermatologist recommended. You may mention those search phrases only to correct them.
- Cosmetic wording only: brighter-looking, more even-looking, helps dark spots and tan look lighter over weeks, with daily sunscreen.
- No invented studies, numbers, reviews, customers or before/after claims. No competitor brand names. Medical topics (melasma, pregnancy, PCOS, injections, tablets) → see a dermatologist/doctor, no dosing.
- Always: patch test, sunscreen every morning, see a dermatologist for conditions.

## Format
Articles are tuples in MORE_ARTICLES in _build/journal_more.py:
(slug, h1, seo title ≤ 62 chars, meta description 140–158 chars, tag, teaser, html)
The html: direct answer in the first 2 sentences, 5–8 <h2> sections, a useful <ol> or table, 4+ internal links to existing pages (every <loc> in sitemap.xml), 1–2 natural mentions of the cream (link /), 800–1,200 words, ending with an FAQ section in the same style as existing articles. Read 2 existing articles first and match their voice; do not repeat their topics.
Build: python3 _build/build.py from the repository root.
