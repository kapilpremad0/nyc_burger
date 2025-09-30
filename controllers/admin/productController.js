const Product = require("../../models/Product.js");
const Category = require("../../models/Category.js");
const path = require("path");
const fs = require("fs");

// 📌 Show list page
exports.getList = async (req, res) => {
  try {
    res.render("admin/products/list", { title: "Products" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Show create form
exports.create = async (req, res) => {
  try {
    const categories = await Category.find({ status: true }); // active categories
    res.render("admin/products/create", { title: "Create Product", product: null, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Show edit form
exports.edit = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).send("Product not found");

    const categories = await Category.find({ status: true });
    res.render("admin/products/create", { title: "Edit Product", product, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Show detail page
exports.getDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).send("Product not found");

    res.render("admin/products/show", { title: "Product Details", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete product
exports.deleteRecord = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // remove main image
    if (product.image) {
      const filePath = path.join(__dirname, "../../public/uploads/products", product.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // remove additional images
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const imgPath = path.join(__dirname, "../../public/uploads/products", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting Product:", err);
    res.status(500).json({ message: "Error deleting Product", error: err.message });
  }
};

// 📌 Datatable JSON
exports.getData = async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 0;
    const start = parseInt(req.body.start) || 0;
    const length = parseInt(req.body.length) || 10;
    const search = req.body.search?.value || "";

    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ];
    }

    const totalRecords = await Product.countDocuments();
    const filteredRecords = await Product.countDocuments(query);

    const data_fetch = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(length)
      .exec();

    const data = data_fetch.map((product, index) => ({
      serial: start + index + 1,
      name: product.name,
      category: product.category?.name || "—",
      mrp: product.mrp ? `₹${product.mrp}` : "—",
      price: product.price ? `₹${product.price}` : "—",
      status: product.status,
      description: product.description || "",
      image: product.image,
      action: `
        <div class="dropdown">
          <button type="button" class="btn btn-sm dropdown-toggle hide-arrow py-0" data-bs-toggle="dropdown">
            <i data-feather="more-vertical"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            <a class="dropdown-item" href="/admin/products/edit/${product._id}">
              <i data-feather="edit-2" class="me-50"></i>
              <span>Edit</span>
            </a>
            <a class="dropdown-item delete-product" href="#" data-id="${product._id}" data-name="${product.name}">
              <i data-feather="trash" class="me-50"></i>
              <span>Delete</span>
            </a>
          </div>
        </div>
      `,
    }));

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Store product
exports.storeData = async (req, res) => {
  try {
    const { name, description, status, mrp, price, category } = req.body;
    const image = req.files?.image?.[0] ?? null;
    const images = req.files?.images?.map(file => file.filename) || [];

    const errors = {};
    if (!name) errors.name = "Product name is required";
    if (!category) errors.category = "Category is required";
    if (!mrp) errors.mrp = "MRP is required";
    if (!price) errors.price = "Selling price is required";

    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    const product = await Product.create({
      name,
      description,
      mrp,
      price,
      category,
      status: status === "1" || status === true,
      image: image ? image.filename : "",
      images,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error saving Product:", err);
    res.status(500).json({ error: "Failed to save Product. Please try again later." });
  }
};

// 📌 Update product
exports.updateData = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { name, description, status, mrp, price, category } = req.body;
    const image = req.files?.image?.[0] ?? null;
    const newImages = req.files?.images?.map(file => file.filename) || [];

    const errors = {};
    if (!name) errors.name = "Product name is required";
    if (!category) errors.category = "Category is required";
    if (!mrp) errors.mrp = "MRP is required";
    if (!price) errors.price = "Selling price is required";

    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // remove old main image if new uploaded
    if (image && product.image) {
      const filePath = path.join(__dirname, "../../public/uploads/", product.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // append new additional images
    const allImages = [...(product.images || []), ...newImages];

    product.name = name;
    product.description = description;
    product.mrp = mrp;
    product.price = price;
    product.category = category;
    product.status = status === "1" || status === true;
    product.image = image ? image.filename : product.image;
    product.images = allImages;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error updating Product:", err);
    res.status(500).json({ error: "Failed to update Product. Please try again later." });
  }
};
