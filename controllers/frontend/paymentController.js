const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Order = require('../../models/Order');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.paymentVerify = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        try {
            // Update order payment info
            await Order.findOneAndUpdate(
                { orderId },
                {
                    paymentStatus: 'completed',
                    razorpay_order_id,
                    razorpay_payment_id
                }
            );

            res.json({ success: true, message: 'Payment verified and order updated!' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Failed to update order' });
        }

    } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
}

exports.createOrder = async (req, res) => {
    const { amount, orderId } = req.body; // amount in INR

    const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: orderId,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Razorpay order creation failed" });
    }
}