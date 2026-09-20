const router = require('express').Router();
const { verifyToken, requireRole, requireVerified } = require('../middleware/auth');
const bloodRequestController = require('../controllers/bloodRequest.controller');

// GET /api/blood-requests — get all open requests
router.get('/', verifyToken, requireRole('hospital'), bloodRequestController.getAllRequests);

// POST /api/blood-requests — hospital creates a blood request (triggers matching)
router.post('/', verifyToken, requireRole('hospital'), requireVerified, bloodRequestController.createRequest);

// POST /api/blood-requests/inter-hospital — hospital-to-hospital request
router.post('/inter-hospital', verifyToken, requireRole('hospital'), requireVerified, bloodRequestController.createInterHospitalRequest);

// GET /api/blood-requests/:id — get a blood request
router.get('/:id', verifyToken, bloodRequestController.getRequest);

// GET /api/blood-requests/:id/matches — get matches for a request
router.get('/:id/matches', verifyToken, requireRole('hospital'), bloodRequestController.getMatchesForRequest);

// GET /api/hospitals/me/requests is mounted on hospital routes — but we also provide it here
router.get('/hospital/my-requests', verifyToken, requireRole('hospital'), bloodRequestController.getMyRequests);

module.exports = router;
