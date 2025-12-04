//src\components\Layout.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout, searchUsers, clearSearchResults, fetchNotifications } from '../store';
import { setSelectedUser, setOnlineUsers } from '../store/userSlice';
import { fetchConversations } from '../store/messageSlice';
import socket from '../socket';
import RightSidebar from './RightSidebar';
import {
  HomeIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


function Layout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const { items: notifications } = useSelector((state) => state.notifications);
  const { results: searchResults, loading: searchLoading } = useSelector((state) => state.search);


  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      dispatch(fetchConversations());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("join", user.id || user._id);

      const handleReceiveMessage = () => {
        dispatch(fetchConversations());
      };

      const handleConversationsUpdated = () => {
        dispatch(fetchConversations());
      };

      const handleGetOnlineUsers = (users) => {
        dispatch(setOnlineUsers(users));
      };

      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("conversationsUpdated", handleConversationsUpdated);
      socket.on("getOnlineUsers", handleGetOnlineUsers);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("conversationsUpdated", handleConversationsUpdated);
        socket.off("getOnlineUsers", handleGetOnlineUsers);

        if (!user) {
          socket.disconnect();
        }
      };
    }
  }, [user, dispatch]);


  const { items: conversations } = useSelector((state) => state.messages.conversations);
  const unreadConversationsCount = conversations.filter(convo => (convo.unreadCount || 0) > 0).length;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (debouncedSearchQuery) {
      dispatch(searchUsers(debouncedSearchQuery));
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedSearchQuery, dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);


  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Trending', href: '/trending', icon: ChartBarIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon, count: unreadConversationsCount },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, count: unreadCount },
    { name: 'Saved Posts', href: '/saved', icon: BookmarkIcon },
  ];

  const handleLogout = () => {
    socket.disconnect();
    dispatch(logout());
    navigate('/login');
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
    dispatch(clearSearchResults());
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1a1a2e]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#1a1a2e] overflow-hidden">
      <div className="max-w-screen-2xl mx-auto h-full flex">

        <div className="w-64 hidden lg:flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
            <Link to="/" className="flex items-center space-x-3 px-2">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl font-bold text-white">N</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Nexus
              </span>
            </Link>

            <div className="relative" ref={searchRef}>
              <div className="relative group">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white dark:focus:bg-gray-800 outline-none text-sm transition-all duration-300"
                />
              </div>
              {isSearchFocused && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full glass-panel rounded-xl z-20 max-h-60 overflow-y-auto"
                >
                  {searchLoading && <p className="p-4 text-sm text-gray-500">Searching...</p>}
                  {!searchLoading && searchResults.length === 0 && debouncedSearchQuery && (
                    <p className="p-4 text-sm text-gray-500">No users found.</p>
                  )}
                  {searchResults.map(result => (
                    <Link
                      to={`/profile/${result._id}`}
                      key={result._id}
                      onClick={handleResultClick}
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <img src={result.avatar} alt={result.fullName} className="w-8 h-8 rounded-full mr-3" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{result.fullName}</p>
                        <p className="text-xs text-gray-500">@{result.username}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.div
              className="glass-panel rounded-xl p-4 cursor-pointer hover:border-primary-500/30 transition-colors"
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <div className="flex items-center space-x-3">
                <img src={user.avatar} alt={user.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700" />
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                </div>
              </div>
            </motion.div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${location.pathname === item.href ? 'nav-item-active' : 'nav-item-default'
                    }`}
                >
                  <item.icon className="w-6 h-6 mr-3" />
                  <span className="font-medium">{item.name}</span>
                  {item.count > 0 && (
                    <span className="ml-auto bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <Link to="/settings" className="nav-item nav-item-default">
              <Cog6ToothIcon className="w-6 h-6 mr-3" />
              Settings
            </Link>
            <button onClick={handleLogout} className="w-full nav-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10">
              <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center h-full overflow-hidden relative">
          <main className={`w-full h-full overflow-y-auto scrollbar-hide pb-20 lg:pb-0 pt-6 px-4 ${location.pathname === '/messages' ? 'max-w-7xl' : 'max-w-2xl'}`}>
            {children}
          </main>
        </div>

        <div className="hidden xl:block w-80 border-l border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}

export default Layout;

