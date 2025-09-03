const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Create a new message
exports.createMessage = async (req, res) => {
  const { senderId, receiverId, text, images } = req.body;

  try {
    // Check if a conversation already exists between the parent and school
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    // Create a new message
    const message = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text,
      images,
    });

    await message.save();

    // Update the conversation's last message
    conversation.lastMessage = text;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all messages for a conversation
exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  try {
    // Find the conversation between the parent and school
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // Fetch all messages for the conversation
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};