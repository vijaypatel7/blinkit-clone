import { useDispatch, useSelector } from 'react-redux';
import {
  addItem,
  incrementItem,
  decrementItem,
  removeItem,
  clear,
  selectCartItems,
  selectCartCount,
  selectCartTotals,
} from '../store/cartSlice.js';

/**
 * Cart hook — client-side cart (works for guests and logged-in users alike).
 *
 * `add(product, qty)` snapshots the product so the cart renders fully offline.
 * `quantityOf(id)` is used by product cards/grids to show the current qty.
 */
export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const totals = useSelector(selectCartTotals);

  return {
    items,
    count,
    totals,
    add: (product, quantity = 1) => dispatch(addItem({ product, quantity })),
    increment: (productId) => dispatch(incrementItem(productId)),
    decrement: (productId) => dispatch(decrementItem(productId)),
    remove: (productId) => dispatch(removeItem(productId)),
    clear: () => dispatch(clear()),
    quantityOf: (productId) =>
      items.find((i) => i.productId === String(productId))?.quantity || 0,
  };
}
