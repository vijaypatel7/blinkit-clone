/**
 * Category mappers.
 */
export function toCategoryResponse(category) {
  if (!category) return null;
  const c = category.toObject ? category.toObject() : category;
  return {
    id: c._id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId || null,
    image: c.image,
    icon: c.icon,
    sortOrder: c.sortOrder,
    isFeatured: c.isFeatured,
  };
}

/** Build a tree of categories from a flat list. */
export function toCategoryTree(categories) {
  const items = categories.map(toCategoryResponse);
  const byId = new Map(items.map((c) => [String(c.id), { ...c, children: [] }]));
  const roots = [];

  for (const node of byId.values()) {
    if (node.parentId && byId.has(String(node.parentId))) {
      byId.get(String(node.parentId)).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
