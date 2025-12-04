//frontend\src\pages\UserPosts.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchUserProfile } from '../store';
import Post from '../components/Post';

function UserPosts() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { data: profile, loading, error } = useSelector((state) => state.profile);
  const { user: currentUser } = useSelector((state) => state.auth);

  const userId = id || currentUser?.id || currentUser?._id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 text-center text-gray-500 dark:text-gray-400">
        User not found.
      </div>
    );
  }

  const { user: profileUser, posts } = profile;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profileUser.fullName}'s Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Showing all {posts.length} posts
          </p>
        </div>

        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Post key={post._id} post={post} />
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPosts;