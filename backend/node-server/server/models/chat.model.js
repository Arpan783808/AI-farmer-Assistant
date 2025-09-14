// chat.model.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {  
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      default: [],
    },
    audio: {  
      type: Array,
      default: [],
    },
    rating: {
      type: String,
      enum: ['helpful', 'not_helpful', 'neutral'],
      default: 'neutral',
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    chatId: {
      type: String,
      required: true,
      index: true,  
    },
    userId: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;