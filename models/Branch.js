// models/Branch.js
const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  address: { type: String },
  phone: { type: String },
  status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Branch", BranchSchema);
