const User = require('../../models/User');


exports.dashboard = (req, res) => {
  res.render('admin/dashboard',{ title: "Dashboard" });
};


const Order = require('../../models/Order');

exports.getDashboardStats = async (req, res) => {
  try {
    // Users & Drivers
    const totalUsers = await User.countDocuments({ user_type: 'customer', otp_verify: true });
    const totalDrivers = await User.countDocuments({ user_type: 'driver', otp_verify: true });

    // Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Orders
    const todayOrdersData = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const monthOrdersData = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const latestPendingOrders = await Order.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderId customerName customerMobile totalAmount status createdAt")
      .lean();

    res.json({
      totalUsers,
      totalDrivers,
      todaySales: todayOrdersData[0]?.totalSales || 0,
      todayOrders: todayOrdersData[0]?.totalOrders || 0,
      monthSales: monthOrdersData[0]?.totalSales || 0,
      monthOrders: monthOrdersData[0]?.totalOrders || 0,
      latestPendingOrders
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err });
  }
};

exports.getLatestPendingOrders = async (req, res) => {
  try {
    const latestPendingOrders = await Order.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    res.json(latestPendingOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



