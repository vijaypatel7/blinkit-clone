#!/usr/bin/env python3
"""
pdf-to-catalog.py — regenerate `data/pdf-products.json` from the user's PDF.

The "data" PDF is a Numbers spreadsheet (exported to PDF) of scraped Blinkit
product cards. Each card holds, in reading order:

    [N% OFF]  https://…/product/<uuid>.png   (main product image, w=360)
    https://…/eta-icons/15-mins.png          (delivery-time icon, w=90)
    9 MINS <name lines…>                     (name, sometimes with "9 MINS" glued)
    <unit> ₹<price> [₹<mrp>] [ADD] [N% OFF] [N options]   (optional)

The PDF has ~2,258 products across 17 categories in a fixed order, but:
  * there is NO category column (we infer it from page ranges + keywords), and
  * ~70% of rows omit price/unit (we estimate a realistic price from the
    category + the discount %).

Usage:
    python3 pdf-to-catalog.py path/to/data.pdf [output.json]

Requires: pypdf  (pip install pypdf)
"""

import hashlib
import json
import re
import sys

# ---------------------------------------------------------------------------
# 1. Extract text from the PDF (one line per visual line, page kept aside)
# ---------------------------------------------------------------------------

def extract_lines(pdf_path):
    try:
        from pypdf import PdfReader
    except ImportError:
        sys.exit('pypdf is required: pip install pypdf')

    # Unicode ligatures Numbers emits -> ASCII
    lig = {'\ufb00': 'ff', '\ufb01': 'fi', '\ufb02': 'fl',
           '\ufb03': 'ffi', '\ufb04': 'ffl', '\ufb05': 'st', '\ufb06': 'st'}
    lines, page_of = [], []
    for pno, page in enumerate(PdfReader(pdf_path).pages, start=1):
        text = ''.join(lig.get(c, c) for c in (page.extract_text() or ''))
        for line in text.split('\n'):
            if line.strip():
                lines.append(line.strip())
                page_of.append(pno)
    return lines, page_of


# ---------------------------------------------------------------------------
# 2. Parse product blocks out of the line stream
# ---------------------------------------------------------------------------

UNIT_RE = re.compile(
    r'(\d+(?:\.\d+)?(?:\s*[xX+]\s*\d+(?:\.\d+)?)*\s*'
    r'(?:g|kg|gm|ml|l|L|ltr|lt|litre|litres|pcs?|pack|tabs?|sheets?|pulls?|'
    r'rolls?|pc|sachets?|pairs?|units?)\.?)\s*$'
)


def parse_products(lines, page_of):
    n = len(lines)

    def build_url(i):
        parts, j = [], i
        while j < n:
            parts.append(lines[j])
            if lines[j].endswith('.png') or j - i > 16:
                break
            j += 1
        return ''.join(parts), j

    def to_paise(s):
        return int(round(float(s.replace(',', '')) * 100))

    products, i = [], 0
    discount_pre = None
    while i < n:
        line = lines[i]
        if 'https://' in line:
            dm = re.match(r'^(\d+)\s*%\s*OFF\s+(https://.*)$', line)
            if dm:
                discount_pre = int(dm.group(1))
                line = dm.group(2)
            if line.startswith('https://'):
                url, last = build_url(i)
                url = line + url[len(lines[i]):]  # drop the discount prefix
                if '/product/' in url:
                    ni = last + 1
                    if ni < n and 'https://' in lines[ni]:
                        u2, l2 = build_url(ni)
                        if '/eta-icons/' in u2 or 'ad_without_bg' in u2 or '/ui/' in u2:
                            ni = l2 + 1
                    parts, end = [], ni
                    while end < n:
                        l = lines[end]
                        if 'https://' in l or re.match(r'^\d+\s*$', l):
                            break
                        parts.append(l)
                        end += 1
                    block = ' '.join(parts).strip()
                    eta = None
                    mm = re.match(r'^(\d+)\s*MINS\s*(.*)$', block)
                    if mm:
                        eta, block = int(mm.group(1)), mm.group(2).strip()
                    name = unit = price = mrp = None
                    discount = discount_pre
                    options = None
                    oos = False
                    pm = re.search(r'₹([\d,]+(?:\.\d+)?)', block)
                    if pm:
                        before = block[:pm.start()].strip()
                        after = block[pm.start():]
                        tokens = re.findall(r'₹([\d,]+(?:\.\d+)?)', after)
                        price = to_paise(tokens[0])
                        if len(tokens) > 1:
                            mrp = to_paise(tokens[1])
                        rest = re.sub(r'₹[\d,]+(?:\.\d+)?', '', after).strip()
                        um = UNIT_RE.search(before)
                        if um:
                            unit, name = um.group(1).strip(), before[:um.start()].strip()
                        else:
                            name = before
                        dm2 = re.search(r'(\d+)\s*%\s*OFF', rest)
                        if dm2:
                            discount = int(dm2.group(1))
                        om = re.search(r'(\d+)\s*options?', rest)
                        if om:
                            options = int(om.group(1))
                        if 'Out of Stock' in rest:
                            oos = True
                    else:
                        name = block
                    if name:
                        products.append(dict(
                            page=page_of[i], image=url, name=name, unit=unit,
                            price=price, mrp=mrp, discount=discount,
                            options=options, eta=eta, oos=oos))
                    i = end
                    discount_pre = None
                    continue
        if re.match(r'^\d+\s*%\s*OFF$', line):
            discount_pre = int(line.split('%')[0])
            i += 1
            continue
        i += 1
    return products


# ---------------------------------------------------------------------------
# 3. Category classification (page ranges + keyword overrides)
# ---------------------------------------------------------------------------

def classify(page, name):
    n = name.lower()
    if 201 <= page <= 209 and any(k in n for k in [
            'chicken', 'meat', 'mutton', 'fish', 'boneless', 'curry cut',
            'prawn', 'keema', 'egg', 'sausage']):
        return 'eggs-meat'
    if 238 <= page <= 305:
        if any(k in n for k in ['scrub', 'brush', 'glove', 'mop', 'clean',
                                'detergent', 'disinfect', 'bottle brush',
                                'sponge', 'steel scrubber', 'microfiber cloth',
                                'wipe', 'sanitizer', 'germ', 'antibac', 'bleach']):
            return 'household'
        return 'home-office'
    return {
        (1, 14): 'dairy-bread', (15, 32): 'fruits-vegetables',
        (33, 64): 'beverages', (65, 70): 'instant-frozen',
        (71, 99): 'ice-cream', (100, 123): 'biscuits-cookies',
        (124, 139): 'tea-coffee', (140, 145): 'staples',
        (146, 200): 'oils-ghee', (201, 209): 'sauces-spreads',
        (210, 214): 'health-wellness', (215, 232): 'baby-care',
        (233, 237): 'pharma-wellness', (306, 325): 'personal-care',
        (326, 340): 'pet-care',
    }.get(next(((a, b) for a, b in [
        (1, 14), (15, 32), (33, 64), (65, 70), (71, 99), (100, 123),
        (124, 139), (140, 145), (146, 200), (201, 209), (210, 214),
        (215, 232), (233, 237), (306, 325), (326, 340),
    ] if a <= page <= b), None) or (None, None))


# ---------------------------------------------------------------------------
# 4. Brand extraction
# ---------------------------------------------------------------------------

MULTI_WORD_BRANDS = [
    "the baker's dozen", "the health factory", "baker's loaf", "american garden",
    "super crustless", "kabhi b", "smith & jones", "tata sampann", "brooke bond",
    "wagh bakri", "organic tattva", "true story", "two brothers", "kitchen xpress",
    "sweet karam coffee", "bombay banta", "raw pressery", "dr pepper", "m&m's",
    "hershey's", "reese's", "lo foods", "open secret", "kettle studio", "urban platter",
    "real bites", "whole farm", "red rock deli", "beyond snack", "let's try",
    "to be honest", "protein chef", "organic india", "india gate", "del monte",
    "mccain", "mother dairy", "mother's recipe", "natures basket", "kinder joy",
    "a tata product - organic india", "good day", "hide & seek", "milano",
    "kellogg's", "maggi", "nissin", "top ramen", "knorr", "veeba", "wingreens",
    "cremica", "fun foods", "chings", "kapiva", "the select aisle", "loacker",
    "karachi bakery", "unibic", "sapphire", "sunfeast", "parle", "britannia",
    "cadbury", "nestle", "milka", "lindt", "snickers", "kinder", "hershey",
    "mcvities", "mcvitie's", "lotte", "pepero", "mountain dew", "thums up",
    "sepoy & co.", "am safe-x", "r for rabbit", "the wellness shop",
    "pack n wrap", "eco soul", "royal canin", "slurrp farm", "paperwrap",
    "organically grown", "greenvale", "kiah hygiene", "honest home", "little's",
    "coca-cola", "diet coke", "mamy poko", "mamypoko", "scotch brite",
    "the whole truth", "the mills & co", "the derma co", "little joys",
    "little angel", "paper boat", "royal silky",
]

PRODUCE_NO_BRAND = {
    'green', 'red', 'yellow', 'orange', 'purple', 'hybrid', 'baby', 'cherry',
    'long', 'small', 'big', 'raw', 'ripe', 'desi', 'button', 'cluster', 'fresh',
    'brown', 'white', 'black', 'pointed', 'round', 'sweet', 'english', 'indian',
    'regular', 'premium', 'organically', 'ginger', 'bottle', 'bitter', 'garlic',
    'onion', 'potato', 'tomato', 'cabbage', 'cauliflower', 'capsicum',
    'cucumber', 'brinjal', 'mushroom', 'carrot', 'beetroot', 'pumpkin',
    'gourd', 'ladyfinger', 'okra', 'spinach', 'coriander', 'mint', 'lemon',
    'lime', 'banana', 'apple', 'mango', 'watermelon', 'papaya', 'coconut',
    'groundnut', 'groundnuts', 'lemongrass', 'chilli', 'peas', 'beans',
    'sprouts', 'zucchini', 'broccoli', 'mooli', 'radish', 'turnip',
    'drumstick', 'jackfruit', 'sitaphal', 'kiwi', 'pineapple', 'strawberry',
    'pomegranate', 'guava', 'grapes', 'chikoo', 'sapota',
}


def extract_brand(name, category):
    n = name.lower().replace('\u2019', "'").replace('\u2018', "'").strip()
    for b in MULTI_WORD_BRANDS:
        if n == b or n.startswith(b + ' '):
            return name[:len(b)].strip()
    first = name.strip().split()
    if not first:
        return None
    if category == 'fruits-vegetables' and first[0].lower() in PRODUCE_NO_BRAND:
        return None
    return first[0]


# ---------------------------------------------------------------------------
# 5. Clean name + estimate prices
# ---------------------------------------------------------------------------

CATEGORY_MRP = {
    'dairy-bread': 5500, 'fruits-vegetables': 3500, 'beverages': 5000,
    'instant-frozen': 18000, 'ice-cream': 9900, 'biscuits-cookies': 4500,
    'tea-coffee': 25000, 'staples': 30000, 'sauces-spreads': 12000,
    'eggs-meat': 25000, 'health-wellness': 15000, 'baby-care': 70000,
    'pharma-wellness': 15000, 'household': 8000, 'home-office': 15000,
    'personal-care': 5500, 'pet-care': 50000,
}


def clean_name(name):
    name = re.sub(r'^(?:assets/eta-icons/\s*)?(?:15-mins\.png|30-mins\.png)\s*', '', name)
    name = re.sub(r'^(?:assets/eta-icons/\s*)?\d+\s*MINS\s*', '', name)
    while True:
        m = re.search(r'\s+(tw-[a-z0-9-]+|src)(?:\s*\(\d+\))?\s*$', name)
        if not m:
            break
        name = name[:m.start()]
    return name.strip()


def split_unit(name):
    m = UNIT_RE.search(name)
    if m:
        return name[:m.start()].strip().rstrip(','), m.group(1).strip()
    return name, None


def slugify(s):
    s = s.lower().replace('\u2019', "'").replace('\u2018', "'")
    s = re.sub(r'[^a-z0-9\'\-]+', '-', s)
    return re.sub(r'(^-|-$)', '', s)


def build_catalog(products):
    seen, catalog, index = set(), [], 0
    for p in products:
        cat = classify(p['page'], p['name'])
        if cat in (None, 'oils-ghee', 'snacks'):
            continue  # oils-ghee & snacks come from the two JSON files
        name = clean_name(p['name'])
        if not name or any(k in name.lower() for k in
                           ['cdn.grofers', 'cdn-cgi/image', 'f=auto', 'q=70', 'metada', 'w=360']):
            continue
        unit = p['unit']
        if not unit:
            name, unit = split_unit(name)
            if not name:
                continue
        price, mrp, discount = p['price'], p['mrp'], p['discount']
        if price is None:
            mrp = int(round(CATEGORY_MRP.get(cat, 9900)
                            * (0.85 + (int(hashlib.md5(name.encode()).hexdigest(), 16) % 40) / 100)
                            / 100) * 100)
            if discount and discount > 0:
                price = int(round(mrp * (1 - discount / 100) / 100) * 100)
            else:
                d = int(hashlib.md5(name.encode()).hexdigest(), 16) % 15
                price = int(round(mrp * (1 - d / 100) / 100) * 100)
                if d:
                    discount = d
            if price <= 0 or price >= mrp:
                price = mrp
        else:
            if mrp is None:
                mrp = int(round(price / (1 - discount / 100) / 100) * 100) \
                    if discount and discount > 0 else price
            mrp = max(mrp, price)
        key = (name.lower().replace('\u2019', "'").strip(), (unit or '').strip())
        if key in seen:
            continue
        seen.add(key)
        brand = extract_brand(name, cat)
        slug = f"{slugify(name)}-{slugify(unit or '')}".rstrip('-') or slugify(name)
        catalog.append(dict(
            name=name, sku=f"BLK-{cat[:3]}-{index:05d}", slug=f"{slug}-{index}",
            brand=brand, categorySlug=cat, unit=unit, mrp=int(mrp), price=int(price),
            popularity=40 + ((index * 7) % 61), image=p['image'],
            description=f"{name}{' (' + unit + ')' if unit else ''} delivered to your doorstep in minutes.",
            rating=round((40 + (index % 9)) / 10, 1), reviewCount=(index * 13) % 500,
        ))
        index += 1
    return catalog


def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else 'data.pdf'
    out_path = sys.argv[2] if len(sys.argv) > 2 else 'data/pdf-products.json'
    lines, page_of = extract_lines(pdf_path)
    products = parse_products(lines, page_of)
    catalog = build_catalog(products)
    with open(out_path, 'w') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=1)
    print(f'wrote {len(catalog)} products to {out_path}')


if __name__ == '__main__':
    main()
