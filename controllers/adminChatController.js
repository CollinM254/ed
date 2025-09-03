// controllers/adminChatController.js
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Get all admin conversations
exports.getAdminConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      "participants.type": "admin"
    })
    .sort({ lastMessageAt: -1 })
    .populate({
      path: "participants.id",
      select: "name schoolName", // Adjust based on your schema
      match: { type: "school" } // Only populate school participants
    });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("Error fetching admin conversations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get messages between admin and school
exports.getAdminMessages = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { id: schoolId, type: "school" } },
          { $elemMatch: { id: req.user._id, type: "admin" } }
        ]
      }
    });

    if (!conversation) {
      return res.status(200).json({ success: true, messages: [] });
    }

    // Mark messages as read when admin opens the chat
    await Message.updateMany(
      {
        conversationId: conversation._id,
        receiverId: req.user._id,
        read: false
      },
      { $set: { read: true } }
    );

    // Reset unread count
    conversation.unreadCount = 0;
    await conversation.save();

    const messages = await Message.find({
      conversationId: conversation._id
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Send message from admin to school
exports.sendAdminMessage = async (req, res) => {
  const { schoolId, text } = req.body;

  try {
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { id: schoolId, type: "school" } },
          { $elemMatch: { id: req.user._id, type: "admin" } }
        ]
      }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { id: schoolId, type: "school" },
          { id: req.user._id, type: "admin" }
        ]
      });
    }

    const message = new Message({
      conversationId: conversation._id,
      senderId: req.user._id,
      senderType: "admin",
      receiverId: schoolId,
      receiverType: "school",
      text
    });

    await message.save();

    conversation.lastMessage = text;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    // Emit socket event
    const io = req.app.get("io");
    io.to(`school_${schoolId}`).emit("newMessage", message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sending admin message:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};