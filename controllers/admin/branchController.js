// controllers/admin/branchController.js
const Branch = require("../../models/Branch.js");
const City = require("../../models/City.js");

// 📌 Show list page
exports.getList = async (req, res) => {
  try {
    res.render("admin/branches/list", { title: "Branches" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Show create form
exports.create = async (req, res) => {
  try {
    const cities = await City.find({ status: true }).sort({ name: 1 });
    res.render("admin/branches/create", { title: "Create Branch", branch: null, cities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Show edit form
exports.edit = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).send("Branch not found");

    const cities = await City.find({ status: true }).sort({ name: 1 });

    res.render("admin/branches/create", { title: "Edit Branch", branch, cities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Show detail page
exports.getDetail = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate("city");
    if (!branch) return res.status(404).send("Branch not found");

    res.render("admin/branches/show", { title: "Branch Details", branch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete branch
exports.deleteRecord = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ error: "Branch not found" });

    await Branch.findByIdAndDelete(req.params.id);

    res.json({ message: "Branch deleted successfully" });
  } catch (err) {
    console.error("Error deleting Branch:", err);
    res.status(500).json({ message: "Error deleting Branch", error: err.message });
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
        { address: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const totalRecords = await Branch.countDocuments();
    const filteredRecords = await Branch.countDocuments(query);

    const data_fetch = await Branch.find(query)
      .populate("city", "name")
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(length)
      .exec();

    const data = data_fetch.map((branch, index) => ({
      serial: start + index + 1,
      name: branch.name,
      address: branch.address,
      city: branch.city ? branch.city.name : "-",
      phone: branch.phone || "-",
      status: branch.status,
      action: `
        <div class="dropdown">
          <button type="button" class="btn btn-sm dropdown-toggle hide-arrow py-0" data-bs-toggle="dropdown">
            <i data-feather="more-vertical"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            
            <a class="dropdown-item" href="/admin/branches/edit/${branch._id}">
              <i data-feather="edit-2" class="me-50"></i>
              <span>Edit</span>
            </a>
            <a class="dropdown-item delete-branch" href="#" data-id="${branch._id}" data-name="${branch.name}">
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

// 📌 Store branch
exports.storeData = async (req, res) => {
  try {
    const { name, city, address, phone, status } = req.body;

    const errors = {};
    if (!name) errors.name = "Branch name is required";
    if (!city) errors.city = "City is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const branch = await Branch.create({
      name,
      city,
      address,
      phone,
      status: status === "1" || status === true,
    });

    res.status(201).json({
      message: "Branch created successfully",
      data: branch,
    });
  } catch (err) {
    console.error("Error saving Branch:", err);
    res.status(500).json({ error: "Failed to save Branch. Please try again later." });
  }
};

// 📌 Update branch
exports.updateData = async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ error: "Branch not found" });

    const { name, city, address, phone, status } = req.body;

    const errors = {};
    if (!name) errors.name = "Branch name is required";
    if (!city) errors.city = "City is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    branch.name = name;
    branch.city = city;
    branch.address = address;
    branch.phone = phone;
    branch.status = status === "1" || status === true;

    await branch.save();

    res.status(200).json({
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (err) {
    console.error("Error updating Branch:", err);
    res.status(500).json({ error: "Failed to update Branch. Please try again later." });
  }
};
