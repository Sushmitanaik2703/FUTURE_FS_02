const express = require('express');
const router = express.Router();
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  addLeadNote,
  deleteLead,
  getAnalytics,
  exportLeadsCSV
} = require('../controllers/lead.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateStatusUpdate, validateNoteAddition } = require('../middleware/validate.middleware');

// All lead routes require JWT admin authentication
router.use(authenticateToken);

router.get('/analytics', getAnalytics);
router.get('/export', exportLeadsCSV);
router.get('/', getAllLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.patch('/:id/status', validateStatusUpdate, updateLeadStatus);
router.post('/:id/notes', validateNoteAddition, addLeadNote);
router.delete('/:id', deleteLead);

module.exports = router;
