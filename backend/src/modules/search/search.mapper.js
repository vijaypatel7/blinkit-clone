/**
 * Search mappers.
 */
export function toSearchProductResult(product) {
  return {
    id: product._id,
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    image: product.images?.[0] || null,
    price: product.pricing?.price,
    mrp: product.pricing?.mrp,
  };
}

export function toSearchCategoryResult(category) {
  return { id: category._id, name: category.name, slug: category.slug };
}

export function toSuggestion(product) {
  return {
    id: product._id,
    name: product.name,
    sku: product.sku,
    brand: product.brand,
  };
}
