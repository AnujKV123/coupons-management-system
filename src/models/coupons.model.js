// models/CouponModel.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["cart-wise", "product-wise", "bxgy"],
  },
  details: {
    threshold: { type: Number, required: false, min: 0 },
    discount: { type: Number, required: false, min: 0 },
    product_id: { type: String, required: false },
    discount: { type: Number, required: false, min: 0 },
    buy_products: [{product_id: { type: String }, quantity: { type: Number }}],
    get_products: [{product_id: { type: String }, quantity: { type: Number }}],
    repition_limit: { type: Number, required: false },
  },
  expiryDate: { type: Date, required: true },
}, {timestamps: true});

const CouponModel = mongoose.model("Coupon", couponSchema);

export default CouponModel;
