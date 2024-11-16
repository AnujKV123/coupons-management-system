import { Router } from "express";
import {
  getAllCoupons,
  createNewCoupon,
  getCouponById,
  updateCouponById,
  deleteCouponById,
  fetchApplicableCoupons,
  applyCoupon,
} from "../controllers/coupons.controller.js";

const router = Router();

router
  .route("/coupons/")
  .get(getAllCoupons) // Retrieve all coupons
  .post(createNewCoupon); // Create a new coupon

// Supports both Mongo Generated ID and Unique Coupon Code
router
  .route("/coupons/:id")
  .get(getCouponById) // Retrieve a specific coupon by its ID
  .put(updateCouponById) // Update a specific coupon by its ID
  .delete(deleteCouponById); // Delete a specific coupon by its ID

router.post("/applicable-coupons", fetchApplicableCoupons); //Fetch all applicable coupons for a given cart and calculate the total discount that will be applied by each coupon.
router.post("/apply-coupon/:id", applyCoupon); //Apply a specific coupon to the cart and return the updated cart with discounted prices for each item.

export default router;
