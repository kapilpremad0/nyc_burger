
const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const homeController = require('../../controllers/frontend/homeController.js');
const ManageController = require('../../controllers/frontend/ManageController.js');
const paymentController = require('../../controllers/frontend/paymentController.js');
const router = express.Router();

router.get('/', homeController.index);
router.get('/contact', homeController.contact);


router.get('/pos', adminAuth, homeController.poc);


router.post('/select-branch', adminAuth, ManageController.selectBranch);
router.get('/menu', adminAuth, ManageController.menu);
router.post('/apply-coupon', adminAuth, ManageController.applyCoupon);
router.post('/checkout', adminAuth, ManageController.checkout);
router.get('/invoice/:orderId',ManageController.invoice);
router.get('/customers/search',ManageController.searchCustomer);


router.post('/payment/create-order',paymentController.createOrder);
router.post('/payment/verify',paymentController.paymentVerify);



module.exports = router;
