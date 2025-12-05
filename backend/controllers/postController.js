//backend\controllers\postController.js
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const populatePost = (query) => {
  return query
    .populate('user', 'fullName username avatar')
    .populate('comments.user', 'fullName username avatar')
    .populate('mentions', 'fullName username avatar')
    .populate('likes', 'fullName username avatar');
};

export const createPost = asyncHandler(async (req, res) => {
  const { text, location, mentions } = req.body;
  let image = null;

  if (req.file) {
    image = req.file.path;
  }

  if (!text && !image && !location) {
    res.status(400);
    throw new Error('Post content cannot be empty');
  }

  const post = await Post.create({
    user: req.user.id,
    text,
    image,
    location,
    mentions: mentions ? JSON.parse(mentions) : [],
  });

  if (mentions && JSON.parse(mentions).length > 0) {
    const mentionedUserIds = JSON.parse(mentions);
    for (const userId of mentionedUserIds) {
      if (userId !== req.user.id.toString()) {
        const notification = new Notification({
          recipient: userId,
          sender: req.user.id,
          type: 'mention',
          text: `mentioned you in a post`,
          post: post._id,
        });
        await notification.save();
      }
    }
  }

  const populatedPost = await populatePost(Post.findById(post._id));
  res.status(201).json(populatedPost);
});

export const getPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const following = user.following;

  const feedUsers = [...following, req.user.id];

  const posts = await populatePost(Post.find({ user: { $in: feedUsers } })).sort({ createdAt: -1 });
  res.json(posts);
});

export const likeUnlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const userId = req.user.id;
  const postAuthorId = post.user.toString();

  if (post.likes.includes(userId)) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
    if (postAuthorId !== userId) {
      const notification = new Notification({
        recipient: postAuthorId,
        sender: userId,
        type: 'like',
        text: 'liked your post',
        post: post._id,
      });
      await notification.save();
    }
  }

  await post.save();
  const updatedPost = await populatePost(Post.findById(post._id));
  res.json(updatedPost);
});

export const addCommentToPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const newComment = { user: req.user._id, text };
  post.comments.unshift(newComment);
  await post.save();

  const postAuthorId = post.user.toString();
  const commenterId = req.user.id.toString();
  if (postAuthorId !== commenterId) {
    const notification = new Notification({
      recipient: postAuthorId,
      sender: commenterId,
      type: 'comment',
      text: 'commented on your post',
      post: post._id,
    });
    await notification.save();
  }

  const updatedPost = await populatePost(Post.findById(post._id));
  res.status(201).json(updatedPost);
});


export const saveUnsavePost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (user.savedPosts.includes(post._id)) {
    user.savedPosts.pull(post._id);
    await user.save();
    res.json({ message: 'Post unsaved successfully' });
  } else {
    user.savedPosts.push(post._id);
    await user.save();
    res.json({ message: 'Post saved successfully' });
  }
});

export const getSavedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'savedPosts',
    populate: [
      { path: 'user', select: 'fullName username avatar' },
      { path: 'comments.user', select: 'fullName username avatar' },
      { path: 'mentions', select: 'fullName username avatar' },
      { path: 'likes', select: 'fullName username avatar' }
    ]
  });

  const sortedSavedPosts = user.savedPosts.sort((a, b) => b.createdAt - a.createdAt);

  res.json(sortedSavedPosts);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await Post.findByIdAndDelete(req.params.id);

  res.json({ message: 'Post removed successfully' });
});

export const updatePost = asyncHandler(async (req, res) => {
  const { text, mentions } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  post.text = text || post.text;
  if (mentions) {
    post.mentions = JSON.parse(mentions);
  }

  await post.save();

  const updatedPost = await populatePost(Post.findById(post._id));

  res.json(updatedPost);
});

export const getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $match: {
        'userDetails.isPrivate': { $ne: true }
      }
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" }
      }
    },
    { $sort: { likesCount: -1, commentsCount: -1, createdAt: -1 } },
    { $limit: 10 },
    {
      $project: {
        userDetails: 0
      }
    }
  ]);

  const populatedPosts = await Post.populate(posts, [
    { path: 'user', select: 'fullName username avatar' },
    { path: 'comments.user', select: 'fullName username avatar' },
    { path: 'mentions', select: 'fullName username avatar' },
    { path: 'likes', select: 'fullName username avatar' }
  ]);

  res.json(populatedPosts);
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await populatePost(Post.findById(req.params.id));

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.json(post);
});
