import Chat from "../models/chat.model.js";
import { v4 as uuidv4 } from "uuid";

export const sendMessage = async (req, res) => {
  try {
    console.log("chatting");
    const userId = req.user._id.toString();
    let {
      title,
      chatId,
      usercontent,
      aicontent,
      images = null,
      audio = null,
      aiaudio = null,
    } = req.body;
    if (!usercontent || !aicontent) {
      return res.status(400).json({ error: "Content is required" });
    }

    let chat;
    chat = await Chat.findOne({ chatId, userId });
    if (!chatId || chatId.trim() === "" || !chat) {
      chatId = uuidv4();
      chat = new Chat({
        title: title,
        chatId,
        userId,
        messages: [],
      });
    }
    chat.title = title ? title : "New Conversation";
    const userMessage = {
      chatId,
      role: "user",
      content: usercontent,
      images,
      audio,
    };

    chat.messages.push(userMessage);
    await chat.save();

    const assistantMessage = {
      chatId,
      role: "assistant",
      content: aicontent,
      audio: aiaudio,
    };

    chat.messages.push(assistantMessage);
    await chat.save();
    res.status(200).json({
      message: "Message sent and processed successfully",
      chat: {
        _id: chat._id,
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getChatList = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const chats = await Chat.find({ userId })
      .select("chatId title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    if (!chats.length) {
      return res.status(200).json({ message: "No chats found", chats: [] });
    }

    res.status(200).json({
      message: "Chat list retrieved successfully",
      chats,
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ error: "Failed to fetch chat list" });
  }
};

export const getChatById = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { chatId } = req.params;

    const chat = await Chat.findOne({ chatId, userId }).select(
      "_id chatId title userId messages createdAt updatedAt"
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({
      message: "Chat retrieved successfully",
      chat: {
        _id: chat._id,
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};

export const updateChatTitle = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const chat = await Chat.findOneAndUpdate(
      { chatId, userId },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({
      message: "Chat title updated successfully",
      chat: {
        _id: chat._id,
        chatId: chat.chatId,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    res.status(500).json({ error: "Failed to update chat title" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { chatId } = req.params;

    const chat = await Chat.findOneAndDelete({ chatId, userId });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({
      message: "Chat deleted successfully",
      chatId,
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};
