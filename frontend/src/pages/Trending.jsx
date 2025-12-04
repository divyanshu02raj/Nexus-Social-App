//frontend\src\pages\Trending.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { fetchTrendingPosts } from '../store';
import Post from '../components/Post';

function Trending() {
  const dispatch = useDispatch();
  const { trending } = useSelector((state) => state.posts);
  const { items: posts, loading, error } = trending;

  useEffect(() => {
    dispatch(fetchTrendingPosts());
  }, [dispatch]);

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <ChartBarIcon className="w-8 h-8 text-purple-200" />
            <h1 className="text-3xl font-bold">Trending Now</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-xl">
            See what's capturing the world's attention right now. The top posts based on engagement.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl">
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p>No trending posts yet. Be the first to go viral!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post._id} className="relative">
              <div className="absolute -left-12 top-0 hidden xl:flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold shadow-lg">
                {index + 1}
              </div>
              <div className="xl:hidden mb-2 px-2">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-bold">
                  #{index + 1} Trending
                </span>
              </div>
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trending;