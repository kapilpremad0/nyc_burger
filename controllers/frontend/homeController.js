

exports.home = async (req, res) => {
  const branches = await Branch.find({ status: true });
  res.render('frontend/index', { title: "Dashboard", layout: false, branches });
};

const Category = require("../../models/Category");
const Coupon = require("../../models/Coupon");
const Product = require("../../models/Product");
const Branch = require("../../models/Branch");
const Order = require("../../models/Order");
const { sendWhatsApp } = require('../../utils/whatsappUtils');
const User = require("../../models/User");

exports.selectBranch = async (req, res) => {
  let { branch, type } = req.body;
  const userId = req.user._id;

  if (!branch || branch === "") {
    branch = null;
  }


  await User.findByIdAndUpdate(userId, { branch });

  req.user.branch = branch; // update session/local user too
  if (type === 'dashboard') {
    return res.json({
      success: true,
      redirect: '/admin/'
    });
  }
  res.redirect("/"); // back to POS page
}

exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || !cartTotal) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const now = new Date();
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.json({ success: false, message: "Invalid coupon" });
    if (coupon.validFrom > now || coupon.validTo < now) {
      return res.json({ success: false, message: "Coupon not valid at this time" });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.json({ success: false, message: `Minimum purchase of ₹${coupon.minPurchase} required` });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ success: false, message: "Coupon usage limit reached" });
    }

    // Check per-user usage (optional)
    // const user = await User.findById(userId);
    // const userUsageCount = user?.usedCoupons?.filter(c => c.toString() === coupon._id.toString()).length || 0;
    // if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
    //   return res.json({ success: false, message: "You have already used this coupon" });
    // }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "flat") {
      discount = coupon.discountValue;
    } else if (coupon.type === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    }

    const finalAmount = cartTotal - discount;

    // Update coupon usage
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    await coupon.save();

    // Track coupon for user
    // if (user) {
    //   user.usedCoupons = user.usedCoupons || [];
    //   if (!user.usedCoupons.includes(coupon._id)) user.usedCoupons.push(coupon._id);
    //   await user.save();
    // }

    return res.json({ success: true, discount, finalAmount, message: "Coupon applied successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


exports.checkout = async (req, res) => {
  try {
    const { cart, customerName, customerMobile, orderType, paymentMethod, coupon } = req.body;

    // const message = 'Hello! Your order has been confirmed. Thank you for shopping with us.';
    // const recipient = '+919079758684';
    // await sendWhatsApp(recipient, message);

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    let discount = 0;

    // Apply coupon if exists
    if (coupon) {
      const dbCoupon = await Coupon.findOne({ code: coupon, isActive: true });
      if (dbCoupon) {
        if (dbCoupon.type === "flat") discount = dbCoupon.discountValue;
        if (dbCoupon.type === "percentage") discount = Math.min(totalAmount * (dbCoupon.discountValue / 100), dbCoupon.maxDiscount);
        totalAmount -= discount;

        // Update coupon usage
        dbCoupon.usedCount += 1;
        await dbCoupon.save();
      }
    }

    const order = await Order.create({
      cart,
      customerName,
      customerMobile,
      orderType,
      paymentMethod,
      coupon,
      totalAmount
    });

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to place order" });
  }
}


exports.menu = async (req, res) => {
  try {
    // fetch only active categories
    const categories = await Category.find({ status: true })
      .sort({ createdAt: 1 })
      .lean({ virtuals: true });

    // fetch only active products and populate category
    const products = await Product.find({ status: true })
      .populate("category")
      .lean({ virtuals: true });

    // map products into categories
    const data = categories.map(cat => {
      const catProducts = products
        .filter(p => p.category && p.category._id.toString() === cat._id.toString())
        .map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          desc: p.description,
          img: p.image || "/uploads/default.png",
        }));

      return {
        id: cat._id,                          // or slug if you have one
        title: cat.name,
        subtitle: cat.description || "",
        img: cat.image,                   // from virtual
        items: catProducts,
      };
    });

    return res.json(data);
  } catch (err) {
    console.error("Error building menu:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
