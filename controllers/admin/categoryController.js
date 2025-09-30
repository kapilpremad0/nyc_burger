// controllers/admin/categoryController.js
const Category = require("../../models/Category.js");
const path = require("path");
const fs = require("fs");

// 📌 Show list page
exports.getList = async (req, res) => {
    try {
        res.render("admin/categories/list", { title: "Categories" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Show create form
exports.create = async (req, res) => {
    try {
        res.render("admin/categories/create", { title: "Create Category", category: null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Show edit form
exports.edit = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send("Category not found");

        res.render("admin/categories/create", { title: "Edit Category", category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Show detail page
exports.getDetail = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send("Category not found");

        res.render("admin/categories/show", { title: "Category Details", category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Delete category
exports.deleteRecord = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ error: "Category not found" });
        await Category.findByIdAndDelete(req.params.id);

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Error deleting Category:", err);
        res.status(500).json({ message: "Error deleting Category", error: err.message });
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

        const totalRecords = await Category.countDocuments();
        const filteredRecords = await Category.countDocuments(query);

        const data_fetch = await Category.find(query)
            .sort({ createdAt: -1 })
            .skip(start)
            .limit(length)
            .exec();

        const data = data_fetch.map((category, index) => ({
            serial: start + index + 1,
            name: category.name,
            status: category.status,

            description: category.description || "",
            image: category.image_url,
            action: `
    <div class="dropdown">
      <button type="button" class="btn btn-sm dropdown-toggle hide-arrow py-0" data-bs-toggle="dropdown">
        <i data-feather="more-vertical"></i>
      </button>
      <div class="dropdown-menu dropdown-menu-end">
        <a class="dropdown-item" href="/admin/categories/edit/${category._id}">
          <i data-feather="edit-2" class="me-50"></i>
          <span>Edit</span>
        </a>
        <a class="dropdown-item delete-category" href="#" data-id="${category._id}" data-name="${this.name}">
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

// 📌 Store category
exports.storeData = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const image = req.files?.image?.[0] ?? null;

        const errors = {};
        if (!name) errors.name = "Category name is required";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        const category = await Category.create({
            name,
            description,
            status: status === "1" || status === true,
            image: image ? image.filename : "",
        });

        res.status(201).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (err) {
        console.error("Error saving Category:", err);
        res.status(500).json({ error: "Failed to save Category. Please try again later." });
    }
};

// 📌 Update category
exports.updateData = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ error: "Category not found" });

        const { name, description, status } = req.body;
        // const image = req.file ? req.file.filename : category.image;

        const image = req.files?.image?.[0] ?? null;

        const errors = {};
        if (!name) errors.name = "Category name is required";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        // remove old image if new one uploaded
        if (req.file && category.image) {
            const filePath = path.join(__dirname, "../../public/uploads/categories", category.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        category.name = name;
        category.description = description;
        category.status = status === "1" || status === true;
        category.image = image ? image.filename : category.image;

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (err) {
        console.error("Error updating Category:", err);
        res.status(500).json({ error: "Failed to update Category. Please try again later." });
    }
};
