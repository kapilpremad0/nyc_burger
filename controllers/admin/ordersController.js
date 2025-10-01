const Order = require('../../models/Order');
const User = require('../../models/User');

// 📌 List Page Render
exports.getList = async (req, res) => {
    try {
        res.render('admin/orders/list', { title: "Orders" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { paymentStatus, status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { paymentStatus, status });
        res.redirect(`/admin/orders/${req.params.id}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// 📌 Order Detail Page
exports.getDetail = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("branch", "name")        // only get branch name
            .populate("order_from", "name");   // only get user name

        if (!order) {
            return res.status(404).render("admin/404", { title: "Order Not Found" });
        }

        res.render("admin/orders/show", {
            title: `Order ${order.orderId} Detail`,
            order,
        });
    } catch (err) {
        console.error("Order getDetail Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getData = async (req, res) => {
    try {
        const userId = req.user.id; // logged-in user ID

        // 1️⃣ Get user's branch and user_type
        const user = await User.findById(userId).select('branch user_type').lean();
        const userBranch = user?.branch; // branch ObjectId
        const isAdmin = user?.user_type === 'admin';

        // 2️⃣ Pagination & filters
        const draw = parseInt(req.body.draw) || 0;
        const start = parseInt(req.body.start) || 0;
        const length = parseInt(req.body.length) || 10;

        const search = req.body.search?.value?.trim() || "";
        const orderType = req.body.orderType || "";
        const paymentMethod = req.body.paymentMethod || "";
        const paymentStatus = req.body.paymentStatus || "";
        const status = req.body.status || "";
        let branchId = req.body.branchId || "";

        const query = {};

        // 3️⃣ Force branch filter for non-admin users
        if (userBranch) {
            query.branch = userBranch;
        } else if (isAdmin && branchId) {
            query.branch = branchId; // admin can filter by branch
        }

        // 4️⃣ General search
        if (search) {
            query.$or = [
                { orderId: new RegExp(search, "i") },
                { customerName: new RegExp(search, "i") },
                { customerMobile: new RegExp(search, "i") },
                { paymentStatus: new RegExp(search, "i") },
                { orderType: new RegExp(search, "i") },
            ];
        }

        // 5️⃣ Other filters
        if (orderType) query.orderType = orderType;
        if (paymentMethod) query.paymentMethod = paymentMethod;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (status) query.status = status;

        // 6️⃣ Records count
        const totalRecords = await Order.countDocuments();
        const filteredRecords = await Order.countDocuments(query);

        // 7️⃣ Fetch orders
        const data_fetch = await Order.find(query)
            .populate("branch", "name")
            .sort({ createdAt: -1 })
            .skip(start)
            .limit(length)
            .lean();

        // 8️⃣ Format for DataTable
        const data = data_fetch.map((order, index) => ({
            serial: start + index + 1,
            orderId: order.orderId,
            _id: order._id,
            customerName: order.customerName || "-",
            customerMobile: order.customerMobile || "-",
            branch: order.branch ? order.branch.name : "-",
            orderType: order.orderType || "-",
            paymentMethod: order.paymentMethod || "-",
            paymentStatus: order.paymentStatus || "-",
            status: order.status || "-",
            totalAmount: `₹${order.totalAmount.toFixed(2)}`,
            createdAt: order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "-",
        }));

        res.json({
            draw,
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data,
        });
    } catch (err) {
        console.error("Order getData Error:", err);
        res.status(500).json({ error: err.message });
    }
};
