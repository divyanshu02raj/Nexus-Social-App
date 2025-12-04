//backend\controllers\messageController.js
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { userId } = req.params;

  console.log('sendMessage request:', { content, file: req.file, body: req.body });

  if (!content && !req.file) {
    res.status(400);
    throw new Error('Message content or media is required');
  }

  let media = "";
  let mediaType = "";

  if (req.file) {
    media = req.file.path;
    mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  }

  const receiver = await User.findById(userId);
  if (!receiver) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: userId,
    content: content || "",
    media,
    mediaType
  });

  const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName username avatar _id');

  const io = req.app.get('io');
  if (io) {
    io.to(userId).emit('receiveMessage', populatedMessage);
    io.to(req.user._id.toString()).emit('conversationsUpdated');
    io.to(userId).emit('conversationsUpdated');
  } else {
    console.error('Socket.io instance not found in request app');
  }

  res.status(201).json(populatedMessage);
});


export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  })
    .populate('sender', 'fullName username avatar _id')
    .sort({ createdAt: 'asc' });

  res.json(messages);
});


export const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  console.log('getConversations for user:', currentUserId);

  const messages = await Message.find({ $or: [{ sender: currentUserId }, { receiver: currentUserId }] })
    .populate('sender', 'fullName username avatar _id')
    .populate('receiver', 'fullName username avatar _id')
    .sort({ createdAt: -1 });

  console.log('Found messages count:', messages.length);

  const conversationsMap = new Map();
  messages.forEach(message => {
    const otherUser = message.sender._id.equals(currentUserId) ? message.receiver : message.sender;

    if (!otherUser) {
      console.log('Skipping message with missing otherUser:', message._id);
      return;
    }

    const otherUserId = otherUser._id.toString();
    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, {
        user: otherUser,
        lastMessage: message,
      });
    }
  });

  const conversationList = Array.from(conversationsMap.values());

  const conversationsWithUnread = await Promise.all(conversationList.map(async (convo) => {
    const unreadCount = await Message.countDocuments({
      sender: convo.user._id,
      receiver: currentUserId,
      read: false
    });
    return { ...convo, unreadCount };
  }));

  res.json(conversationsWithUnread);
});


export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  await Message.updateMany(
    { sender: userId, receiver: currentUserId, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({ message: 'Messages marked as read' });
});