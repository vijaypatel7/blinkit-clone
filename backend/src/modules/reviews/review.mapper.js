/**
 * Review mappers.
 */
export function toReviewResponse(review) {
  if (!review) return null;
  const r = review.toObject ? review.toObject() : review;
  return {
    id: r._id,
    productId: r.productId,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    images: r.images,
    helpfulCount: r.helpfulCount,
    createdAt: r.createdAt,
    // Minimal author info (no PII leakage).
    author: { name: r.authorName || 'Customer' },
  };
}
