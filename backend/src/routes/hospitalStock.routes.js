const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const hospitalStockController = require('../controllers/hospitalStock.controller');

// GET /api/hospital-stock — get stock (public, filterable by hospitalId)
router.get('/', hospitalStockController.getStock);

// PUT /api/hospital-stock — update stock for a blood group
router.put('/', verifyToken, requireRole('hospital'), hospitalStockController.updateStock);

// POST /api/hospital-stock/bulk — bulk update stock
router.post('/bulk', verifyToken, requireRole('hospital'), hospitalStockController.bulkUpdateStock);

module.exports = router;
