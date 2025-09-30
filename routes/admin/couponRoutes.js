const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const couponController = require('../../controllers/admin/couponController.js');
const upload = require('../../middlewares/upload');
const authorize = require('../../middlewares/authorize'); // ensure path is correct

const router = express.Router();

// List coupons (show)
router.get('/', adminAuth, authorize('coupon', 'show'), couponController.getList);

// Show create coupon form (show)
router.get('/create', adminAuth, authorize('coupon', 'show'), couponController.create);

// Store new coupon (create)
router.post(
  '/',
  adminAuth,
  authorize('coupon', 'create'),
  upload.fields([{ name: "images", maxCount: 10 }, { name: "profile", maxCount: 1 }]),
  couponController.storeData
);

// Get single coupon details (show)
router.get('/:id', adminAuth, authorize('coupon', 'show'), couponController.getDetail);

// Show edit coupon form (show)
router.get('/edit/:id', adminAuth, authorize('coupon', 'show'), couponController.edit);

// Update coupon (update)
router.put(
  '/:id',
  adminAuth,
  authorize('coupon', 'update'),
  upload.fields([{ name: "images", maxCount: 10 }, { name: "profile", maxCount: 1 }]),
  couponController.updateData
);

// Fetch data via POST (treat as show)
router.post('/data', adminAuth, authorize('coupon', 'show'), couponController.getData);

// Delete coupon (delete)
router.delete('/:id', adminAuth, authorize('coupon', 'delete'), couponController.deleteRecord);

module.exports = router;
