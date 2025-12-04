//backend\routes\storyRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createStory, getStories, deleteStory, viewStory, likeStory } from '../controllers/storyController.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
    .get(protect, getStories)
    .post(protect, upload.single('media'), createStory);

router.route('/:id').delete(protect, deleteStory);
router.route('/:id/view').put(protect, viewStory);
router.route('/:id/like').put(protect, likeStory);

export default router;
