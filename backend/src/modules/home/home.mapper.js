/**
 * Home mapper — assemble the precomputed home page response.
 */
export function toHomeResponse({ store, categories, banners, featured, popular, offers }) {
  return {
    store,
    categories,
    banners,
    featured,
    popular,
    offers,
    generatedAt: new Date().toISOString(),
  };
}
