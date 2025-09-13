import Alert from '../models/alert.model.js';
import User from '../models/user.model.js';
import { sendSMS } from '../services/smsService.js';
import { sendWhatsApp } from '../services/whatsappService.js';
import { sendTelegram } from '../services/telegramService.js';

export const createAlert = async (req, res) => {
    try {
        const alertData = req.body;

        if (!alertData.expiresAt) {
            alertData.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        }

        const alert = new Alert(alertData);
        const savedAlert = await alert.save();

        res.status(201).json({
            success: true,
            data: savedAlert,
            message: 'Alert created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const getActiveAlerts = async (req, res) => {
    try {
        const currentTime = new Date();
        const alerts = await Alert.find({
            active: true,
            expiresAt: { $gte: currentTime }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const sendAlertNotifications = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }

        if (!alert.active || alert.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Alert is inactive or expired'
            });
        }

        const users = await User.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: alert.location.coordinates
                    },
                    $maxDistance: alert.range
                }
            }
        });

        const notificationPromises = users.map(async (user) => {
            const message = `${alert.title}: ${alert.content}`;
            try {
                switch (user.preferredChannel) {
                    case 'sms':
                        await sendSMS(user.phoneNumber, message);
                        break;
                    case 'whatsapp':
                        await sendWhatsApp(user.phoneNumber, message);
                        break;
                    case 'telegram':
                        await sendTelegram(user.phoneNumber, message);
                        break;
                    default:
                        await sendSMS(user.phoneNumber, message);
                }
                return { userId: user._id, status: 'sent' };
            } catch (error) {
                return { userId: user._id, status: 'failed', error: error.message };
            }
        });

        const results = await Promise.all(notificationPromises);

        res.status(200).json({
            success: true,
            message: 'Notifications sent',
            data: {
                alertId: alert._id,
                sent: results.filter(r => r.status === 'sent').length,
                failed: results.filter(r => r.status === 'failed').length,
                details: results
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};