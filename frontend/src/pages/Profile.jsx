//frontend\src\pages\Profile.jsx
import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fetchUserProfile, followProfileUser, unfollowProfileUser } from '../store';
import Post from '../components/Post';
import {
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';

function Profile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: profile, loading, error } = useSelector((state) => state.profile);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserProfile(id));
    }
  }, [id, dispatch]);

  const handleFollow = () => {
    dispatch(followProfileUser(profile.user._id));
  };

  const handleUnfollow = () => {
    dispatch(unfollowProfileUser(profile.user._id));
  };

  const handleMessage = () => {
    navigate('/messages', { state: { userToMessage: profile.user } });
  };

  if (loading) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Loading profile...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!profile || !currentUser) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Profile not found.</div>;

  const { user: profileUser, posts, connectionStatus } = profile;
  const isFollowing = connectionStatus === 'following';
  const isRequested = connectionStatus === 'requested';
  const isOwnProfile = currentUser.id === profileUser._id;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div className="p-6">
            <div className="flex items-end sm:items-start -mt-20 sm:-mt-24">
              <img
                src={profileUser.avatar}
                alt={profileUser.fullName}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
              <div className="ml-4 flex-1 flex flex-col sm:flex-row items-start sm:items-end justify-between">
                <div className="mt-20 sm:mt-24">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.fullName}</h1>
                  <p className="text-gray-600 dark:text-gray-400">@{profileUser.username}</p>
                </div>

                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  {!isOwnProfile && (
                    <button onClick={handleMessage} className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 mr-2" /> Message
                    </button>
                  )}
                  {isOwnProfile ? (
                    <Link to="/settings" className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">Edit Profile</Link>
                  ) : isFollowing ? (
                    <button onClick={handleUnfollow} className="px-4 py-2 bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-full font-semibold">Following</button>
                  ) : isRequested ? (
                    <button onClick={handleUnfollow} className="px-4 py-2 bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">Requested</button>
                  ) : (
                    <button onClick={handleFollow} className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 font-semibold">Follow</button>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-gray-600 dark:text-gray-300">{profileUser.bio || 'No bio provided.'}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-1" /><span>Joined {format(new Date(profileUser.createdAt), 'MMMM yyyy')}</span></div>
            </div>

            <div className="mt-4 flex space-x-6">
              <p><span className="font-bold text-gray-900 dark:text-white">{posts.length}</span> <span className="text-gray-600 dark:text-gray-400">Posts</span></p>
              {profileUser.isPrivate && !isFollowing && !isOwnProfile ? (
                <>
                  <p className="cursor-not-allowed opacity-60">
                    <span className="font-bold text-gray-900 dark:text-white">{profileUser.followers.length}</span> <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  </p>
                  <p className="cursor-not-allowed opacity-60">
                    <span className="font-bold text-gray-900 dark:text-white">{profileUser.following.length}</span> <span className="text-gray-600 dark:text-gray-400">Following</span>
                  </p>
                </>
              ) : (
                <>
                  <Link to={`/profile/${profileUser._id}/followers`} className="hover:underline">
                    <span className="font-bold text-gray-900 dark:text-white">{profileUser.followers.length}</span> <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  </Link>
                  <Link to={`/profile/${profileUser._id}/following`} className="hover:underline">
                    <span className="font-bold text-gray-900 dark:text-white">{profileUser.following.length}</span> <span className="text-gray-600 dark:text-gray-400">Following</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>


        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posts</h2>
          {profileUser.isPrivate && !isFollowing && !isOwnProfile ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 dark:text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">This Account is Private</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Follow this account to see their photos and videos.</p>
                </div>
              </div>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => <Post key={post._id} post={post} />)
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400">This user hasn't posted anything yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

