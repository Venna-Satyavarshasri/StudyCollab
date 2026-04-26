import express from 'express';
import { sendDirectMessage, getDirectMessages, markMessagesAsRead, getUnreadDMCounts } from '../controllers/directMessageController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectIds from '../middleware/validateObjectIds.js';

const router = express.Router();

router.route('/')
    .post(protect, sendDirectMessage);

router.route('/unread-counts')
        .get(protect, getUnreadDMCounts);
        
router.route('/:recipientId')
    .get(protect, validateObjectIds('recipientId'), getDirectMessages);

router.route('/read/:recipientId')
    .put(protect, validateObjectIds('recipientId'), markMessagesAsRead);

export default router;