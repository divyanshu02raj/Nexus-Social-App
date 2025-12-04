//frontend\src\components\Post.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { MentionsInput, Mention } from 'react-mentions';
import api from '../services/api';
import { toggleLike, addComment, toggleSavePost, deletePost, updatePost } from '../store';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    BookmarkIcon,
    EllipsisHorizontalIcon,
    PencilIcon,
    TrashIcon,
    PaperAirplaneIcon,
    MapPinIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

function EditPostModal({ post, isOpen, onClose }) {
    const [text, setText] = useState(post.text);
    const [mentions, setMentions] = useState(post.mentions.map(m => ({ id: m._id, display: m.username })));
    const dispatch = useDispatch();

    const fetchUsersForMention = async (query, callback) => {
        if (!query) return;
        try {
            const { data } = await api.get(`/users/search?q=${query}`);
            const formattedData = data.map(user => ({ id: user._id, display: user.username }));
            callback(formattedData);
        } catch (error) {
            console.error("Could not fetch users for mention", error);
        }
    };

    const handleSubmit = () => {
        if (!text.trim()) {
            toast.error("Post content cannot be empty.");
            return;
        }
        const mentionIds = mentions.map(m => m.id);
        const updatedPostData = {
            text,
            mentions: JSON.stringify(mentionIds)
        }
        dispatch(updatePost({ postId: post._id, text: updatedPostData.text, mentions: updatedPostData.mentions }));
        toast.success("Post updated successfully!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel rounded-2xl w-full max-w-lg p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Post</h2>
                <MentionsInput
                    value={text}
                    onChange={(e, newValue, newPlainText, mentions) => {
                        setText(newValue);
                        setMentions(mentions);
                    }}
                    className="mentions-edit"
                    classNames={{
                        control: 'w-full p-3 border rounded-xl glass-input',
                        input: 'bg-transparent outline-none text-gray-900 dark:text-white min-h-[120px]',
                        suggestions: {
                            list: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700',
                            item: { '&focused': 'bg-primary-50 dark:bg-primary-900/30 p-2', 'p-2': true },
                        },
                    }}
                >
                    <Mention
                        trigger="@"
                        data={fetchUsersForMention}
                        markup="@[__display__](__id__)"
                        displayTransform={(id, display) => `@${display}`}
                        className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded px-1 font-medium"
                    />
                </MentionsInput>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary">Save Changes</button>
                </div>
            </motion.div>
        </div>
    );
}

function LikesModal({ isOpen, onClose, likers }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel rounded-2xl w-full max-w-sm overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Liked by</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {likers && likers.length > 0 ? (
                        <div className="space-y-4">
                            {likers.map(user => (
                                <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center space-x-3 group" onClick={onClose}>
                                    <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{user.fullName}</p>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No likes yet.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function Post({ post }) {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    if (!post || !post.user || !currentUser || !post.likes || !post.comments) {
        return null;
    }

    const isAuthor = post.user._id === currentUser.id;
    const isLiked = post.likes.some(like => like._id === currentUser.id);
    const isSaved = currentUser.savedPosts?.includes(post._id) ?? false;

    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleLike = () => dispatch(toggleLike(post._id));
    const handleSave = () => {
        dispatch(toggleSavePost(post._id));
        toast.success(isSaved ? 'Post removed from saved' : 'Post saved successfully');
    };
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        dispatch(addComment({ postId: post._id, text: newComment }));
        setNewComment('');
    };
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            dispatch(deletePost(post._id));
            toast.success("Post deleted successfully!");
        }
    };

    const renderTextWithMentions = (text) => {
        if (!text) return '';
        const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = text.split(mentionRegex);

        return parts.map((part, index) => {
            if (index % 3 === 1) {
                const userId = parts[index + 1];
                return <Link key={index} to={`/profile/${userId}`} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">@{part}</Link>;
            } else if (index % 3 === 2) {
                return null;
            }
            return part;
        });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl overflow-hidden mb-6 hover:shadow-2xl transition-shadow duration-300"
            >
                <div className="p-5 flex items-start justify-between">
                    <Link to={`/profile/${post.user._id}`} className="flex items-center space-x-3 group">
                        <div className="p-0.5 bg-gradient-to-tr from-primary-500 to-pink-500 rounded-full">
                            <img src={post.user.avatar} alt={post.user.fullName} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{post.user.fullName}</h3>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                {post.location && (
                                    <>
                                        <span className="mx-1">·</span>
                                        <MapPinIcon className="w-3 h-3 mr-1 text-primary-500" />
                                        <span>{post.location}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>
                    {isAuthor && (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                <EllipsisHorizontalIcon className="w-6 h-6" />
                            </button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-lg z-10 overflow-hidden">
                                        <button onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <PencilIcon className="w-4 h-4 mr-3 text-primary-500" /> Edit Post
                                        </button>
                                        <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <TrashIcon className="w-4 h-4 mr-3" /> Delete Post
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
                <div className="px-5 pb-3">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-[15px]">
                        {renderTextWithMentions(post.text)}
                    </p>
                </div>
                {post.image && (
                    <div className="my-2 bg-black/5 dark:bg-black/20">
                        {post.image.endsWith('.mp4') || post.image.endsWith('.mov') ? (
                            <video src={post.image} controls className="w-full object-cover max-h-[600px]" />
                        ) : (
                            <img src={post.image} alt="Post content" className="w-full object-cover max-h-[600px]" />
                        )}
                    </div>
                )}
                <div className="px-5 py-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50">
                    <button onClick={() => setIsLikesModalOpen(true)} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium" disabled={post.likes.length === 0}>
                        {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                        {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                    </button>
                </div>
                <div className="px-2 py-2 flex items-center justify-between">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleLike} className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-colors duration-200 ${isLiked ? 'text-red-500 bg-red-50/50 dark:bg-red-900/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                        {isLiked ? <HeartIconSolid className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
                        <span className="font-medium">Like</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center space-x-2 py-2.5 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                        <ChatBubbleLeftIcon className="w-6 h-6" />
                        <span className="font-medium">Comment</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-colors duration-200 ${isSaved ? 'text-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                        {isSaved ? <BookmarkIconSolid className="w-6 h-6" /> : <BookmarkIcon className="w-6 h-6" />}
                        <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
                    </motion.button>
                </div>
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700/50"
                        >
                            <div className="p-5 space-y-5">
                                <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                                    <img src={currentUser.avatar} alt="Your avatar" className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700" />
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="w-full pl-4 pr-12 py-2.5 glass-input rounded-xl text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                                <div className="space-y-4">
                                    {post.comments && post.comments.length > 0 ? (
                                        post.comments.map(comment => (
                                            <div key={comment._id} className="flex items-start space-x-3 group">
                                                <Link to={`/profile/${comment.user._id}`}>
                                                    <img src={comment.user.avatar} alt={comment.user.fullName} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
                                                </Link>
                                                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-100 dark:border-gray-700/50">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <Link to={`/profile/${comment.user._id}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                            {comment.user.fullName}
                                                        </Link>
                                                        <span className="text-xs text-gray-400">
                                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to start the conversation!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <AnimatePresence>
                {isEditModalOpen && (
                    <EditPostModal
                        key={`edit-${post._id}`}
                        post={post}
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                )}
                {isLikesModalOpen && (
                    <LikesModal
                        key={`likes-${post._id}`}
                        likers={post.likes}
                        isOpen={isLikesModalOpen}
                        onClose={() => setIsLikesModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

