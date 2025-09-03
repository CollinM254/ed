const mongoose = require("mongoose");

const adminSupportConversationSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  adminId: {
    type: String,
    required: true,
    default: "vendor-admin" // Fixed string ID
  },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    schoolName: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSupportConversation", adminSupportConversationSchema);