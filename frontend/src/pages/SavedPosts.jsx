//src\pages\SavedPosts.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { fetchSavedPosts } from '../store';
import Post from '../components/Post';

function SavedPosts() {
  const dispatch = useDispatch();
  const { items: savedPosts, loading, error } = useSelector((state) => state.savedPosts);

  useEffect(() => {
    dispatch(fetchSavedPosts());
  }, [dispatch]);

  const renderContent = () => {
    if (loading) {
      return <p className="text-center p-8 text-gray-500 dark:text-gray-400">Loading saved posts...</p>;
    }

    if (error) {
      return <p className="text-center p-8 text-red-500">Error: {error}</p>;
    }

    if (savedPosts.length === 0) {
      return (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <BookmarkIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No saved posts yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Start saving posts by clicking the bookmark icon on any post.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {savedPosts.map(post => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your collection of saved posts
        </p>
      </div>

      {renderContent()}
    </div>
  );
}

export default SavedPosts;