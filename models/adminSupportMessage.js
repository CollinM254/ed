const mongoose = require("mongoose");

const adminSupportMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminSupportConversation",
      required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId (school) or String (admin)
        required: true
      },
      receiverId: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId (school) or String (admin)
        required: true
      },
    text: {
      type: String,
    },
    images: {
      type: [String],
    },
    isRead: {
      type: Boolean,
      default: false
    },
    senderType: {
      type: String,
      enum: ['school', 'admin'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSupportMessage", adminSupportMessageSchema);