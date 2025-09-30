const express = require('express');
const router = express.Router();

// Admin subroutes
router.use('/', require('../admin/homeRoutes'));

router.use('/users', require('../admin/userRoutes'));
router.use('/categories', require('../admin/categoryRoutes'));
router.use('/products', require('../admin/productRoutes'));
router.use('/coupons', require('./couponRoutes.js'));
router.use('/orders', require('./ordersRoutes.js'));
router.use('/cities', require('./cityRoutes.js'));
router.use('/branches', require('./branchRoutes.js'));



module.exports = router;
