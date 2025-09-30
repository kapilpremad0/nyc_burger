const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const categoryController = require('../../controllers/admin/categoryController.js');
const upload = require('../../middlewares/upload');
const authorize = require('../../middlewares/authorize'); // updated path

const router = express.Router();

// List categories (show)
router.get('/', adminAuth, authorize('category', 'show'), categoryController.getList);

// Show create category form (show)
router.get('/create', adminAuth, authorize('category', 'create'), categoryController.create);

// Store new category (create)
router.post(
    '/',
    adminAuth,
    authorize('category', 'create'),
    upload.fields([{ name: "image", maxCount: 1 }]),
    categoryController.storeData
);

// Get single category details (show)
router.get('/:id', adminAuth, authorize('category', 'show'), categoryController.getDetail);

// Show edit category form (show)
router.get('/edit/:id', adminAuth, authorize('category', 'update'), categoryController.edit);

// Update category (update)
router.put(
    '/:id',
    adminAuth,
    authorize('category', 'update'),
    upload.fields([{ name: "image", maxCount: 1 }]),
    categoryController.updateData
);

// Fetch data via POST (custom, treat as show)
router.post('/data', adminAuth, authorize('category', 'show'), categoryController.getData);

// Delete category (delete)
router.delete('/:id', adminAuth, authorize('category', 'delete'), categoryController.deleteRecord);

module.exports = router;
