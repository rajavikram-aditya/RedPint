const router = require('express').Router();
const { verifyToken, requireRole, requireVerified } = require('../middleware/auth');
const hospitalStockController = require('../controllers/hospitalStock.controller');

// GET /api/hospital-stock — get stock (public, filterable by hospitalId)
router.get('/', hospitalStockController.getStock);

// PUT /api/hospital-stock — update stock for a blood group
router.put('/', verifyToken, requireRole('hospital'), requireVerified, hospitalStockController.updateStock);

// POST /api/hospital-stock/bulk — bulk update stock
router.post('/bulk', verifyToken, requireRole('hospital'), requireVerified, hospitalStockController.bulkUpdateStock);

module.exports = router;
