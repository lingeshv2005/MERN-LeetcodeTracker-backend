import Channel from "../models/Channel.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";

export const createChannel = async (req, res) => {
  try {
    const { channelName, description, createdBy, adminId } = req.body;

    const adminEntry = {
      userId: adminId,
      addedBy: adminId,
    };

    const communicationId = uuidv4();

    const newChannel = new Channel({
      communicationId,
      channelName,
      description,
      createdBy,
      adminIds: [adminEntry],
      participants: [adminEntry], // Optional: add creator as participant too
    });

    await newChannel.save();

    await User.findOneAndUpdate(
      { "additionalDetails.userId": adminId },
      { $addToSet: { "additionalDetails.channelIds": communicationId } }
    );

    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a channel by communicationId
export const getChannelByCommunicationId = async (req, res) => {
  try {
    const { communicationId, userId } = req.params;

    const channel = await Channel.findOne({ communicationId });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found 123" });
    }

    const isParticipant = channel.participants.some(
      (participant) => participant.userId === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied: Not a participant" });
    }

    res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  
  // Get all channels where a user is a participant
  export const getChannelsByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
      console.log("Looking for channels for userId:", userId);  // Add this log
  
      const channels = await Channel.find({ "participants.userId": userId });
      if (channels.length === 0) {
        return res.status(404).json({ message: "No channels found for this user" });
      }
  
      res.status(200).json(channels);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
export const addParticipantToChannel = async (req, res) => {
  try {
    const { communicationId } = req.params;
    const { username, addedBy } = req.body;

    // Find the channel
    const channel = await Channel.findOne({ communicationId });
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check if the user adding others is an admin
    const isAdmin = channel.adminIds.some(a => a.userId === addedBy);
    const isParticipant = channel.participants.some(p => p.userId === addedBy);

    // Apply permission rules
    if (channel.isReadOnly && !isAdmin) {
      return res.status(403).json({ error: "Only admins can add participants in read-only channels" });
    }

    if (!channel.isReadOnly && !(isAdmin || isParticipant)) {
      return res.status(403).json({ error: "You must be a participant or admin to add others" });
    }

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.additionalDetails.userId;

    // Check if user is already a participant
    const alreadyParticipant = channel.participants.some(p => p.userId === userId);
    if (alreadyParticipant) {
      return res.status(400).json({ error: "User is already a participant" });
    }

    // Add participant (no role field)
    channel.participants.push({ userId, addedBy });
    await channel.save();

    // Add channelId to user's additionalDetails
    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { "additionalDetails.channelIds": communicationId } }
    );

    res.status(200).json({ message: "Participant added", channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  
export const addMessageToChannel = async (req, res) => {
  try {
    const { communicationId } = req.params;
    const { senderId, content, messageType, metadata, replyToMessageId } = req.body;

    const channel = await Channel.findOne({ communicationId });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isParticipant = channel.participants.some(p => p.userId === senderId);
    const isAdmin = channel.adminIds.some(a => a.userId === senderId);

    // Read-only logic
    if (channel.isReadOnly && !isAdmin) {
      return res.status(403).json({ message: "Only admins can send messages in read-only channels" });
    }

    // Non-participant check (for both read-only and normal)
    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ message: "Sender is not a participant or admin of this channel" });
    }

    const newMessage = {
      messageId: uuidv4(),
      senderId,
      content,
      messageType,
      metadata,
      replyToMessageId
    };

    channel.messages.push(newMessage);
    await channel.save();

    res.status(201).json({ message: "Message added", newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChannelDetails = async (req, res) => {
  const { communicationId } = req.params;
  const {
    channelName,
    description,
    showJoinLeaveMessages,
    isReadOnly
  } = req.body;

  try {
    const channel = await Channel.findOne({ communicationId });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channelName !== undefined) channel.channelName = channelName;
    if (description !== undefined) channel.description = description;
    if (showJoinLeaveMessages !== undefined) channel.showJoinLeaveMessages = showJoinLeaveMessages;
    if (isReadOnly !== undefined) channel.isReadOnly = isReadOnly;

    await channel.save();

    return res.status(200).json({ message: "Channel updated", channel });
  } catch (err) {
    console.error("Error updating channel:", err);
    return res.status(500).json({ message: "Server error" });
  }
};













  

// add channel system messages 
//   who setted pinned messages
//   who added whom at what time 
//   who changed channel settings 

// channel
//   update typingStatus
//   set pinnedMessages


// participants
//   change isMuted
//   change isArchived
//   change customSettings

// messages
//   edit content
//   add replyToMessage
//   update status 
//   add reactions
//   add seenBy
//   change isDeletedSoft



