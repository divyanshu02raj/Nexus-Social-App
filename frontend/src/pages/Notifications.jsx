//src\pages\Notifications.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markAllNotificationsAsRead, fetchFollowRequests, acceptFollowRequest, rejectFollowRequest } from '../store';

function Notifications() {
  const [activeTab, setActiveTab] = useState('all');
  const dispatch = useDispatch();
  const { items: notifications, requests, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchFollowRequests());
  }, [dispatch]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
    toast.success('All notifications marked as read');
  };

  const handleAccept = (userId) => {
    dispatch(acceptFollowRequest(userId))
      .unwrap()
      .then(() => toast.success('Follow request accepted'))
      .catch(() => toast.error('Failed to accept request'));
  };

  const handleReject = (userId) => {
    dispatch(rejectFollowRequest(userId))
      .unwrap()
      .then(() => toast.info('Follow request rejected'))
      .catch(() => toast.error('Failed to reject request'));
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const renderRequests = () => {
    if (requests.length === 0) {
      return <p className="text-center p-8 text-gray-500 dark:text-gray-400">No follow requests.</p>;
    }
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {requests.map((user) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
          >
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${user._id}`} className="flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              <div>
                <Link to={`/profile/${user._id}`} className="font-semibold text-gray-900 dark:text-white hover:underline">
                  {user.fullName}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAccept(user._id)}
                className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => handleReject(user._id)}
                className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center p-8 text-gray-500 dark:text-gray-400">Loading notifications...</p>;
    }
    if (error) {
      return <p className="text-center p-8 text-red-500">Error: {error}</p>;
    }
    if (activeTab === 'requests') {
      return renderRequests();
    }
    if (filteredNotifications.length === 0) {
      return <p className="text-center p-8 text-gray-500 dark:text-gray-400">No notifications here.</p>;
    }
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredNotifications.map((notification) => (
          <motion.div
            key={notification._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out ${!notification.read ? 'bg-purple-50 dark:bg-purple-900/10' : ''
              }`}
          >
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${notification.sender._id}`} className="flex-shrink-0">
                <img
                  src={notification.sender.avatar}
                  alt={notification.sender.fullName}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <Link to={`/profile/${notification.sender._id}`} className="font-semibold text-gray-900 dark:text-white hover:underline">
                    {notification.sender.fullName}
                  </Link>
                  {' '}{notification.text}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0 w-2.5 h-2.5 bg-purple-500 rounded-full" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2.5 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark all as read
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${activeTab === 'all'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('like')}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${activeTab === 'like'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            Likes
          </button>
          <button
            onClick={() => setActiveTab('comment')}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${activeTab === 'comment'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab('follow')}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${activeTab === 'follow'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            Follows
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${activeTab === 'requests'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {renderContent()}

    </div>
  );
}

export default Notifications;