// src/pages/Messages.jsx
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import TextareaAutosize from "react-textarea-autosize";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PaperClipIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import {
  fetchConversations,
  fetchMessages,
  addMessageToChat,
  clearActiveChat,
  sendMessage,
  markMessagesAsRead,
  updateMessage,
  removeMessage,
} from "../store/messageSlice";
import { setSelectedUser } from "../store/userSlice";
import socket from "../socket";
import NewChatModal from "../components/NewChatModal";
import { useLocation } from "react-router-dom";


const formatDateSafe = (dateString, pattern = "p") => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d)) return "";
  try {
    return format(d, pattern);
  } catch {
    return "";
  }
};

const formatDistanceSafe = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d)) return "";
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
};

export default function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { conversations, activeChat } = useSelector((state) => state.messages);
  const { selectedUser, onlineUsers } = useSelector((state) => state.user);
  const currentUser = useSelector((state) => state.auth.user);

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const bottomRef = useRef(null);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state?.userToMessage) {
      dispatch(setSelectedUser(location.state.userToMessage));
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.items]);

  useEffect(() => {
    if (currentUser) {

      const handleReceiveMessage = (newMessage) => {
        if (
          selectedUser &&
          (
            (newMessage.sender._id === selectedUser._id || newMessage.sender === selectedUser._id) ||
            (newMessage.receiver._id === selectedUser._id || newMessage.receiver === selectedUser._id)
          )
        ) {
          dispatch(addMessageToChat(newMessage));
          dispatch(markMessagesAsRead(selectedUser._id));
        }
        dispatch(fetchConversations());
      };

      const handleConversationsUpdated = () => {
        dispatch(fetchConversations());
      };

      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("conversationsUpdated", handleConversationsUpdated);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("conversationsUpdated", handleConversationsUpdated);
      };
    }
  }, [currentUser, selectedUser, dispatch]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchMessages(selectedUser._id));
      dispatch(markMessagesAsRead(selectedUser._id));
    } else {
      dispatch(clearActiveChat());
    }
  }, [dispatch, selectedUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if ((!message.trim() && !media) || !selectedUser || isSending) return;

    setIsSending(true);
    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      sender: currentUser,
      receiver: selectedUser,
      content: message,
      media: mediaPreview,
      mediaType: media?.type?.startsWith('video') ? 'video' : 'image',
      createdAt: new Date().toISOString(),
      sending: true,
    };

    try {
      dispatch(addMessageToChat(optimisticMessage));
      setMessage("");
      clearMedia();

      const result = await dispatch(sendMessage({
        receiverId: selectedUser._id,
        content: optimisticMessage.content,
        media: media
      })).unwrap();

      dispatch(updateMessage({ tempId, message: result }));

    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.message || "Failed to send message");
      dispatch(removeMessage(tempId));
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.items.filter((convo) =>
    (convo.user?.username && convo.user.username.toLowerCase().includes(search.toLowerCase())) ||
    (convo.user?.fullName && convo.user.fullName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleNewChat = () => {
    setIsNewChatOpen(true);
  };

  const handleCloseChat = () => {
    dispatch(clearActiveChat());
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="flex h-[calc(100vh-100px)] glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-80 md:w-96 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-xl">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Messages</h2>
            <button
              onClick={handleNewChat}
              className="p-2.5 rounded-full bg-primary-500/10 text-primary-600 hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-primary-500/30"
              title="New Message"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <>
              {filteredConversations.map((convo) => (
                <div
                  key={convo.user._id}
                  onClick={() => {
                    dispatch(setSelectedUser(convo.user));
                    setSearch("");
                  }}
                  className={`group p-3 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent ${selectedUser?._id === convo.user._id
                    ? "bg-primary-500/10 border-primary-500/20 shadow-sm"
                    : "hover:bg-white/5 hover:border-white/10"
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={convo.user.avatar || 'https://via.placeholder.com/40'}
                        alt={convo.user.username}
                        className={`w-12 h-12 rounded-full object-cover border-2 transition-colors ${selectedUser?._id === convo.user._id ? "border-primary-500" : "border-transparent group-hover:border-white/20"
                          }`}
                      />
                      {onlineUsers.includes(convo.user._id) && (
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`font-semibold truncate transition-colors ${selectedUser?._id === convo.user._id ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white"
                          }`}>
                          {convo.user.fullName || convo.user.username}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatDistanceSafe(convo.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate transition-colors flex-1 ${selectedUser?._id === convo.user._id ? "text-primary-500/80" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                          }`}>
                          {convo.lastMessage?.sender === currentUser.id ? "You: " : ""}
                          {convo.lastMessage?.content || convo.lastMessage?.text || "Sent an attachment"}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm relative">
        {selectedUser ? (
          <>
            <div className="absolute top-4 left-4 right-4 z-20">
              <div className="px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar || 'https://via.placeholder.com/40'}
                      alt={selectedUser.username}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    {onlineUsers.includes(selectedUser._id) && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white leading-tight">
                      {selectedUser.fullName || selectedUser.username}
                    </h2>
                    <p className={`text-xs font-medium ${onlineUsers.includes(selectedUser._id) ? "text-green-500" : "text-gray-500"}`}>
                      {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title="Close Chat"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 custom-scrollbar scroll-smooth">
              {activeChat.items.map((msg, idx) => {
                const isMe =
                  (msg.sender._id && (msg.sender._id === currentUser.id || msg.sender._id === currentUser._id)) ||
                  (msg.sender.id && (msg.sender.id === currentUser.id || msg.sender.id === currentUser._id)) ||
                  msg.sender === currentUser.id ||
                  msg.sender === currentUser._id;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    key={msg._id || idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-3`}>
                      {!isMe && (
                        <img
                          src={msg.sender.avatar || selectedUser.avatar || 'https://via.placeholder.com/30'}
                          alt="Sender"
                          className="w-8 h-8 rounded-full mb-1 border border-white/10 shadow-sm"
                        />
                      )}

                      <div className={`group relative px-5 py-3.5 shadow-md transition-all duration-200 hover:shadow-lg ${isMe
                        ? "bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm"
                        }`}>

                        {msg.media && (
                          <div className="mb-2 rounded-lg overflow-hidden relative">
                            {msg.mediaType === 'video' ? (
                              <video src={msg.media} controls className={`max-w-full max-h-60 object-cover ${msg.sending ? 'opacity-50' : ''}`} />
                            ) : (
                              <img src={msg.media} alt="Attachment" className={`max-w-full max-h-60 object-cover ${msg.sending ? 'opacity-50' : ''}`} />
                            )}
                            {msg.sending && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}

                        {msg.content && <p className="text-[15px] leading-relaxed tracking-wide">{msg.content}</p>}

                        <span className={`text-[10px] block mt-1.5 font-medium transition-opacity opacity-60 group-hover:opacity-100 ${isMe ? "text-primary-100" : "text-gray-400"
                          }`}>
                          {formatDateSafe(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-6 pt-2">
              {mediaPreview && (
                <div className="mb-2 relative inline-block">
                  <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-lg">
                    {media?.type?.startsWith('video') ? (
                      <video src={mediaPreview} className="h-24 w-auto object-cover" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="h-24 w-auto object-cover" />
                    )}
                    <button
                      onClick={clearMedia}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-lg flex items-end gap-2">

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Attach file"
                >
                  <PaperClipIcon className="h-6 w-6" />
                </button>

                <TextareaAutosize
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 py-3 px-4 resize-none max-h-32 custom-scrollbar"
                  minRows={1}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={(!message.trim() && !media) || isSending}
                  className="p-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center"
                >
                  {isSending ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
                  )}
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-transparent pointer-events-none"></div>
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-primary-500/10">
              <PaperAirplaneIcon className="w-14 h-14 text-primary-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Your Messages</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">
              Select a conversation or start a new one to connect with your friends instantly.
            </p>
          </div>
        )}
      </div>
      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
    </div>
  );
}
