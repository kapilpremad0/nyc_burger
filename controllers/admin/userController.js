const User = require('../../models/User');
const Branch = require('../../models/Branch');
const bcrypt = require('bcryptjs');
const permissionsConfig = require('../../config/permissionsConfig');

exports.getList = async (req, res) => {
  try {
    res.render('admin/users/list', { title: "Staff Users" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const branches = await Branch.find({ status: true }).populate('city');
    res.render('admin/users/create', {
      title: "Create User",
      user: null,
      permissionsConfig,
      branches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.edit = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    const branches = await Branch.find({ status: true }).populate('city');

    res.render('admin/users/create', {
      title: "Edit User",
      user,
      permissionsConfig,
      branches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    const bookings = []; // Placeholder
    res.render('admin/users/show', { title: "User Detail", user, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err });
  }
};

exports.getData = async (req, res) => {
  try {
    const draw = parseInt(req.body.draw) || 0;
    const start = parseInt(req.body.start) || 0;
    const length = parseInt(req.body.length) || 10;
    const search = req.body.search?.value || "";
    const gender = req.body.gender;

    const query = { user_type: "staff", otp_verify: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
        { gender: new RegExp(search, "i") }
      ];
    }
    if (gender) query.gender = gender;

    const totalRecords = await User.countDocuments();
    const filteredRecords = await User.countDocuments(query);

    const data_fetch = await User.find(query)
      .populate({
        path: "branch",
        select: "name", // only get branch name
      })
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(length)
      .exec();

    const data = data_fetch.map(item => ({
      branch: item.branch ? item.branch.name : "-", // branch name added
      name: item.name_div,
      email: item.email,
      mobile: item.mobile,
      gender: item.gender,
      password: item.password2,
      dob: item.dob ? item.dob.toISOString().split("T")[0] : "",
      permissions: item.permissions || {},
      datetime: new Date(item.createdAt).toLocaleString(),
      action: `
    <div class="dropdown">
      <button type="button" class="btn btn-sm dropdown-toggle hide-arrow py-0" data-bs-toggle="dropdown">
        <i data-feather="more-vertical"></i>
      </button>
      <div class="dropdown-menu dropdown-menu-end">
        <a class="dropdown-item" href="/admin/users/edit/${item._id}">
          <i data-feather="edit-2" class="me-50"></i>
          <span>Edit</span>
        </a>
        <a class="dropdown-item delete-user" href="#" data-id="${item._id}" data-name="${item.name}">
          <i data-feather="trash" class="me-50"></i>
          <span>Delete</span>
        </a>
      </div>
    </div>
  `
    }));

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.storeData = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      gender,
      dob,
      permissions,
      ssn,
      emergencyContact,
      homeAddress,
      branch
    } = req.body || {};

    const profile = req.files?.profile?.[0];

    const errors = {};

    // Validation
    if (!name) errors.name = "Name is required";
    if (!branch) errors.branch = "Branch is required";
    if (!mobile) errors.mobile = "Mobile number is required";
    if (!password) errors.password = "Password is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (mobile && !/^[0-9]{10}$/.test(mobile)) errors.mobile = "Mobile must be a 10-digit number";
    if (dob && isNaN(Date.parse(dob))) errors.dob = "Invalid date of birth";

    // Uniqueness
    if (email && await User.findOne({ email })) errors.email = "Email already exists";
    if (mobile && await User.findOne({ mobile })) errors.mobile = "Mobile number already exists";

    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      password2: password,
      user_type: "staff",
      gender: gender || null,
      dob: dob ? new Date(dob) : null,
      profile: profile ? profile.filename : "",
      ssn: ssn || null,
      emergencyContact: emergencyContact || null,
      homeAddress: homeAddress || null,
      otp_verify: true,
      terms_conditions: true,
      permissions,
      branch
    });

    await user.save();

    return res.status(201).json({ message: "User created successfully", data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save user. Please try again later." });
  }
};

exports.updateData = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      email,
      mobile,
      password,
      gender,
      dob,
      ssn,
      emergencyContact,
      homeAddress,
      permissions,
      branch
    } = req.body || {};

    const profile = req.files?.profile?.[0];

    const errors = {};
    if (!name) errors.name = "Name is required";
    if (!branch) errors.branch = "Branch is required";
    if (!mobile) errors.mobile = "Mobile number is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (mobile && !/^[0-9]{10}$/.test(mobile)) errors.mobile = "Mobile must be a 10-digit number";
    if (dob && isNaN(Date.parse(dob))) errors.dob = "Invalid date of birth";
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // Uniqueness excluding current user
    if (email && await User.findOne({ email, _id: { $ne: userId } })) {
      return res.status(400).json({ errors: { email: "Email already exists" } });
    }
    if (mobile && await User.findOne({ mobile, _id: { $ne: userId } })) {
      return res.status(400).json({ errors: { mobile: "Mobile number already exists" } });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.gender = gender || null;
    user.dob = dob ? new Date(dob) : null;
    user.permissions = permissions || {};
    user.profile = profile ? profile.filename : user.profile;
    user.ssn = ssn || null;
    user.emergencyContact = emergencyContact || null;
    user.homeAddress = homeAddress || null;
    user.branch = branch;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.password2 = password;
    }

    await user.save();

    return res.status(200).json({ message: "User updated successfully", data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update user. Please try again later." });
  }
};
