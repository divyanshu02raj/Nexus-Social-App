//backend\routes\postRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPost,
  getPosts,
  likeUnlikePost,
  addCommentToPost,
  saveUnsavePost,
  getSavedPosts,
  deletePost,
  updatePost,
  getTrendingPosts,
  getPostById,
} from '../controllers/postController.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.route('/saved').get(protect, getSavedPosts);
router.route('/trending').get(protect, getTrendingPosts);

router.route('/')
  .get(protect, getPosts)
  .post(protect, upload.single('media'), createPost);

router.route('/:id')
  .get(protect, getPostById)
  .delete(protect, deletePost)
  .put(protect, updatePost);

router.route('/:id/like').put(protect, likeUnlikePost);
router.route('/:id/comments').post(protect, addCommentToPost);
router.route('/:id/save').put(protect, saveUnsavePost);

export default router;
