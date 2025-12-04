//backend\routes\userRoutes.js
import express from 'express';
import {
  getUserProfile,
  followUser,
  unfollowUser,
  searchUsers,
  updateUserProfile,
  getUserConnections,
  getSuggestedUsers,
  getUserFollowers,
  getUserFollowing,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowRequests,
  updateUserPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.route('/search').get(protect, searchUsers);
router.route('/connections').get(protect, getUserConnections);
router.route('/suggested').get(protect, getSuggestedUsers);
router.route('/requests').get(protect, getFollowRequests);
router.route('/password').put(protect, updateUserPassword);


router.route('/profile')
  .get(protect, (req, res) => { res.json(req.user); })
  .put(protect, upload.single('avatar'), updateUserProfile);

router.route('/:id').get(protect, getUserProfile);
router.route('/:id/followers').get(protect, getUserFollowers);
router.route('/:id/following').get(protect, getUserFollowing);
router.route('/:id/follow').put(protect, followUser);
router.route('/:id/unfollow').put(protect, unfollowUser);
router.route('/:id/accept-follow').put(protect, acceptFollowRequest);
router.route('/:id/reject-follow').put(protect, rejectFollowRequest);

export default router;

