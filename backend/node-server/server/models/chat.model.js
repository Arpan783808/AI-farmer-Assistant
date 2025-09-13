import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"], 
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: {
        type: Array,
        default: []
    },
    rating: {
      type: String,
      enum: ["helpful", "not_helpful", "neutral"],
      default: "neutral",
    },
  },
  { timestamps: true }
);

// use _id to identify unique chats or we can use uuids
// for now we will be using _id only
const chatSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
        default: "New Chat"
    },
    chatId: {
      type: String,
      required: false,
    //   index: true,
    },
    userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
      type: String,
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
