import { getOrSet } from '../../common/cache/index.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { CACHE_TTL } from '../../config/performance.js';
import { zoneKey } from '../../common/utils/geo.js';
import { categoryService } from '../categories/category.service.js';
import { promotionService } from '../promotions/promotion.service.js';
import { productService } from '../products/product.service.js';
import { storeService } from '../stores/store.service.js';
import { toHomeResponse } from './home.mapper.js';

/**
 * Home service.
 *
 * The home page is the single highest-traffic surface. Instead of running
 * 10–20 MongoDB queries per request, we assemble ONE precomputed payload per
 * location zone and cache it in Redis. A single `GET /home` becomes a Redis
 * read → JSON response.
 */
export const homeService = {
  async getHome({ lat, lng, zone }) {
    // Derive a stable zone key for caching (bucketed coordinates).
    const resolvedZone = zone || (lat != null && lng != null ? zoneKey({ lat, lng }) : 'default');

    return getOrSet(cacheKeys.home(resolvedZone), CACHE_TTL.HOME, () =>
      this._buildHome(resolvedZone, { lat, lng })
    );
  },

  async _buildHome(zone, { lat, lng }) {
    // Resolve store (location-based) — cached separately.
    const store = lat != null && lng != null
      ? await storeService.resolveNearest({ lat, lng })
      : null;

    // All sections are themselves cached, so this is cheap on a cold home.
    const [categories, banners, offers, featured, popular] = await Promise.all([
      categoryService.getTree(),
      promotionService.listBanners({ zone }),
      promotionService.listActive({ zone }),
      productService.list({ featured: true, limit: 10 }),
      productService.listPopular(zone, { limit: 20 }),
    ]);

    return toHomeResponse({
      store,
      categories,
      banners,
      featured: featured.items || [],
      popular,
      offers,
    });
  },
};
