// controllers/admin/cityController.js
const City = require("../../models/City.js");

// 📌 Show list page
exports.getList = async (req, res) => {
    try {
        res.render("admin/cities/list", { title: "Cities" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Show create form
exports.create = async (req, res) => {
    try {
        res.render("admin/cities/create", { title: "Create City", city: null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Show edit form
exports.edit = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) return res.status(404).send("City not found");

        res.render("admin/cities/create", { title: "Edit City", city });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Show detail page
exports.getDetail = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) return res.status(404).send("City not found");

        res.render("admin/cities/show", { title: "City Details", city });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📌 Delete city
exports.deleteRecord = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) return res.status(404).json({ error: "City not found" });
        await City.findByIdAndDelete(req.params.id);

        res.json({ message: "City deleted successfully" });
    } catch (err) {
        console.error("Error deleting City:", err);
        res.status(500).json({ message: "Error deleting City", error: err.message });
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
            query.$or = [{ name: new RegExp(search, "i") }];
        }

        const totalRecords = await City.countDocuments();
        const filteredRecords = await City.countDocuments(query);

        const data_fetch = await City.find(query)
            .sort({ createdAt: -1 })
            .skip(start)
            .limit(length)
            .exec();

        const data = data_fetch.map((city, index) => ({
            serial: start + index + 1,
            name: city.name,
            status: city.status,
            action: `
    <div class="dropdown">
      <button type="button" class="btn btn-sm dropdown-toggle hide-arrow py-0" data-bs-toggle="dropdown">
        <i data-feather="more-vertical"></i>
      </button>
      <div class="dropdown-menu dropdown-menu-end">
        <a class="dropdown-item" href="/admin/cities/edit/${city._id}">
          <i data-feather="edit-2" class="me-50"></i>
          <span>Edit</span>
        </a>
        <a class="dropdown-item delete-city" href="#" data-id="${city._id}" data-name="${city.name}">
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

// 📌 Store city
exports.storeData = async (req, res) => {
    try {
        const { name, status } = req.body;

        const errors = {};
        if (!name) errors.name = "City name is required";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        const city = await City.create({
            name,
            status: status === "1" || status === true,
        });

        res.status(201).json({
            message: "City created successfully",
            data: city,
        });
    } catch (err) {
        console.error("Error saving City:", err);
        res.status(500).json({ error: "Failed to save City. Please try again later." });
    }
};

// 📌 Update city
exports.updateData = async (req, res) => {
    try {
        const cityId = req.params.id;
        const city = await City.findById(cityId);
        if (!city) return res.status(404).json({ error: "City not found" });

        const { name, status } = req.body;

        const errors = {};
        if (!name) errors.name = "City name is required";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        city.name = name;
        city.status = status === "1" || status === true;

        await city.save();

        res.status(200).json({
            message: "City updated successfully",
            data: city,
        });
    } catch (err) {
        console.error("Error updating City:", err);
        res.status(500).json({ error: "Failed to update City. Please try again later." });
    }
};
