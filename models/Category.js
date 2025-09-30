// models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true, // true = active, false = inactive
    },
    image: {
      type: String, // store image URL or file path
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
  },
 { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


CategorySchema.virtual('image_url').get(function () {
  // if (!this.image) return null;

  // Use env BASE_URL or fallback to localhost
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  if (!this.image) {
    const id = this._id ? this._id.toString().slice(-1) : 1; // last digit for variation


    const avatarNumber = (id % 5) + 1; // Results in 1 to 5


    return `${baseUrl}/avatars/avatar${avatarNumber}.png`;
  }

  // If already full URL, return as is
  if (this.image.startsWith('http')) return this.image;

  // Otherwise build the full URL
  const uploadPath = `/uploads/${this.image}`;

  return `${baseUrl}${uploadPath}`;
});


module.exports = mongoose.model("Category", CategorySchema);
