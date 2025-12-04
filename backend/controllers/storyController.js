//backend\controllers\storyController.js
import asyncHandler from 'express-async-handler';
import Story from '../models/storyModel.js';
import User from '../models/userModel.js';

const createStory = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image or video');
    }

    const story = await Story.create({
        user: req.user._id,
        image: req.file.path,
    });

    const populatedStory = await Story.findById(story._id).populate('user', 'username fullName avatar');

    res.status(201).json(populatedStory);
});

const getStories = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const following = user.following;

    const stories = await Story.find({
        user: { $in: [...following, req.user.id] },
        expiresAt: { $gt: Date.now() },
    })
        .populate('user', 'username fullName avatar')
        .populate('views', 'username fullName avatar')
        .populate('likes', 'username fullName avatar')
        .sort({ createdAt: -1 });

    res.json(stories);
});

const deleteStory = asyncHandler(async (req, res) => {
    const story = await Story.findById(req.params.id);

    if (!story) {
        res.status(404);
        throw new Error('Story not found');
    }

    if (story.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await story.deleteOne();

    res.json({ id: req.params.id });
});


const viewStory = asyncHandler(async (req, res) => {
    const story = await Story.findById(req.params.id);

    if (!story) {
        res.status(404);
        throw new Error('Story not found');
    }

    if (story.user.toString() === req.user.id) {
        return res.json(story);
    }

    if (!story.views.includes(req.user.id)) {
        story.views.push(req.user.id);
        await story.save();
    }

    await story.populate('user', 'username fullName avatar');
    await story.populate('views', 'username fullName avatar');
    await story.populate('likes', 'username fullName avatar');

    res.json(story);
});

const likeStory = asyncHandler(async (req, res) => {
    const story = await Story.findById(req.params.id);

    if (!story) {
        res.status(404);
        throw new Error('Story not found');
    }

    if (story.user.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot like your own story' });
    }

    if (story.likes.includes(req.user.id)) {
        story.likes = story.likes.filter((id) => id.toString() !== req.user.id);
    } else {
        story.likes.push(req.user.id);
    }

    await story.save();

    await story.populate('user', 'username fullName avatar');
    await story.populate('views', 'username fullName avatar');
    await story.populate('likes', 'username fullName avatar');

    res.json(story);
});

export { createStory, getStories, deleteStory, viewStory, likeStory };
