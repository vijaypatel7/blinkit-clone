import { useDispatch, useSelector } from 'react-redux';
import {
  toggle,
  remove,
  clear,
  selectWishlistItems,
  selectWishlistCount,
} from '../store/wishlistSlice.js';

/**
 * Wishlist hook — reads/toggles the client-side wishlist.
 *
 * `isWishlisted(id)` is used by product cards to render a filled/outline heart;
 * `toggle(product)` adds/removes the product and is reflected everywhere.
 */
export function useWishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const count = useSelector(selectWishlistCount);

  return {
    items,
    count,
    toggle: (product) => dispatch(toggle(product)),
    remove: (id) => dispatch(remove(id)),
    clear: () => dispatch(clear()),
    isWishlisted: (id) => items.some((i) => i.id === String(id)),
  };
}
