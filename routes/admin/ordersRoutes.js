const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const ordersController = require('../../controllers/admin/ordersController.js');
const authorize = require('../../middlewares/authorize'); // ensure correct path

const router = express.Router();

// List all orders (requires permission 'order:list')
router.get('/', adminAuth, authorize('order', 'list'), ordersController.getList);

// Fetch orders data via POST (treat as list/show)
router.post('/data', adminAuth, authorize('order', 'list'), ordersController.getData);

// Get single order details (requires permission 'order:show')
router.get('/:id', adminAuth, authorize('order', 'list'), ordersController.getDetail);
router.post('/:id/update-status',authorize('order', 'action'), ordersController.updateStatus)

module.exports = router;
