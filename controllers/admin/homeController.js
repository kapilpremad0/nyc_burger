const User = require('../../models/User');
const Order = require('../../models/Order');

exports.dashboard = (req, res) => {
  res.render('admin/dashboard', { title: "Dashboard" });
};



exports.getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Get logged-in user
    const userId = req.user.id;
    const user = await User.findById(userId).select('branch user_type').lean();
    const userBranch = user?.branch;
    const isAdmin = user?.user_type === 'admin';

    // 2️⃣ Base match for branch filtering
    const branchMatch = userBranch ? { branch: userBranch } : {};

    // 3️⃣ Users & Drivers
    const totalUsers = await User.countDocuments({ user_type: 'customer', otp_verify: true });
    const totalDrivers = await User.countDocuments({ user_type: 'driver', otp_verify: true });

    // 4️⃣ Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 5️⃣ Orders - Today
    const todayOrdersData = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, ...branchMatch } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // 6️⃣ Orders - This Month
    const monthOrdersData = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, ...branchMatch } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // 8️⃣ Response
    res.json({
      todaySales: todayOrdersData[0]?.totalSales || 0,
      todayOrders: todayOrdersData[0]?.totalOrders || 0,
      monthSales: monthOrdersData[0]?.totalSales || 0,
      monthOrders: monthOrdersData[0]?.totalOrders || 0,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

exports.getLatestPendingOrders = async (req, res) => {
  try {
    // 1️⃣ Get logged-in user
    const userId = req.user.id;
    const user = await User.findById(userId).select('branch user_type').lean();
    const userBranch = user?.branch;
    const isAdmin = user?.user_type === 'admin';

    // 2️⃣ Build query
    const query = { status: 'pending' };
    if (userBranch) {
      query.branch = userBranch; // filter for non-admins
    }

    // 3️⃣ Fetch latest pending orders
    const latestPendingOrders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('branch', 'name') // optional: include branch name
      .lean();

    res.json(latestPendingOrders);
  } catch (err) {
    console.error("Error fetching latest pending orders:", err);
    res.status(500).json({ error: err.message });
  }
};



