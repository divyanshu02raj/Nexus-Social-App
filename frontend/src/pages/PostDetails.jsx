//frontend\src\pages\PostDetails.jsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { fetchSinglePost } from '../store';
import Post from '../components/Post';

function PostDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentPost } = useSelector((state) => state.posts);
    const { item: post, loading, error } = currentPost;

    useEffect(() => {
        if (id) {
            dispatch(fetchSinglePost(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl">
                <p>{error}</p>
                <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
                    Go back home
                </Link>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Feed
                </Link>
            </div>

            <Post post={post} />
        </div>
    );
}

export default PostDetails;
