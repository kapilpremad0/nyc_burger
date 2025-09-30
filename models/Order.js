const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: function() {
      // Generates something like "NYC-123456"
      return "NYC-" + Math.floor(100000 + Math.random() * 900000);
    }
  },
  cart: Array,
  customerName: String,
  customerMobile: String,
  orderType: { type: String, enum: ["dinein", "takeaway"], default: "dinein" },
  paymentMethod: { type: String, enum: ["cash", "online"], default: "cash" },
  coupon: String,
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ["pending", "baked", "delivered"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
