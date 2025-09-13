import express from 'express';
import {
  createAlert,
  getActiveAlerts,
  sendAlertNotifications,
  deleteAlert
} from '../controllers/alert.controller.js';

const router = express.Router();

router.post('/', createAlert);
router.get('/active', getActiveAlerts);
router.post('/:id/send', sendAlertNotifications);
router.delete('/:id', deleteAlert);

export default router;