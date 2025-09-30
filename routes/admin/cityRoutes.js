const express = require('express');
const adminAuth = require('../../middlewares/adminAuth');
const cityController = require('../../controllers/admin/cityController.js'); 
const upload = require('../../middlewares/upload');
const authorize = require('../../middlewares/authorize');

const router = express.Router();

// List cities (show)
router.get('/', adminAuth, authorize('city', 'show'), cityController.getList);

// Show create city form (show)
router.get('/create', adminAuth, authorize('city', 'create'), cityController.create);

// Store new city (create)
router.post(
    '/',
    adminAuth,
    authorize('city', 'create'),
    upload.none(), // city probably won't have an image, keep none
    cityController.storeData
);

// Get single city details (show)
router.get('/:id', adminAuth, authorize('city', 'show'), cityController.getDetail);

// Show edit city form (show)
router.get('/edit/:id', adminAuth, authorize('city', 'update'), cityController.edit);

// Update city (update)
router.put(
    '/:id',
    adminAuth,
    authorize('city', 'update'),
    upload.none(),
    cityController.updateData
);

// Fetch data via POST (custom, treat as show)
router.post('/data', adminAuth, authorize('city', 'show'), cityController.getData);

// Delete city (delete)
router.delete('/:id', adminAuth, authorize('city', 'delete'), cityController.deleteRecord);

module.exports = router;
