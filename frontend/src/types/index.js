/**
 * Shared domain types (JSDoc typedefs).
 *
 * The project is plain JavaScript (JSX); these typedefs document the shapes
 * consumed across features and let editors provide IntelliSense.
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} [slug]
 * @property {string} [sku]
 * @property {string} [brand]
 * @property {string} [image]
 * @property {number} price      // paise
 * @property {number} mrp        // paise
 * @property {boolean} available
 */

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {number} quantity
 * @property {number} [unitPrice]
 * @property {number} [lineTotal]
 */

/**
 * @typedef {Object} Cart
 * @property {string|null} storeId
 * @property {CartItem[]} items
 * @property {number} totalItems
 * @property {number} [totalAmount]
 */

/**
 * @typedef {Object} Address
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string} phone
 * @property {string} street
 * @property {string} city
 * @property {string} pincode
 * @property {[number, number]|null} coordinates
 * @property {boolean} isDefault
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {string} status
 * @property {string} paymentStatus
 * @property {Object} totals
 * @property {CartItem[]} items
 */

export {};
