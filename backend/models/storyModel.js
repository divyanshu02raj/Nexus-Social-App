//backend\models\storyModel.js
import mongoose from 'mongoose';

const storySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        image: {
            type: String,
            required: true,
        },
        views: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: () => Date.now() + 24 * 60 * 60 * 1000,
            index: { expires: 0 },
        },
    },
    {
        timestamps: true,
    }
);

const Story = mongoose.model('Story', storySchema);

export default Story;
