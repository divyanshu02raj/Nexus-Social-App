//backend\controllers\authController.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, fullName, bio } = req.body;

    if (!username || !email || !password || !fullName) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName,
      bio,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
    });

    if (user) {
      res.status(201).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt,
          followers: user.followers,
          following: user.following,
          savedPosts: user.savedPosts,
        },
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    next(error);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        followers: user.followers,
        following: user.following,
        savedPosts: user.savedPosts,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
