//const AdminSupportConversation = require("../models/adminSupportConversation");
//const AdminSupportMessage = require("../models/adminSupportMessage");
//const mongoose = require("mongoose");
//const VENDOR_ADMIN_ID = "vendor-admin";
//
//// School-specific methods
//exports.createSchoolMessage = async (req, res) => {
//  try {
//    const { text } = req.body;
//    const senderId = req.school._id;
//
//    let conversation = await AdminSupportConversation.findOne({
//      schoolId: senderId,
//      adminId: VENDOR_ADMIN_ID
//    });
//
//    if (!conversation) {
//      const school = await mongoose.model("School").findById(senderId).select("schoolName");
//      if (!school) return res.status(404).json({ message: "School not found." });
//
//      conversation = new AdminSupportConversation({
//        schoolId: senderId,
//        adminId: VENDOR_ADMIN_ID,
//        schoolName: school.schoolName,
//        unreadCount: 1
//      });
//    } else {
//      conversation.unreadCount += 1;
//    }
//
//    const message = new AdminSupportMessage({
//      conversationId: conversation._id,
//      senderId,
//      receiverId: VENDOR_ADMIN_ID,
//      text,
//      senderType: 'school'
//    });
//
//    await message.save();
//    conversation.lastMessage = text;
//    conversation.lastMessageAt = Date.now();
//    await conversation.save();
//
//    const io = req.app.get("io");
//    io.to(`support_${conversation._id}`).emit("newSupportMessage", message);
//
//    res.status(201).json({ success: true, message, conversation });
//  } catch (error) {
//    console.error("Error creating message:", error);
//    res.status(500).json({ message: "Internal server error" });
//  }
//};
//
//exports.getSchoolMessages = async (req, res) => {
//  try {
//    const { conversationId } = req.query;
//    const messages = await AdminSupportMessage.find({ conversationId })
//      .sort({ createdAt: 1 });
//
//    res.status(200).json({ success: true, messages });
//  } catch (error) {
//    console.error("Error fetching messages:", error);
//    res.status(500).json({ message: "Internal server error" });
//  }
//};
//
//exports.getSchoolConversations = async (req, res) => {
//  try {
//    const conversations = await AdminSupportConversation.find({
//      schoolId: req.school._id
//    }).sort({ lastMessageAt: -1 });
//
//    res.status(200).json({ success: true, conversations });
//  } catch (error) {
//    console.error("Error fetching conversations:", error);
//    res.status(500).json({ message: "Internal server error" });
//  }
//};
//
//// Admin-specific methods
//exports.getSupportMessages = async (req, res) => {
//  try {
//    const { conversationId } = req.query;
//    const messages = await AdminSupportMessage.find({ conversationId })
//      .sort({ createdAt: 1 });
//
//    // Mark messages as read
//    await AdminSupportMessage.updateMany(
//      { conversationId, isRead: false, senderType: 'school' },
//      { $set: { isRead: true } }
//    );
//
//    await AdminSupportConversation.findByIdAndUpdate(
//      conversationId,
//      { $set: { unreadCount: 0 } }
//    );
//
//    res.status(200).json({ success: true, messages });
//  } catch (error) {
//    console.error("Error fetching messages:", error);
//    res.status(500).json({ message: "Internal server error" });
//  }
//};
//
//// ... keep other admin methods (getSupportConversations, markSupportMessagesRead) the same ...
//
//// Get all support conversations for admin or school
//
//exports.getSupportConversations = async (req, res) => {
//  try {
//    // Since there's only one admin, just find all conversations
//    const conversations = await AdminSupportConversation.find()
//      .sort({ lastMessageAt: -1 });
//
//    res.status(200).json({ success: true, conversations });
//  } catch (error) {
//    console.error("Error fetching support conversations:", error);
//    res.status(500).json({ message: "Internal server error." });
//  }
//};
//
//// Mark support messages as read
//exports.markSupportMessagesRead = async (req, res) => {
//  const { conversationId } = req.body;
//
//  try {
//    await AdminSupportMessage.updateMany(
//      { conversationId, isRead: false },
//      { $set: { isRead: true } }
//    );
//
//    await AdminSupportConversation.findByIdAndUpdate(
//      conversationId,
//      { $set: { unreadCount: 0 } }
//    );
//
//    res.status(200).json({ success: true });
//  } catch (error) {
//    console.error("Error marking support messages as read:", error);
//    res.status(500).json({ message: "Internal server error." });
//  }
//};

// controllers/adminSupportController.js

const AdminSupportConversation = require("../models/adminSupportConversation");
const AdminSupportMessage = require("../models/adminSupportMessage");
const mongoose = require("mongoose");
const School = mongoose.model("School");
const VENDOR_ADMIN_ID = "vendor-admin";

// School-specific methods
exports.createSchoolMessage = async (req, res) => {
  try {
    const { text, schoolId } = req.body;

    // Find school to get school details
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    let conversation = await AdminSupportConversation.findOne({
      schoolId: schoolId,
      adminId: VENDOR_ADMIN_ID
    });

    if (!conversation) {
      conversation = new AdminSupportConversation({
        schoolId: schoolId,
        adminId: VENDOR_ADMIN_ID,
        schoolName: school.schoolName,
        schoolAddress: `${school.location}, ${school.village}, ${school.address}`,
        unreadCount: 1
      });
    } else {
      conversation.unreadCount += 1;
    }

    const message = new AdminSupportMessage({
      conversationId: conversation._id,
      senderId: schoolId,
      receiverId: VENDOR_ADMIN_ID,
      text,
      senderType: 'school'
    });

    await message.save();
    conversation.lastMessage = text;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    const io = req.app.get("io");
    io.to(`support_${conversation._id}`).emit("newSupportMessage", {
      ...message.toObject(),
      conversationId: conversation._id,
      schoolName: school.schoolName,
      schoolAddress: `${school.location}, ${school.village}, ${school.address}`
    });

    res.status(201).json({
      success: true,
      message,
      conversation: {
        ...conversation.toObject(),
        schoolAddress: `${school.location}, ${school.village}, ${school.address}`
      }
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSchoolMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;
    const messages = await AdminSupportMessage.find({ conversationId })
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSchoolConversations = async (req, res) => {
  try {
    const { schoolId } = req.query;
    const conversations = await AdminSupportConversation.find({
      schoolId: schoolId
    }).sort({ lastMessageAt: -1 });

    // Populate with school details
    const populatedConversations = await Promise.all(conversations.map(async conv => {
      const school = await School.findById(conv.schoolId);
      return {
        ...conv.toObject(),
        schoolAddress: school ? `${school.location}, ${school.village}, ${school.address}` : 'Address not available'
      };
    }));

    res.status(200).json({ success: true, conversations: populatedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin methods
exports.getSupportMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;
    const messages = await AdminSupportMessage.find({ conversationId })
      .sort({ createdAt: 1 });

    // Mark messages as read
    await AdminSupportMessage.updateMany(
      { conversationId, isRead: false, senderType: 'school' },
      { $set: { isRead: true } }
    );

    await AdminSupportConversation.findByIdAndUpdate(
      conversationId,
      { $set: { unreadCount: 0 } }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSupportConversations = async (req, res) => {
  try {
    const conversations = await AdminSupportConversation.find()
      .sort({ lastMessageAt: -1 });

    // Populate with school details
    const populatedConversations = await Promise.all(conversations.map(async conv => {
      const school = await School.findById(conv.schoolId);
      return {
        ...conv.toObject(),
        schoolAddress: school ? `${school.location}, ${school.village}, ${school.address}` : 'Address not available'
      };
    }));

    res.status(200).json({ success: true, conversations: populatedConversations });
  } catch (error) {
    console.error("Error fetching support conversations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.markSupportMessagesRead = async (req, res) => {
  const { conversationId } = req.body;

  try {
    await AdminSupportMessage.updateMany(
      { conversationId, isRead: false },
      { $set: { isRead: true } }
    );

    await AdminSupportConversation.findByIdAndUpdate(
      conversationId,
      { $set: { unreadCount: 0 } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking support messages as read:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createAdminMessage = async (req, res) => {
  try {
    const { text, conversationId, schoolId } = req.body;

    const conversation = await AdminSupportConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const message = new AdminSupportMessage({
      conversationId: conversation._id,
      senderId: VENDOR_ADMIN_ID,
      receiverId: schoolId,
      text,
      senderType: 'admin'
    });

    await message.save();
    conversation.lastMessage = text;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    const io = req.app.get("io");
    io.to(`support_${conversation._id}`).emit("newSupportMessage", message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};