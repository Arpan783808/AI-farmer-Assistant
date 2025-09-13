import express from 'express';
import {
  createAlert,
  getActiveAlerts,
  sendAlertNotifications
} from '../controllers/';

const router = express.Router();

router.post('/', createAlert);
router.get('/active', getActiveAlerts);
router.post('/:id/send', sendAlertNotifications);
router.delete('/:id', deleteAlert);

export default router;