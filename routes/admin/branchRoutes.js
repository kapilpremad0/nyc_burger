const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const branchController = require('../../controllers/admin/branchController.js'); 
const upload = require('../../middlewares/upload');
const authorize = require('../../middlewares/authorize');

const router = express.Router();

// List branches (show)
router.get('/', adminAuth, authorize('branch', 'show'), branchController.getList);

// Show create branch form (show)
router.get('/create', adminAuth, authorize('branch', 'create'), branchController.create);

// Store new branch (create)
router.post(
    '/',
    adminAuth,
    authorize('branch', 'create'),
    upload.none(), // assuming no image for branch
    branchController.storeData
);

// Get single branch details (show)
router.get('/:id', adminAuth, authorize('branch', 'show'), branchController.getDetail);

// Show edit branch form (show)
router.get('/edit/:id', adminAuth, authorize('branch', 'update'), branchController.edit);

// Update branch (update)
router.put(
    '/:id',
    adminAuth,
    authorize('branch', 'update'),
    upload.none(),
    branchController.updateData
);

// Fetch data via POST (custom, treat as show)
router.post('/data', adminAuth, authorize('branch', 'show'), branchController.getData);

// Delete branch (delete)
router.delete('/:id', adminAuth, authorize('branch', 'delete'), branchController.deleteRecord);

module.exports = router;
