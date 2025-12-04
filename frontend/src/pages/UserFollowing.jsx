//frontend\src\pages\UserFollowing.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { fetchUserFollowing } from '../store/userSlice';
import { fetchUserProfile, followProfileUser, unfollowProfileUser } from '../store';

function UserFollowing() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { following } = useSelector((state) => state.user);
  const { data: profile } = useSelector((state) => state.profile);
  const { items: followingList, loading, error } = following;
  const [searchQuery, setSearchQuery] = useState('');

  const userId = id || currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserFollowing(userId));
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  const handleFollow = (targetUserId) => {
    dispatch(followProfileUser(targetUserId));
  };

  const handleUnfollow = (targetUserId) => {
    dispatch(unfollowProfileUser(targetUserId));
  };

  const isFollowing = (targetUserId) => {
    return currentUser.following?.includes(targetUserId);
  };

  const filteredFollowing = followingList.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageTitle = profile?.user?._id === userId ? profile.user.fullName : currentUser?.fullName;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            People {pageTitle} Follows
          </h1>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search following..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
            Following {filteredFollowing.length} people
          </p>
        </div>

        {filteredFollowing.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFollowing.map((followedUser) => (
              <motion.div
                key={followedUser._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <Link to={`/profile/${followedUser._id}`} className="flex items-center space-x-4 group">
                    <img
                      src={followedUser.avatar || `https://ui-avatars.com/api/?name=${followedUser.fullName}&background=random`}
                      alt={followedUser.fullName}
                      className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {followedUser.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{followedUser.username}
                      </p>
                      {followedUser.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                          {followedUser.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => isFollowing(followedUser._id) ? handleUnfollow(followedUser._id) : handleFollow(followedUser._id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing(followedUser._id)
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                  >
                    {isFollowing(followedUser._id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserFollowing;