/**
 * Inventory mappers.
 */
export function toInventoryResponse(inventory) {
  if (!inventory) return null;
  const i = inventory.toObject ? inventory.toObject() : inventory;
  return {
    storeId: i.storeId,
    productId: i.productId,
    availableQuantity: i.availableQuantity,
    reservedQuantity: i.reservedQuantity,
    status: i.status,
  };
}
