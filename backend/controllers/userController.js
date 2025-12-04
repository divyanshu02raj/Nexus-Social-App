//backend\controllers\userController.js
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import Notification from '../models/notificationModel.js';

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPrivate = user.isPrivate;
  const isOwner = req.user && req.user._id.toString() === user._id.toString();
  const isFollowing = user.followers.some(id => id.toString() === req.user._id.toString());
  const isRequested = user.followRequests && user.followRequests.some(id => id.toString() === req.user._id.toString());

  let connectionStatus = 'none';
  if (isOwner) connectionStatus = 'self';
  else if (isFollowing) connectionStatus = 'following';
  else if (isRequested) connectionStatus = 'requested';

  if (isPrivate && !isOwner && !isFollowing) {
    return res.json({ user, posts: [], connectionStatus });
  }

  const posts = await Post.find({ user: user._id })
    .populate('user', 'fullName username avatar')
    .populate('comments.user', 'fullName username avatar')
    .sort({ createdAt: -1 });

  res.json({ user, posts, connectionStatus });
});

export const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!userToFollow || !currentUser) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  if (currentUser.following.includes(userToFollow._id)) {
    res.status(400);
    throw new Error('You are already following this user');
  }

  if (userToFollow.followRequests && userToFollow.followRequests.includes(currentUser._id)) {
    res.status(400);
    throw new Error('Follow request already sent');
  }

  if (userToFollow.isPrivate) {
    await userToFollow.updateOne({ $addToSet: { followRequests: currentUser._id } });

    const notification = new Notification({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: 'follow_request',
      text: 'requested to follow you',
    });
    await notification.save();

    res.json({ message: 'Follow request sent', status: 'requested' });
  } else {
    await currentUser.updateOne({ $addToSet: { following: userToFollow._id } });
    await userToFollow.updateOne({ $addToSet: { followers: currentUser._id } });

    const notification = new Notification({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: 'follow',
      text: 'started following you',
    });
    await notification.save();

    res.json({ message: 'User followed successfully', status: 'following' });
  }
});

export const acceptFollowRequest = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.user._id);
  const userWhoRequested = await User.findById(req.params.id);

  if (!userToFollow || !userWhoRequested) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!userToFollow.followRequests.includes(userWhoRequested._id)) {
    res.status(400);
    throw new Error('No follow request from this user');
  }

  await userToFollow.updateOne({
    $push: { followers: userWhoRequested._id },
    $pull: { followRequests: userWhoRequested._id }
  });
  await userWhoRequested.updateOne({ $push: { following: userToFollow._id } });

  const notification = new Notification({
    recipient: userWhoRequested._id,
    sender: userToFollow._id,
    type: 'follow_accept',
    text: 'accepted your follow request',
  });
  await notification.save();

  res.json({ message: 'Follow request accepted' });
});

export const rejectFollowRequest = asyncHandler(async (req, res) => {
  const userToReject = await User.findById(req.user._id);
  const userWhoRequested = await User.findById(req.params.id);

  if (!userToReject || !userWhoRequested) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!userToReject.followRequests.includes(userWhoRequested._id)) {
    res.status(400);
    throw new Error('No follow request from this user');
  }

  await userToReject.updateOne({ $pull: { followRequests: userWhoRequested._id } });

  res.json({ message: 'Follow request rejected' });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!userToUnfollow || !currentUser) {
    res.status(404);
    throw new Error('User not found');
  }

  if (userToUnfollow.followRequests.includes(currentUser._id)) {
    await userToUnfollow.updateOne({ $pull: { followRequests: currentUser._id } });
    return res.json({ message: 'Follow request cancelled', status: 'cancelled' });
  }

  if (!currentUser.following.includes(userToUnfollow._id)) {
    res.status(400);
    throw new Error('You are not following this user');
  }

  await currentUser.updateOne({ $pull: { following: userToUnfollow._id } });
  await userToUnfollow.updateOne({ $pull: { followers: currentUser._id } });

  res.json({ message: 'User unfollowed successfully', status: 'none' });
});


export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.json([]);
  }

  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { fullName: { $regex: query, $options: 'i' } }
    ],
    _id: { $ne: req.user.id }
  }).select('fullName username avatar');

  res.json(users);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.fullName = req.body.fullName !== undefined ? req.body.fullName : user.fullName;
    user.username = req.body.username !== undefined ? req.body.username : user.username;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.website = req.body.website !== undefined ? req.body.website : user.website;
    if (req.body.isPrivate !== undefined) {
      user.isPrivate = req.body.isPrivate;
    }

    if (req.file) {
      user.avatar = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      website: updatedUser.website,
      isPrivate: updatedUser.isPrivate,
      followers: updatedUser.followers,
      following: updatedUser.following,
      savedPosts: updatedUser.savedPosts,
    });

  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const getUserConnections = asyncHandler(async (req, res) => {
  try {
    console.log('getUserConnections called for user:', req.user?._id);

    if (!req.user || !req.user._id) {
      console.error('User not found in request object');
      res.status(401);
      throw new Error('User not authenticated');
    }

    const user = await User.findById(req.user._id)
      .populate('followers', 'fullName username avatar')
      .populate('following', 'fullName username avatar');

    if (!user) {
      console.error('User not found in database for ID:', req.user._id);
      res.status(404);
      throw new Error('User not found');
    }

    const connectionsMap = new Map();

    console.log(`Fetching connections for user ${req.user._id}`);
    console.log(`Found ${user.followers?.length || 0} followers and ${user.following?.length || 0} following`);

    if (user.followers) {
      user.followers.forEach(u => {
        if (u && u._id) connectionsMap.set(u._id.toString(), u);
      });
    }

    if (user.following) {
      user.following.forEach(u => {
        if (u && u._id) connectionsMap.set(u._id.toString(), u);
      });
    }

    const connections = Array.from(connectionsMap.values());
    console.log(`Returning ${connections.length} unique connections`);

    res.json(connections);
  } catch (error) {
    console.error('Error in getUserConnections:', error);
    res.status(500);
    throw new Error('Server Error: ' + error.message);
  }
});

export const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { currentPassword, newPassword } = req.body;

    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401);
      throw new Error('Invalid current password');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);

  const followingIds = currentUser.following;


  const suggestedUsers = await User.find({
    _id: { $nin: [...followingIds, req.user._id] }
  })
    .select('fullName username avatar')
    .limit(5);

  res.json(suggestedUsers);
});

export const getUserFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'fullName username avatar bio');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPrivate = user.isPrivate;
  const isOwner = req.user && req.user._id.toString() === user._id.toString();
  const isFollowing = user.followers.some(follower => follower._id.toString() === req.user._id.toString());

  if (isPrivate && !isOwner && !isFollowing) {
    return res.status(403).json({ message: 'This account is private' });
  }

  res.json(user.followers);
});


export const getUserFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', 'fullName username avatar bio');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPrivate = user.isPrivate;
  const isOwner = req.user && req.user._id.toString() === user._id.toString();

  const isFollowing = user.followers.some(id => id.toString() === req.user._id.toString());

  if (isPrivate && !isOwner && !isFollowing) {
    return res.status(403).json({ message: 'This account is private' });
  }

  res.json(user.following);
});

export const getFollowRequests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('followRequests', 'fullName username avatar');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user.followRequests);
});
