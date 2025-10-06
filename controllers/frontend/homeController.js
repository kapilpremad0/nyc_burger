const Branch = require("../../models/Branch");

exports.index = async (req, res) => {
  const branches = await Branch.find({ status: true });
  res.render('frontend/index', { title: "Dashboard", layout: false, branches });
};

exports.contact = async (req, res) => {
  res.render('frontend/contact', { title: "Dashboard", layout: false });
};

exports.poc = async (req, res) => {
  const branches = await Branch.find({ status: true });
  res.render('frontend/poc', { title: "Dashboard", layout: false, branches });
};
