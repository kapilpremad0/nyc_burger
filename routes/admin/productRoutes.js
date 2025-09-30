const express = require('express');
const adminAuth = require('../../middlewares/adminAuth.js');
const productController = require('../../controllers/admin/productController.js');
const upload = require('../../middlewares/upload.js');
const authorize = require('../../middlewares/authorize'); // make sure path is correct

const router = express.Router();

// List products (show)
router.get('/', adminAuth, authorize('product', 'show'), productController.getList);

// Show create product form (show)
router.get('/create', adminAuth, authorize('product', 'show'), productController.create);

// Store new product (create)
router.post(
  '/',
  adminAuth,
  authorize('product', 'create'),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]),
  productController.storeData
);

// Get single product details (show)
router.get('/:id', adminAuth, authorize('product', 'show'), productController.getDetail);

// Show edit product form (show)
router.get('/edit/:id', adminAuth, authorize('product', 'show'), productController.edit);

// Update product (update)
router.put(
  '/:id',
  adminAuth,
  authorize('product', 'update'),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]),
  productController.updateData
);

// Fetch data via POST (treat as show)
router.post('/data', adminAuth, authorize('product', 'show'), productController.getData);

// Delete product (delete)
router.delete('/:id', adminAuth, authorize('product', 'delete'), productController.deleteRecord);

module.exports = router;
