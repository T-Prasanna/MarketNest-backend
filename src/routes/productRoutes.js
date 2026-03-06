const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getProducts);

// Protected brand routes (must come before /:id route)
router.get('/brand/my-products', authenticate, authorize('brand'), productController.getBrandProducts);
router.get('/brand/dashboard-stats', authenticate, authorize('brand'), productController.getDashboardStats);
router.post('/', authenticate, authorize('brand'), upload.array('images', 5), productController.createProduct);
router.put('/:id', authenticate, authorize('brand'), upload.array('images', 5), productController.updateProduct);
router.delete('/:id', authenticate, authorize('brand'), productController.deleteProduct);

// Public route with parameter (must come after specific routes)
router.get('/:id', productController.getProductById);

module.exports = router;
