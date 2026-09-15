/**
 * Inventory constants.
 */
export const INVENTORY_TXN_TYPE = {
  RESERVE: 'RESERVE',
  RELEASE: 'RELEASE',
  DEDUCT: 'DEDUCT',
  RESTOCK: 'RESTOCK',
  ADJUSTMENT: 'ADJUSTMENT',
};

export const INVENTORY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
};

/** Stock level below which a product is flagged "low stock". */
export const LOW_STOCK_THRESHOLD = 5;
