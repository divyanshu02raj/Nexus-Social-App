//frontend\src\components\Stories.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, ArrowLeftIcon, ArrowRightIcon, TrashIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStories, createStory, deleteStory, viewStory, likeStory } from '../store';
import { toast } from 'react-toastify';

function CreateStoryModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
      } else {
        toast.error('Please select an image or video file');
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('media', selectedFile);

    try {
      await dispatch(createStory(formData)).unwrap();
      toast.success('Story created successfully!');
      onClose();
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      toast.error(error.message || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-2xl p-6 max-w-lg w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Story</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {preview ? (
                <div className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-lg">
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={preview}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={preview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/75 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="block w-full aspect-[9/16] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 group">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 mb-3 transition-colors">
                      <PlusIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium">Click to upload story</p>
                  </div>
                </label>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!selectedFile || loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Share Story'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ViewStoryModal({ isOpen, onClose, userStories, initialStoryIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [showViewers, setShowViewers] = useState(false);
  const [optimisticLike, setOptimisticLike] = useState(null);

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const currentStory = userStories[currentIndex];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && currentStory) {
      const isOwner = currentStory.user._id === currentUser.id || currentStory.user._id === currentUser._id;
      const hasViewed = currentStory.views?.some(v => (v._id || v) === (currentUser.id || currentUser._id));

      if (!isOwner && !hasViewed) {
        dispatch(viewStory(currentStory._id));
      }
    }
  }, [isOpen, currentStory, currentUser, dispatch]);

  useEffect(() => {
    setCurrentIndex(initialStoryIndex);
    setOptimisticLike(null);
    setShowViewers(false);
  }, [initialStoryIndex]);

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this story?')) {
      await dispatch(deleteStory(currentStory._id));
      if (userStories.length === 1) {
        onClose();
      } else if (currentIndex === userStories.length - 1) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const isCurrentlyLiked = isLiked;
    setOptimisticLike(!isCurrentlyLiked);

    dispatch(likeStory(currentStory._id));
  };

  const isOwner = currentStory?.user?._id === currentUser.id || currentStory?.user?._id === currentUser._id;

  const serverLiked = currentStory?.likes?.some(l => (l._id || l) === (currentUser.id || currentUser._id));
  const isLiked = optimisticLike !== null ? optimisticLike : serverLiked;


  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && currentStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center z-[100]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg aspect-[9/16] mx-4 shadow-2xl rounded-2xl overflow-hidden bg-gray-900"
            onClick={e => e.stopPropagation()}
          >
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
              {userStories.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${idx < currentIndex ? 'w-full' : idx === currentIndex ? 'w-full' : 'w-0'}`}
                  />
                </div>
              ))}
            </div>


            <img
              src={currentStory.image}
              alt={`${currentStory.user.username}'s story`}
              className="w-full h-full object-cover"
            />


            <div className="absolute top-0 left-0 right-0 p-4 pt-12 bg-gradient-to-b from-black/60 via-black/20 to-transparent rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-0.5 bg-gradient-to-tr from-primary-500 to-pink-500 rounded-full">
                    <img
                      src={currentStory.user.avatar}
                      alt={currentStory.user.username}
                      className="w-10 h-10 rounded-full border-2 border-black"
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-shadow-sm">{currentStory.user.fullName || currentStory.user.username}</p>
                    <p className="text-white/80 text-xs font-medium">
                      {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-b-xl z-10">
              <div className="flex items-center justify-between">
                {isOwner ? (
                  <div className="relative flex items-center space-x-3">
                    <button
                      onClick={() => setShowViewers(!showViewers)}
                      className="flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-white/90 hover:bg-black/60 hover:text-white transition-all"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{currentStory.views?.length || 0}</span>
                    </button>

                    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-white/90">
                      <HeartIconSolid className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-medium">{currentStory.likes?.length || 0}</span>
                    </div>

                    <AnimatePresence>
                      {showViewers && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-0 mb-3 w-64 bg-black/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 max-h-60 overflow-y-auto custom-scrollbar origin-bottom-left"
                        >
                          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                            <h4 className="text-white font-semibold text-sm">Viewers</h4>
                            <span className="text-xs text-white/50">{currentStory.views?.length || 0} total</span>
                          </div>

                          {currentStory.views && currentStory.views.length > 0 ? (
                            <div className="space-y-3">
                              {currentStory.views.map((viewer, idx) => {
                                const hasLiked = currentStory.likes?.some(l => {
                                  const likeId = l._id || l;
                                  const viewerId = viewer._id || viewer;
                                  return String(likeId) === String(viewerId);
                                });
                                return (
                                  <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3">
                                      <img
                                        src={viewer.avatar || 'https://via.placeholder.com/40'}
                                        alt={viewer.username}
                                        className="w-8 h-8 rounded-full border border-white/20 group-hover:border-white/40 transition-colors"
                                      />
                                      <span className="text-white text-sm font-medium">{viewer.username}</span>
                                    </div>
                                    {hasLiked && (
                                      <div className="bg-red-500/20 p-1 rounded-full">
                                        <HeartIconSolid className="w-3 h-3 text-red-500" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-white/50 text-sm">No views yet</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div />
                )}

                {!isOwner && (
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 ${isLiked ? 'bg-red-500/20 text-red-500 scale-110 ring-1 ring-red-500/50' : 'bg-black/40 text-white hover:bg-black/60'}`}
                  >
                    {isLiked ? (
                      <HeartIconSolid className="w-6 h-6" />
                    ) : (
                      <HeartIcon className="w-6 h-6" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-colors z-20"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            )}
            {currentIndex < userStories.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-colors z-20"
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('root') || document.body
  );
}

function StoryCard({ story, isCreateCard = false, isMyStory = false, onCreateClick, onViewClick, count = 1 }) {
  const handleClick = () => {
    if (isCreateCard) {
      onCreateClick();
    } else {
      onViewClick(story);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer group flex-shrink-0"
      onClick={handleClick}
    >
      <div className="w-32 h-52 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 ring-1 ring-black/5 dark:ring-white/10">
        {isCreateCard ? (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-white relative z-10">Create Story</span>
          </div>
        ) : (
          <>
            <img
              src={story.image}
              alt={`${story.user.username}'s story`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80" />

            {count > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-white text-xs font-medium">{count}</span>
              </div>
            )}
          </>
        )}
      </div>

      {!isCreateCard && (
        <>
          <div className="absolute top-3 left-3">
            <div className={`p-0.5 rounded-full bg-gradient-to-tr from-primary-500 to-pink-500`}>
              <img
                src={story.user.avatar}
                alt={story.user.username}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
              />
            </div>
          </div>
          <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold truncate text-shadow">
            {isMyStory ? 'Your Story' : (story.user.fullName || story.user.username)}
          </p>
        </>
      )}
    </motion.div>
  );
}

function Stories() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState([]);

  const dispatch = useDispatch();
  const { items: stories, loading } = useSelector((state) => state.stories);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchStories());
    }
  }, [dispatch, user]);

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewClick = (userStories) => {
    setSelectedUserStories(userStories);
    setIsViewModalOpen(true);
  };

  const groupedStories = Array.isArray(stories) ? stories.reduce((acc, story) => {
    const userId = story.user._id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(story);
    return acc;
  }, {}) : {};

  const myStories = groupedStories[user?._id] || groupedStories[user?.id] || [];

  const otherUsersStories = Object.keys(groupedStories)
    .filter(userId => userId !== user?._id && userId !== user?.id)
    .map(userId => groupedStories[userId]);

  return (
    <>
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 pr-4 mr-2">
            {myStories.length > 0 ? (
              <StoryCard
                story={myStories[0]}
                isMyStory={true}
                count={myStories.length}
                onViewClick={() => handleViewClick(myStories)}
              />
            ) : (
              <StoryCard
                isCreateCard={true}
                onCreateClick={handleCreateClick}
              />
            )}
          </div>

          {loading && otherUsersStories.length === 0 && (
            <div className="flex items-center justify-center w-32 h-52">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {otherUsersStories.map(userStories => (
            <StoryCard
              key={userStories[0]._id}
              story={userStories[0]}
              count={userStories.length}
              onViewClick={() => handleViewClick(userStories)}
            />
          ))}

          {!loading && otherUsersStories.length === 0 && (
            <div className="flex flex-col items-center justify-center w-32 h-52 text-gray-400 text-sm text-center">
              <p>No stories from friends yet</p>
            </div>
          )}
        </div>
      </div>

      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ViewStoryModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        userStories={selectedUserStories}
      />
    </>
  );
}

export default Stories;