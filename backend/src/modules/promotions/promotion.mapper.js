/**
 * Promotion mappers.
 */
export function toPromotionResponse(promotion) {
  if (!promotion) return null;
  const p = promotion.toObject ? promotion.toObject() : promotion;
  return {
    id: p._id,
    title: p.title,
    type: p.type,
    image: p.image,
    description: p.description,
    link: p.link,
    priority: p.priority,
    couponCode: p.couponCode,
    startsAt: p.startsAt,
    endsAt: p.endsAt,
  };
}
