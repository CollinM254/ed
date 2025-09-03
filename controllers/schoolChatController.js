// controllers/schoolChatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const School = require('../models/School');
const Admin = require('../models/Admin');

exports.getSchoolConversations = async (req, res) => {
  try {
    // Get school ID from query params instead of auth middleware
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    const conversations = await Conversation.find({
      'participants.id': schoolId,
      'participants.type': 'school'
    })
    .sort({ lastMessageAt: -1 })
    .populate({
      path: 'participants.id',
      select: 'name',
      match: { type: 'admin' }
    });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching school conversations:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.sendSchoolMessage = async (req, res) => {
  const { text, schoolId } = req.body;

  try {
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    // Verify school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Find or create conversation with admin
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { id: schoolId, type: 'school' } },
          { $elemMatch: { type: 'admin' } }
        ]
      }
    });

    if (!conversation) {
      // Get any admin
      const admin = await Admin.findOne().select('_id name');
      if (!admin) {
        return res.status(404).json({ message: 'No admin available' });
      }

      conversation = new Conversation({
        participants: [
          { id: schoolId, type: 'school', name: school.schoolName },
          { id: admin._id, type: 'admin', name: admin.name }
        ],
        isSupportChat: true
      });
    }

    const message = new Message({
      conversationId: conversation._id,
      senderId: schoolId,
      senderType: 'school',
      receiverId: conversation.participants.find(p => p.type === 'admin').id,
      receiverType: 'admin',
      text
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageAt = Date.now();
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    conversation.meta = {
      schoolName: school.schoolName,
      lastMessageSenderType: 'school'
    };
    await conversation.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to('admins').emit('newMessage', message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending school message:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getSchoolMessages = async (req, res) => {
  try {
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    const conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { id: schoolId, type: 'school' } },
          { $elemMatch: { type: 'admin' } }
        ]
      }
    });

    if (!conversation) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = await Message.find({
      conversationId: conversation._id
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching school messages:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};