
const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const homeController = require('../../controllers/frontend/homeController.js');
const paymentController = require('../../controllers/frontend/paymentController.js');
const router = express.Router();

router.get('/', adminAuth, homeController.home);
router.post('/select-branch', adminAuth, homeController.selectBranch);
router.get('/menu', adminAuth, homeController.menu);
router.post('/apply-coupon', adminAuth, homeController.applyCoupon);
router.post('/checkout', adminAuth, homeController.checkout);
router.get('/invoice/:orderId',homeController.invoice);
router.get('/customers/search',homeController.searchCustomer);


router.post('/payment/create-order',paymentController.createOrder);
router.post('/payment/verify',paymentController.paymentVerify);



module.exports = router;
