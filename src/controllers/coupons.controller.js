import {
  validateCart,
  validateCouponFields,
} from "../services/validators.service.js";
import CouponModel from "../models/coupons.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

// Create a new coupon
export const createNewCoupon = asyncHandler(async (req, res) => {
  validateCouponFields(req.body);
  const newCoupon = new CouponModel(req.body);
  await newCoupon.save();
  return res
    .status(201)
    .json(new ApiResponse(201, newCoupon, "Coupon created successfully"));
});

// Retrieve all coupons
export const getAllCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const coupons = await CouponModel.find({})
    .skip(limit * (page - 1))
    .limit(limit);
  return res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons retrieved successfully"));
});

// Retrieve a specific coupon by its ID or Unique Code
export const getCouponById = asyncHandler(async (req, res) => {
  const { id: idOrCode } = req.params;

  const coupon = isValidObjectId(idOrCode)
    ? await CouponModel.findById(idOrCode)
    : await CouponModel.findOne({ _id: idOrCode });
  if (!coupon) throw new ApiError(404, "Coupon not found");

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon retrieved successfully"));
});

// Update a specific coupon by its ID or Unique Code
export const updateCouponById = asyncHandler(async (req, res) => {
  validateCouponFields(req.body);

  const { id: idOrCode } = req.params;

  const coupon = isValidObjectId(idOrCode)
    ? await CouponModel.findByIdAndUpdate(idOrCode, req.body, { new: true })
    : await CouponModel.findOneAndUpdate({ _id: idOrCode }, req.body, {
        new: true,
      });
  if (!coupon) throw new ApiError(404, "Coupon not found");

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

// Delete a specific coupon by its ID or Unique Code
export const deleteCouponById = asyncHandler(async (req, res) => {
  const { id: idOrCode } = req.params;
  const coupon = isValidObjectId(idOrCode)
    ? await CouponModel.findByIdAndDelete(idOrCode)
    : await CouponModel.findOneAndDelete({ _id: idOrCode });

  if (!coupon) throw new ApiError(404, "Coupon not found");

  return res
    .status(204)
    .json(new ApiResponse(204, null, "Coupon deleted successfully"));
});

// Fetch all applicable coupons for a given cart
export const fetchApplicableCoupons = asyncHandler(async (req, res) => {
  const { cart } = req.body;

  validateCart(cart);

  if (cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty or invalid." });
  }

  let totalPrice = 0;

  // Calculate the total cart price
  cart.items.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  // Fetch all valid coupons
  const applicableCoupons = await CouponModel.aggregate([
    {
      $match: {
        expiryDate: { $gte: new Date() }, // Include only non-expired coupons
      },
    },
  ]);

  const couponsResponse = [];

  // Process each coupon and check applicability
  for (const coupon of applicableCoupons) {
    let discount = 0;

    if (coupon.type === "cart-wise") {
      // Cart-wise coupon: Apply if cart total exceeds the threshold
      if (totalPrice >= coupon.details.threshold) {
        discount = (totalPrice * coupon.details.discount) / 100;
        couponsResponse.push({
          coupon_id: coupon._id,
          type: coupon.type,
          discount,
        });
      }
    }

    if (coupon.type === "product-wise") {
      // Product-wise coupon: Apply if the product exists in the cart
      const productInCart = cart.items.find(
        (item) => item.product_id.toString() === coupon.details.product_id
      );

      if (productInCart) {
        const productDiscount =
          (productInCart.price * productInCart.quantity * coupon.details.discount) / 100;
        discount += productDiscount;
        couponsResponse.push({
          coupon_id: coupon._id,
          type: coupon.type,
          discount: productDiscount,
        });
      }
    }

    if (coupon.type === "bxgy") {
      // BxGy coupon logic
      const { buy_products, get_products, repetition_limit } = coupon.details;

      // Calculate "buy" condition satisfaction count
      let totalBuyCount = Infinity;

      for (const buyProduct of buy_products) {
        const cartItem = cart.items.find(
          (item) => item.product_id.toString() === buyProduct.product_id
        );
        if (cartItem) {
          const possibleRepetitions = Math.floor(cartItem.quantity / buyProduct.quantity);
          totalBuyCount = Math.min(totalBuyCount, possibleRepetitions);
        } else {
          totalBuyCount = 0;
        }
      }

      const repetitions = Math.min(totalBuyCount, repetition_limit || Infinity);

      if (repetitions > 0) {
        // Calculate the discount for free "get" products
        for (const getProduct of get_products) {
          const freeQuantity = repetitions * getProduct.quantity;
          const unitPrice = cart.items.find(
            (item) => item.product_id.toString() === getProduct.product_id
          )?.price || 0;

          discount += freeQuantity * unitPrice;
        }

        if (discount > 0) {
          couponsResponse.push({
            coupon_id: coupon._id,
            type: coupon.type,
            discount,
          });
        }
      }
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { applicable_coupons: couponsResponse },
        "Applicable coupons retrieved successfully"
      )
    );
});

// Apply a specific coupon to the cart
export const applyCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params; // Coupon ID
    const { cart } = req.body;

    validateCart(cart);

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or invalid." });
    }

    const coupon = await CouponModel.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired." });
    }

    let updatedCart = {
      items: cart.items.map((item) => ({
        ...item,
        total_discount: 0, // Initialize total_discount for each item
      })),
      total_price: 0,
      total_discount: 0,
      final_price: 0,
    };

    let totalPrice = 0;

    // Calculate total price of the cart
    cart.items.forEach((item) => {
      totalPrice += item.price * item.quantity;
    });

    if (coupon.type === "cart-wise") {
      // Cart-wise discount: Apply if the cart total exceeds the threshold
      if (totalPrice >= coupon.details.threshold) {
        const discount = (totalPrice * coupon.details.discount) / 100;
        updatedCart.total_discount += discount;
      }
    } else if (coupon.type === "product-wise") {
      // Product-wise discount: Apply discount to the specified product
      updatedCart.items = updatedCart.items.map((item) => {
        if (item.product_id.toString() === coupon.details.product_id) {
          const productDiscount = (item.price * item.quantity * coupon.details.discount) / 100;
          updatedCart.total_discount += productDiscount;
          return { ...item, total_discount: productDiscount };
        }
        return item;
      });
    } else if (coupon.type === "bxgy") {
      // BxGy discount: Handle buy X get Y free logic
      const { buy_products, get_products, repetition_limit } = coupon.details;
      let repetitions = Infinity;

      // Determine how many times the "buy" condition is met
      for (const buyProduct of buy_products) {
        const cartItem = cart.items.find(
          (item) => item.product_id.toString() === buyProduct.product_id
        );
        if (cartItem) {
          const possibleRepetitions = Math.floor(cartItem.quantity / buyProduct.quantity);
          repetitions = Math.min(repetitions, possibleRepetitions);
        } else {
          repetitions = 0;
        }
      }

      repetitions = Math.min(repetitions, repetition_limit || Infinity);

      if (repetitions > 0) {
        // Apply free "get" products
        for (const getProduct of get_products) {
          const freeQuantity = repetitions * getProduct.quantity;
          const cartItemIndex = updatedCart.items.findIndex(
            (item) => item.product_id.toString() === getProduct.product_id
          );

          if (cartItemIndex >= 0) {
            // Add free items to the existing item in the cart
            updatedCart.items[cartItemIndex].quantity += freeQuantity;
            updatedCart.total_discount += freeQuantity * updatedCart.items[cartItemIndex].price;
          } else {
            // Add new "get" product to the cart
            updatedCart.items.push({
              product_id: getProduct.product_id,
              quantity: freeQuantity,
              price: 0, // Free product
              total_discount: freeQuantity * getProduct.price,
            });
            updatedCart.total_discount += freeQuantity * getProduct.price;
          }
        }
      }
    }

    // Calculate final prices
    updatedCart.total_price = totalPrice;
    updatedCart.final_price = totalPrice - updatedCart.total_discount;

  return res
    .status(200)
    .json(new ApiResponse(200, { updated_cart: updatedCart }, "Coupon applied successfully"));
});
