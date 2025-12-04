//backend\routes\messageRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages, getConversations, markMessagesAsRead } from '../controllers/messageController.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.use(protect);

router.route('/conversations').get(getConversations);
router.route('/read/:userId').put(markMessagesAsRead);

router.route('/:userId')
  .get(getMessages)
  .post(upload.single('media'), sendMessage);

export default router;