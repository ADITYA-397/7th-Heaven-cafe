// lib/pricing.js

export const DEFAULT_DELIVERY_FEE = 40;
export const GST_RATE = 0.05;

/**
 * Calculates order subtotal, 5% GST taxes, delivery fee, and grand total.
 * @param {Array} items - Cart items with price and qty
 * @param {number} deliveryFee - Flat delivery fee (defaults to 40)
 */
export function calculateOrderTotals(items = [], deliveryFee = DEFAULT_DELIVERY_FEE) {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      taxes: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const taxes = Math.round(subtotal * GST_RATE);
  const fee = deliveryFee;
  const total = subtotal + taxes + fee;
  const itemCount = items.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);

  return {
    subtotal,
    taxes,
    deliveryFee: fee,
    total,
    itemCount,
  };
}
