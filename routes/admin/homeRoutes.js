const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const homeController = require('../../controllers/admin/homeController');
const loginController = require('../../controllers/admin/loginController');
const router = express.Router();

router.get('/', adminAuth, homeController.dashboard);
router.get('/latest-pending-orders', adminAuth, homeController.getLatestPendingOrders);

router.get('/login', loginController.showLoginPage)
router.post('/login', loginController.login)
router.get('/logout', loginController.logout)
router.get('/stats',adminAuth, homeController.getDashboardStats)


module.exports = router;
