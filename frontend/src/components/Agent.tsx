import {
  Bot,
  Bug,
  Camera,
  Cloud,
  Image as ImageIcon,
  Mail,
  Menu,
  MessageCircle,
  Mic,
  Paperclip,
  Plus,
  Send,
  Square,
  User,
  Volume2,
  X,
} from "lucide-react";

import React, { useCallback, useEffect, useRef, useState } from "react";

import farmingHero from "../../public/placeholder.svg";

// Types
interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  image?: string;
  audio?: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Sidebar Component
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
          ${isOpen ? "w-80" : "lg:w-16"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-icon"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {isOpen && (
            <button
              onClick={onNewChat}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          )}

          {!isOpen && (
            <button
              onClick={onNewChat}
              className="btn btn-secondary btn-icon"
              title="New Chat"
            >
              {/* <Plus className="h-4 w-4" /> */}
            </button>
          )}
        </div>
        {/* Chat History */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`
                    w-full text-left p-3 rounded-xl transition-colors duration-200 group
                    ${
                      activeChat === chat.id
                        ? "bg-chat-active border border-primary/20"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chat.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {chats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsed state icon only */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center py-4 space-y-4">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="New Chat"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Welcome Screen Component
interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Camera,
    text: "Analyze this soil sample image",
    prompt:
      "I'd like you to analyze a soil sample image I'm going to upload. Please help me understand the soil composition and health.",
  },
  {
    icon: Cloud,
    text: "What's the 5-day weather forecast?",
    prompt:
      "Can you provide me with the 5-day weather forecast for my farm location? I need to plan my farming activities accordingly.",
  },
  {
    icon: Bug,
    text: "Identify this pest or disease",
    prompt:
      "I found something concerning on my crops. Can you help me identify if this is a pest or disease and suggest treatment options?",
  },
  {
    icon: Mail,
    text: "Draft an email to my distributor",
    prompt:
      "I need help drafting a professional email to my crop distributor regarding pricing and delivery schedules.",
  },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={farmingHero}
          alt="AI Farming Assistant"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40" />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Logo/Title */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-sage rounded-3xl mb-6 shadow-lg">
            <span className="text-3xl text-primary-foreground font-bold">
              🌱
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            AI Farmer Assistant
          </h1>
          <p className="text-xl text-muted-foreground">
            How can I assist your farm today?
          </p>
        </div>

        {/* Suggestion Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="suggestion-chip text-left p-4 hover:shadow-md transition-all duration-200 group bg-background/80 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-light to-primary/20 rounded-xl flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-200">
                  <suggestion.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium leading-relaxed">
                  {suggestion.text}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-sm text-muted-foreground">
          <p className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            You can ask questions about crops, upload images for analysis, or
            record voice messages.
          </p>
        </div>
      </div>
    </div>
  );
};
// Chat Interface Component
interface ChatInterfaceProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageContent = (content: string) => {
    // Basic markdown support
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
      );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${
            message.type === "user" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* AI Avatar */}
          {message.type === "ai" && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
          )}

          {/* Message Content */}
          {/* TODO */}
          <div
            className={`max-w-[80%] ${
              message.type === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            } rounded-2xl p-4`}
          >
            {/* Image if present */}
            {message.image && (
              <div className="mb-3">
                <img
                  src={message.image}
                  alt="Uploaded"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Audio if present */}
            {message.audio && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <audio controls className="flex-1">
                  <source src={message.audio} type="audio/webm" />
                  <source src={message.audio} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatMessageContent(message.content),
                }}
              />
            )}

            {/* Timestamp */}
            <div
              className={`text-xs mt-2 ${
                message.type === "user"
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>

          {/* User Avatar */}
          {message.type === "user" && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="bg-muted rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm text-muted-foreground">
                AI is thinking...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Input Bar Component
interface InputBarProps {
  onSendMessage: (content: {
    text: string;
    image?: File;
    audio?: Blob;
  }) => void;
  disabled?: boolean;
  isVoiceRecording?: boolean;
  onStartVoiceRecognition?: () => void;
  onStopVoiceRecognition?: () => void;
}

const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  disabled = false,
  isVoiceRecording = false,
  onStartVoiceRecognition,
  onStopVoiceRecognition,
}) => {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasContent = text.trim() || selectedImage || audioBlob;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleSend = () => {
    if (!hasContent || disabled) return;

    onSendMessage({
      text: text.trim(),
      image: selectedImage || undefined,
      audio: audioBlob || undefined,
    });

    // Reset form
    setText("");
    setSelectedImage(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {/* Attachments */}
      {(selectedImage || audioBlob) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedImage && (
            <div className="relative bg-muted rounded-lg p-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm truncate max-w-[200px]">
                {selectedImage.name}
              </span>
              <button
                onClick={removeImage}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* TODO-MIC */}
          {audioBlob && (
            <div className="relative bg-muted rounded-lg p-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Audio recording ({formatTime(recordingTime)})
              </span>
              <button
                onClick={removeAudio}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Text Input Area */}
        <div className="p-4 pb-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your crops, upload an image, or record a question..."
            className="w-full min-h-[44px] max-h-[120px] border-0 bg-transparent focus:ring-0 focus:border-0 focus:outline-none outline-none ring-0 resize-none text-gray-900 placeholder-gray-500 text-base leading-6"
            disabled={disabled}
            rows={1}
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-100">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload image"
              disabled={disabled}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            {/* Voice Recognition Button */}
            <button
              type="button"
              onClick={() => {
                if (isVoiceRecording) {
                  onStopVoiceRecognition?.();
                } else {
                  onStartVoiceRecognition?.();
                }
              }}
              disabled={disabled || isRecording}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isVoiceRecording
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}
              title={
                isVoiceRecording
                  ? "Stop voice recognition"
                  : "Start voice recognition"
              }
            >
              {isVoiceRecording ? (
                <Square className="w-4 h-4 animate-pulse" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            {/* Audio Recording Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isVoiceRecording}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}
              title="Record audio"
            >
              {isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || disabled}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                hasContent && !disabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md transform hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

// Main Agent Component
const Agent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //(TODO) fetch history from backend and set in chats
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "Soil Analysis: North Field",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      messages: [],
    },
    {
      id: "2",
      title: "Pest Identification on Corn",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      messages: [],
    },
  ]);

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NEW: Voice Recognition States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  const currentChat = chats.find((chat) => chat.id === activeChat);

  const stopVoiceRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsVoiceRecording(false);
    }
  }, [recognition]);

  // NEW: Audio Playback Function
  const playAudioResponse = useCallback((audioBase64: string) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    } catch (error) {
      console.error("Failed to create audio:", error);
    }
  }, []);

  //(TODO) generate chat title from backend using LLM
  const generateChatTitle = (message: string): string => {
    // Simple title generation based on keywords
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("soil") || lowerMessage.includes("sample")) {
      return "Soil Analysis Discussion";
    } else if (
      lowerMessage.includes("pest") ||
      lowerMessage.includes("bug") ||
      lowerMessage.includes("disease")
    ) {
      return "Pest/Disease Identification";
    } else if (
      lowerMessage.includes("weather") ||
      lowerMessage.includes("forecast")
    ) {
      return "Weather Inquiry";
    } else if (
      lowerMessage.includes("email") ||
      lowerMessage.includes("letter") ||
      lowerMessage.includes("draft")
    ) {
      return "Communication Assistance";
    } else if (
      lowerMessage.includes("crop") ||
      lowerMessage.includes("plant")
    ) {
      return "Crop Management";
    } else {
      return "Farm Consultation";
    }
  };

  //(TODO) generate AI response from backend using LLM
  const generateAIResponse = (
    userMessage: string,
    hasImage: boolean,
    hasAudio: boolean
  ): string => {
    // Simulate AI responses based on input type
    if (hasImage) {
      return "I can see the image you've uploaded. Let me analyze it for you.\n\n**Analysis:**\n- The image appears to show agricultural content\n- I can help identify potential issues or provide recommendations\n- For more detailed analysis, please describe what specific concerns you have\n\n*Would you like me to focus on any particular aspect of what I'm seeing?*";
    }

    if (hasAudio) {
      return "I've received your voice message. Based on what you've shared:\n\n**Key Points:**\n- I understand your farming concern\n- Let me provide some initial guidance\n- Voice input allows for more natural communication\n\n*Feel free to continue our conversation in whatever format is most convenient for you.*";
    }

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("soil")) {
      return "**Soil Analysis Guidance**\n\nFor proper soil analysis, I recommend:\n\n1. **Sampling Method**: Collect samples from multiple locations\n2. **Testing Parameters**: pH, nutrients, organic matter\n3. **Seasonal Timing**: Best done before planting season\n\n*What specific soil concerns are you experiencing?*";
    }

    if (lowerMessage.includes("weather")) {
      return "**Weather Information**\n\nI'd be happy to help with weather-related farming decisions. However, I'll need your specific location to provide accurate forecasts.\n\n**Planning Considerations:**\n- Planting schedules\n- Irrigation needs\n- Harvest timing\n- Pest management\n\n*Could you share your farm's location or region?*";
    }

    if (lowerMessage.includes("pest") || lowerMessage.includes("disease")) {
      return "**Pest & Disease Management**\n\nFor effective identification and treatment:\n\n1. **Visual Inspection**: Upload clear photos of affected areas\n2. **Symptom Description**: Leaf discoloration, growth patterns, etc.\n3. **Environmental Factors**: Recent weather, watering, fertilization\n\n**Common Signs to Look For:**\n- Leaf damage patterns\n- Unusual growth\n- Insect presence\n\n*Please share images or describe the symptoms you're observing.*";
    }

    return "Thank you for reaching out! I'm here to help with all your farming needs.\n\n**I can assist with:**\n- Crop management and planning\n- Soil health and testing\n- Pest and disease identification\n- Weather-based recommendations\n- Equipment and technique advice\n\n*What specific farming challenge can I help you with today?*";
  };

  const handleNewChat = useCallback(() => {
    setActiveChat(null);
    setSidebarOpen(false);
  }, []);

  const handleChatSelect = useCallback((chatId: string) => {
    setActiveChat(chatId);
    setSidebarOpen(false);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    // Create new chat with suggestion
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: generateChatTitle(suggestion),
      timestamp: new Date(),
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChatId);

    // Add user message and simulate AI response
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: suggestion,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === newChatId ? { ...chat, messages: [userMessage] } : chat
        )
      );

      // Simulate AI response with delay
      setIsLoading(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: generateAIResponse(suggestion, false, false),
          timestamp: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === newChatId
              ? { ...chat, messages: [userMessage, aiResponse] }
              : chat
          )
        );

        setIsLoading(false);
      }, 1500);
    }, 100);
  }, []);

  const handleSendMessage = useCallback(
    async (content: { text: string; image?: File; audio?: Blob }) => {
      if (!content.text.trim() && !content.image && !content.audio) return;

      let chatId = activeChat;

      // Create new chat if none active
      if (!chatId) {
        chatId = Date.now().toString();
        const newChat: Chat = {
          id: chatId,
          title: generateChatTitle(content.text || "New Conversation"),
          timestamp: new Date(),
          messages: [],
        };

        setChats((prev) => [newChat, ...prev]);
        setActiveChat(chatId);
      }

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: content.text,
        image: content.image ? URL.createObjectURL(content.image) : undefined,
        audio: content.audio ? URL.createObjectURL(content.audio) : undefined,
        timestamp: new Date(),
      };

      // Add user message immediately
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, userMessage] }
            : chat
        )
      );

      // Call Malayalam API
      setIsLoading(true);
      try {
        console.log("🔄 Calling Malayalam API...");
        const formData = new FormData();

        if (content.audio) {
          formData.append("audio_file", content.audio, "audio.webm");
        } else if (content.text) {
          formData.append("text_input", content.text);
        }

        if (content.image) {
          formData.append("has_image", "true");
        }

        const response = await fetch("http://localhost:10000/api/v1/ai/chat", {
          method: "POST",
          body: formData,
        });

        console.log("📡 API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📨 API Result:", result);

        if (result.success) {
          // Create AI response
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: result.response_text,
            timestamp: new Date(),
            // Add audio response if available
            audio: result.audio_base64
              ? `data:audio/mp3;base64,${result.audio_base64}`
              : undefined,
          };

          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? { ...chat, messages: [...chat.messages, aiResponse] }
                : chat
            )
          );

          // Play audio response if available
          if (result.audio_base64) {
            setTimeout(() => {
              playAudioResponse(result.audio_base64);
            }, 500);
          }
        } else {
          throw new Error(result.error || "API call failed");
        }
      } catch (error: unknown) {
        console.error("❌ Error calling Malayalam API:", error);
        // Safely derive an error message from unknown
        const errMsg = error instanceof Error ? error.message : String(error);

        // Fallback to original dummy response on error
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Error: ${errMsg}. Please check console for details.`,
          timestamp: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, aiResponse] }
              : chat
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeChat, playAudioResponse]
  );
  const startVoiceRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = "ml-IN";
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;
    recognitionInstance.continuous = false;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Voice recognized:", transcript);
      handleSendMessage({ text: transcript });
      setIsVoiceRecording(false);
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsVoiceRecording(false);
      alert("Voice recognition failed. Please try again.");
    };

    recognitionInstance.onend = () => {
      setIsVoiceRecording(false);
    };

    recognitionInstance.start();
    setIsVoiceRecording(true);
    setRecognition(recognitionInstance);
  }, [handleSendMessage]);
  return (
    <div className="flex h-screen bg-background">
      {/* Top Navigation */}'
      <a
        href="/"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/90 backdrop-blur border border-gray-200 shadow hover:bg-white transition-colors"
      >
        <span>Back</span>
        <span className="text-lg">🏠</span>
      </a>
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border lg:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-icon"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">AI Farmer Assistant</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>
      {/* Voice Recording Indicator */}
      {isVoiceRecording && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium animate-pulse z-50">
          🎤 Listening... Speak now
        </div>
      )}
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <div className="pt-16 lg:pt-0 flex-1 flex flex-col">
          {/* Chat Area */}
          {activeChat && currentChat ? (
            <>
              <ChatInterface
                messages={currentChat.messages}
                isLoading={isLoading}
              />
              <InputBar
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                isVoiceRecording={isVoiceRecording}
                onStartVoiceRecognition={startVoiceRecognition}
                onStopVoiceRecognition={stopVoiceRecognition}
              />
            </>
          ) : (
            <>
              <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
              <InputBar
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                isVoiceRecording={isVoiceRecording}
                onStartVoiceRecognition={startVoiceRecognition}
                onStopVoiceRecognition={stopVoiceRecognition}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agent;
