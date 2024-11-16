import { ApiError } from "../utils/ApiError.js";

// Validation function for required fields
// Most validations are already handled by MongoDB.
export function validateCouponFields(fields) {
  const { type, details, expiryDate } = fields;
 
  if (type === "cart-wise" && (details.threshold == null || details.discount == null)) {
    throw new ApiError(
      400,
      "Invalid input: threshold and discount is required for cart-wise coupons"
    );
  }

  if (type === "product-wise" && (details.product_id == null || details.discount == null)) {
    throw new ApiError(
      400,
      "Invalid input: poduct_id and discount is required for product-wise coupons"
    );
  }

  if (type === "bxgy" && (details.buy_products == null || details.get_products == null || details.repition_limit == null)) {
    throw new ApiError(
      400,
      "Invalid input: buy_products, get_products and repition_limit is required for bxgy coupons"
    );
  }
}


export function validateCart({items}) {

  if (
    !items ||
    !Array.isArray(items) ||
    !items.every((item) => item.price != null && item.product_id != null && item.quantity != null)
  ) {
    throw new ApiError(
      400,
      "Invalid input: cartItems must be an array of objects with price, product_id and quantity defined"
    );
  }
}
