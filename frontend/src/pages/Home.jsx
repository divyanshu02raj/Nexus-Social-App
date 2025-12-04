// src\pages\Home.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Picker, { Theme } from 'emoji-picker-react';
import { MentionsInput, Mention } from 'react-mentions';
import api from '../services/api';
import { fetchPosts, createNewPost, toggleLike, addComment, toggleSavePost, deletePost, updatePost } from '../store';
import Stories from '../components/Stories';
import LocationPicker from '../components/LocationPicker';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  PhotoIcon,
  FaceSmileIcon,
  MapPinIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';


function CreatePostCard() {
  const [postText, setPostText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiPickerRef]);

  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [mediaFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setMediaFile(file);
      } else {
        toast.error('Please select a valid image or video file.');
      }
    }
  };

  const onEmojiClick = (emojiObject) => {
    setPostText(prevInput => prevInput + emojiObject.emoji);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
        const data = await response.json();
        setLocation(data.city ? `${data.city}, ${data.countryCode}` : data.countryName);
      } catch (error) {
        toast.error("Could not fetch location details.");
      } finally {
        setIsFetchingLocation(false);
      }
    }, () => {
      toast.error("Unable to retrieve your location. Please enable location services.");
      setIsFetchingLocation(false);
    });
  };

  const handlePost = () => {
    if (!postText.trim() && !mediaFile && !location) {
      toast.error('Please add content to your post');
      return;
    }
    const formData = new FormData();
    formData.append('text', postText);
    if (location) {
      formData.append('location', location);
    }
    if (mediaFile) {
      formData.append('media', mediaFile);
    }
    const mentionIds = mentions.map(m => m.id);
    formData.append('mentions', JSON.stringify(mentionIds));

    dispatch(createNewPost(formData));
    toast.success('Post created successfully!');
    setPostText('');
    setMentions([]);
    setMediaFile(null);
    setPreviewUrl(null);
    setIsExpanded(false);
    setShowEmojiPicker(false);
    setShowEmojiPicker(false);
    setLocation('');
    setShowLocationInput(false);
  };

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 mb-8"
    >
      <div className="flex items-start space-x-4">
        <div className="p-0.5 bg-gradient-to-tr from-primary-500 to-pink-500 rounded-full flex-shrink-0">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`}
            alt="Your avatar"
            className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800"
          />
        </div>
        <div className="flex-1">
          <MentionsInput
            value={postText}
            onChange={(e, newValue, newPlainText, mentions) => {
              setPostText(newValue);
              setMentions(mentions);
            }}
            onClick={() => setIsExpanded(true)}
            placeholder={`What's on your mind, ${user?.fullName || 'there'}?`}
            className="mentions"
            classNames={{
              control: 'w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white resize-none min-h-[60px]',
              input: 'bg-transparent outline-none text-gray-900 dark:text-white',
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

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-4"
            >
              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  {mediaFile.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-cover" />
                  ) : (
                    <video src={previewUrl} controls className="max-h-80 w-full" />
                  )}
                  <button onClick={() => setMediaFile(null)} className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/75 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
              )}
              {location ? (
                <div className="flex items-center text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 p-2.5 rounded-xl border border-primary-100 dark:border-primary-800/30">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{location}</span>
                  <button onClick={() => setLocation('')} className="ml-auto hover:text-red-500 transition-colors"><XMarkIcon className="w-4 h-4" /></button>
                </div>
              ) : showLocationInput && (
                <div className="space-y-2">
                  <LocationPicker
                    value={location}
                    onChange={(val) => { setLocation(val); }}
                    placeholder="Add location..."
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isFetchingLocation}
                    className="text-xs flex items-center text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                  >
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {isFetchingLocation ? "Getting location..." : "Use my current location"}
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex space-x-2 text-gray-500 items-center">
                  <label className="cursor-pointer p-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors group">
                    <PhotoIcon className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <div className="relative" ref={emojiPickerRef}>
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors group">
                      <FaceSmileIcon className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full mt-2 z-20 shadow-2xl rounded-xl overflow-hidden">
                        <Picker onEmojiClick={onEmojiClick} theme={darkMode ? Theme.DARK : Theme.LIGHT} />
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => setShowLocationInput(!showLocationInput)} className={`p-2.5 rounded-full transition-colors group ${showLocationInput ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                    <MapPinIcon className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!postText.trim() && !mediaFile && !location}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Post</span>
                  <PaperAirplaneIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import Post from '../components/Post';

function Home() {
  const dispatch = useDispatch();
  const { items: posts, loading, error } = useSelector((state) => state.posts);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchPosts());
    }
  }, [dispatch, token]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <Stories />
      <CreatePostCard />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
          <p className="text-red-600 dark:text-red-400 font-medium">Error fetching posts: {error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(posts) && posts.map(post => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;


