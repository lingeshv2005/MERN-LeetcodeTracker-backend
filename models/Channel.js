import mongoose from "mongoose";

// Schema for reactions (e.g., emoji likes)
const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  reactedBy: { type: String, required: true }
}, { _id: false });

// Schema for individual messages
const channelMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ["text", "image", "document", "voice", "code", "link"],
    required: true
  },
  replyToMessageId: { type: String },
  metadata: {
    filename: String,
    filetype: String,
    filesize: Number,
    duration: Number,
    preview: String,
    language: String
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  },
  reactions: [reactionSchema],
  seenBy: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  isDeletedSoft: { type: Boolean, default: false },
  isDeletedHard: { type: Boolean, default: false },
}, { timestamps: true });

// Sub-schema for participants with preferences and metadata
const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  addedBy: { type: String, default: "link" },
  isMuted: { type: Boolean, default: false },
  lastSeenMessageId: { type: String },
  isArchived: { type: Boolean, default: false },
  customSettings: {
    notificationsEnabled: { type: Boolean, default: true }
  }
}, { _id: false });

// Main channel schema
const channelSchema = new mongoose.Schema({
  communicationId: { type: String, required: true, unique: true },
  channelName: { type: String, required: true },
  description: { type: String, default: "" },
  createdBy: { type: String, required: true },

  adminIds: [participantSchema],
  participants: [participantSchema],

  messages: [channelMessageSchema],

  showJoinLeaveMessages: { type: Boolean, default: true },
  isReadOnly: { type: Boolean, default: false },

  typingStatus: [{
    userId: { type: String },
    isTyping: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
  }],
  pinnedMessages: [{ type: String }]
}, { timestamps: true });

// Export model
const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
