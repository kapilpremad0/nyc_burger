const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: function () {
      // Generates something like "NYC-123456"
      return "NYC-" + Math.floor(100000 + Math.random() * 900000);
    }
  },
  cart: {
    type: Array,
    default: null
  },
  customerName: {
    type: String,
    default: null
  },
  customerMobile: {
    type: String,
    default: null
  },
  orderType: {
    type: String,
    enum: ["dinein", "takeaway"],
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: 'cash'
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  coupon: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "baked", "delivered"],
    default: 'pending'
  },
  order_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
