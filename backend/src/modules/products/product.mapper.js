/**
 * Product mappers — shape DB docs into lean API responses.
 */
export function toProductListItem(product) {
  if (!product) return null;
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    categoryId: product.categoryId,
    image: product.images?.[0] || null,
    price: product.pricing?.price,
    mrp: product.pricing?.mrp,
    unit: product.unit,
    available: product.status === 'ACTIVE',
  };
}

export function toProductDetail(product) {
  if (!product) return null;
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    categoryId: product.categoryId,
    images: product.images || [],
    description: product.description,
    attributes: product.attributes || {},
    price: product.pricing?.price,
    mrp: product.pricing?.mrp,
    currency: product.pricing?.currency,
    unit: product.unit,
    available: product.status === 'ACTIVE',
    rating: product.rating,
    reviewCount: product.reviewCount,
  };
}
