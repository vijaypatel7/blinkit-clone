import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Product catalog — real Blinkit listings parsed from the user-provided PDF.
 *
 * The PDF (a Numbers spreadsheet exported to PDF) contains ~1,834 real Blinkit
 * products across 17 categories (bread, fruits & vegetables, cold drinks,
 * cereal, chocolates, biscuits, tea, atta, sauces, chicken, organic, baby care,
 * pharma, cleaning, home & office, personal care, pet care). Each entry has a
 * real product name and real CDN image URL; where the PDF carried a selling
 * price and MRP those are used verbatim, and where the price was missing (the
 * PDF omits price/unit for roughly 70% of rows) a realistic price is estimated
 * from the category + the product's discount percentage.
 *
 * The parsed, cleaned data lives in `./data/pdf-products.json`, which was
 * generated offline from the PDF by `./tools/pdf-to-catalog.py`. This module
 * simply loads and returns it in the shape the seeder expects.
 *
 * NOTE: "Snacks & Munchies" (`snacks`) and "Masala, Oil & More" (`oils-ghee`)
 * are intentionally NOT in this file — those two categories come from the two
 * scraped JSON files (`data/snacks-products.json`, `data/masala-products.json`)
 * loaded by `realProducts.js`, which carry complete name/unit/price/MRP data.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_FILE = join(__dirname, 'data', 'pdf-products.json');

/**
 * Return the real PDF-derived product list (deterministic across runs).
 */
export function generateProducts() {
  return JSON.parse(readFileSync(CATALOG_FILE, 'utf8'));
}

export const PRODUCT_COUNT = generateProducts().length;
