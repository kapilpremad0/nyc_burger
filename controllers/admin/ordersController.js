const Order = require('../../models/Order');
const path = require('path');
const fs = require('fs');

exports.getList = async (req, res) => {
    try {
        res.render('admin/orders/list', { title: "Orders" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.render('admin/orders/show', {
      title: "User Detail", order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getData = async (req, res) => {
    try {
        const draw = parseInt(req.body.draw) || 0;
        const start = parseInt(req.body.start) || 0;
        const length = parseInt(req.body.length) || 10;
        const search = req.body.search?.value || "";
        const orderType = req.body.orderType || ""; // optional filter
        const paymentMethod = req.body.paymentMethod || ""; // optional filter

        const query = {};

        // 🔍 Search in customerName and customerMobile
        if (search) {
            query.$or = [
                { customerName: new RegExp(search, "i") },
                { customerMobile: new RegExp(search, "i") },
            ];
        }

        if (orderType) {
            query.orderType = orderType;
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        const totalRecords = await Order.countDocuments();
        const filteredRecords = await Order.countDocuments(query);

        const data_fetch = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(start)
            .limit(length)
            .exec();

        const data = data_fetch.map((order, index) => ({
            orderId: order.orderId,
            _id: order._id,
            status: order.status,
            serial: start + index + 1,
            customerName: order.customerName,
            customerMobile: order.customerMobile,
            orderType: order.orderType,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
        }));

        res.json({
            draw,
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data
        });
    } catch (err) {
        console.error("Order getData Error:", err);
        res.status(500).json({ error: err.message });
    }
};
