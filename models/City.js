const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true }, // active/inactive
}, { timestamps: true });

module.exports = mongoose.model("City", CitySchema);
