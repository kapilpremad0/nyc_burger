const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    image: {
      type: String, // main image
      default: null,
    },
    images: [
      {
        type: String, // multiple additional images
      },
    ],
    status: {
      type: Boolean,
      default: true, // true = active, false = inactive
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Optional: virtual property to get full URL of main image
ProductSchema.virtual("image_url").get(function () {
  if (this.image) return `/uploads/${this.image}`;
  return null;
});

// Optional: virtual property to get full URLs for all additional images
ProductSchema.virtual("images_url").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images.map(img => `/uploads/${img}`);
  }
  return [];
});

module.exports = mongoose.model("Product", ProductSchema);
