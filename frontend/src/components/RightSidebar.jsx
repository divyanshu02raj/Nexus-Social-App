//frontend\src\components\RightSidebar.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { UserPlusIcon, ArrowTrendingUpIcon, HeartIcon } from '@heroicons/react/24/outline';
import { fetchTrendingPosts, followProfileUser } from '../store';
import { fetchSuggestedUsers } from '../store/userSlice';

function RightSidebar() {
    const dispatch = useDispatch();
    const { trending } = useSelector((state) => state.posts);
    const { items: trendingPosts, loading: trendingLoading } = trending;

    const { suggestedUsers } = useSelector((state) => state.user);
    const { items: usersToFollow, loading: usersLoading } = suggestedUsers;

    useEffect(() => {
        dispatch(fetchTrendingPosts());
        dispatch(fetchSuggestedUsers());
    }, [dispatch]);

    const handleFollow = async (userId) => {
        await dispatch(followProfileUser(userId));
        dispatch(fetchSuggestedUsers());
    };

    return (
        <div className="w-80 hidden xl:block p-6 space-y-6 h-full overflow-y-auto scrollbar-hide">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl p-5"
            >
                <div className="flex items-center space-x-2 mb-4">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-primary-500" />
                    <h2 className="font-bold text-gray-900 dark:text-white">Trending Posts</h2>
                </div>
                <div className="space-y-4">
                    {trendingLoading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : trendingPosts.slice(0, 5).map((post) => (
                        <div key={post._id} className="block group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 mr-2">
                                    <Link to={`/post/${post._id}`} className="block">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                            {post.text || "Media Post"}
                                        </p>
                                    </Link>
                                    <Link to={`/profile/${post.user._id}`} className="text-xs text-gray-500 dark:text-gray-400 hover:underline hover:text-primary-500 transition-colors">
                                        {post.user.fullName}
                                    </Link>
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                    <HeartIcon className="w-3 h-3 mr-1" />
                                    {post.likes.length}
                                </div>
                            </div>
                        </div>
                    ))}
                    {trendingPosts.length === 0 && !trendingLoading && (
                        <p className="text-sm text-gray-500">No trending posts yet.</p>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-2xl p-5"
            >
                <div className="flex items-center space-x-2 mb-4">
                    <UserPlusIcon className="w-5 h-5 text-primary-500" />
                    <h2 className="font-bold text-gray-900 dark:text-white">Who to follow</h2>
                </div>
                <div className="space-y-4">
                    {usersLoading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : usersToFollow.map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                            <Link to={`/profile/${user._id}`} className="flex items-center space-x-3 group">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                                    alt={user.fullName}
                                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {user.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => handleFollow(user._id)}
                                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Follow
                            </button>
                        </div>
                    ))}
                    {usersToFollow.length === 0 && !usersLoading && (
                        <p className="text-sm text-gray-500">No new users to follow.</p>
                    )}
                </div>
            </motion.div>

            {/* Footer */}
            <div className="text-xs text-gray-400 text-center">
                <p>© 2025 Nexus Social. All rights reserved.</p>
                <div className="flex justify-center space-x-2 mt-1">
                    <a href="#" className="hover:underline">Privacy</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Terms</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Cookies</a>
                </div>
            </div>
        </div>
    );
}

export default RightSidebar;
