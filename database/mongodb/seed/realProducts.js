import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Real product catalog — parsed from scraped Blinkit listings.
 *
 * The two JSON files under `./data/` contain real Blinkit products (name, image
 * URL, unit, selling price and MRP) for two categories:
 *   - masala-products.json  → "Masala, Oil & More" (category slug: oils-ghee)
 *   - snacks-products.json  → "Snacks & Munchies" (category slug: snacks)
 *
 * This module turns those raw listings into the same shape the seeder expects
 * (`name`, `sku`, `slug`, `brand`, `categorySlug`, `unit`, `mrp`, `price`,
 * `popularity`, `image`, `description`, `rating`, `reviewCount`), filling in the
 * fields the scrape did not include (brand, description, rating) so the store
 * looks complete and human.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Which file maps to which category slug. */
const SOURCES = [
  { file: 'masala-products.json', categorySlug: 'oils-ghee' },
  { file: 'snacks-products.json', categorySlug: 'snacks' },
];

/**
 * Multi-word brands (longest first) so "Sweet Karam Coffee" matches before
 * "Sweet". Apostrophes are normalised before matching.
 */
const MULTI_WORD_BRANDS = [
  'sweet karam coffee',
  "the baker's dozen",
  'to be honest',
  'red rock deli',
  "let's try",
  'beyond snack',
  'tata sampann',
  'kitchen xpress',
  'gaay chhap',
  "chef's art",
  "haldiram's",
  'organic tattva',
  'whole farm',
  'urban platter',
  'ram bandhu',
  'yours freshly',
  'too yumm',
  'uncle chipps',
  'kettle studio',
  'modern kitchens',
  'open secret',
  'udupi munch',
  'protein chef',
  'true story',
  'smith & jones',
  'real bites',
  'lo foods',
  "kab's",
  'fx foods',
  'keya',
  'talod',
  'uttam',
];

/** Normalise a string for brand matching (lowercase, straight apostrophes). */
const norm = (s) => String(s || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").trim();

/** Turn any string into a URL/slug-safe token. */
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9']+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Best-effort brand extraction: known multi-word brands, then the first word. */
function extractBrand(name) {
  const n = norm(name);
  for (const brand of MULTI_WORD_BRANDS) {
    if (n === brand || n.startsWith(`${brand} `)) {
      // Recover original casing from the source text.
      return name.slice(0, brand.length).trim();
    }
  }
  const first = name.trim().split(/\s+/)[0];
  return first || null;
}

/** Parse "₹38" (or "₹1,234") into paise as an integer. */
function rupeesToPaise(str) {
  if (!str) return null;
  const digits = String(str).replace(/[^0-9]/g, '');
  if (!digits) return null;
  return Number.parseInt(digits, 10) * 100;
}

/** Build a short, natural product description (the name already includes the brand). */
function buildDescription(name, unit, categorySlug) {
  const size = unit ? ` (${unit})` : '';
  if (categorySlug === 'snacks') {
    return `${name}${size} is a crunchy, flavour-packed snack for every mood. Made with quality ingredients and delivered fresh to your doorstep in minutes.`;
  }
  return `${name}${size} brings authentic, aromatic Indian flavour to your everyday cooking. Freshly packed and delivered to your doorstep in minutes.`;
}

/**
 * Generate the real product list (deterministic across runs).
 * Deduplicated by (name + unit); products without an image are skipped (they are
 * duplicate rows whose image lives on an earlier row).
 */
export function generateRealProducts() {
  const seen = new Set();
  const products = [];
  let index = 0;

  for (const { file, categorySlug } of SOURCES) {
    const raw = JSON.parse(readFileSync(join(__dirname, 'data', file), 'utf8'));

    for (const item of raw) {
      const name = (item['tw-text-300'] || '').trim();
      const image = item['tw-h-full src'];
      const unit = (item['tw-text-200'] || '').trim();
      const price = rupeesToPaise(item['tw-text-200 (2)']);
      const mrpRaw = rupeesToPaise(item['tw-text-200 (3)']);
      const mrp = mrpRaw != null ? mrpRaw : price;

      if (!name || price == null || !image) continue;

      const key = `${norm(name)}::${norm(unit)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const slugBase = `${slugify(name)}-${slugify(unit)}`.replace(/-+$/g, '') || slugify(name);
      const sku = `BLK-${categorySlug.slice(0, 3)}-${index.toString().padStart(4, '0')}`;

      products.push({
        name,
        sku,
        slug: `${slugBase}-${index}`,
        brand: extractBrand(name),
        categorySlug,
        unit: unit || null,
        mrp,
        price,
        popularity: 40 + ((index * 7) % 61),
        image,
        description: buildDescription(name, unit, categorySlug),
        rating: (40 + (index % 9)) / 10, // 4.0 – 4.8
        reviewCount: (index * 13) % 500,
      });

      index += 1;
    }
  }

  return products;
}
