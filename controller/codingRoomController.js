import CodingRoom from '../models/CodingRoom.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new coding room
export const createRoom = async (req, res) => {
  try {
    const { roomName, admin, language, accessType } = req.body;
    const roomId = uuidv4();
    const accessLink = roomId; 

    const newRoom = new CodingRoom({
      roomId,
      roomName,
      admin,
      participants: [{ userId: admin, role: 'edit', addedBy: admin }],
      language,
      accessType,
      accessLink
    });

    await newRoom.save();
    await User.findOneAndUpdate(
      {"additionalDetails.userId":admin},
      { $addToSet: { "additionalDetails.codingRooms": roomId } }
    );

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all public rooms or rooms by user
export const getRooms = async (req, res) => {
  try {
    const { userId } = req.query;
    const rooms = await CodingRoom.find(
        { 'participants.userId': userId }
    );
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single room by roomId
export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await CodingRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add participant
export const addParticipant = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username, role, addedBy } = req.body;

    const room = await CodingRoom.findOne({ roomId });
    if (!room) return res.status(401).json({ error: "Room not found" });

    const editor = room.participants.find(p => p.userId === addedBy && p.role === 'edit');
    console.log(editor," hvgh" ,"   ",addedBy);
    if (!editor) return res.status(403).json({ error: "Only editors can add participants" });

    const user = await User.findOne({ username: username });
    if (!user) return res.status(402).json({ error: "User not found" });

    const userId = user.additionalDetails.userId;
    const alreadyExists = room.participants.some(p => p.userId === userId);
    if (alreadyExists) return res.status(400).json({ error: "User is already a participant" });

    room.participants.push({ userId, role, addedBy });
    await room.save();

    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { "additionalDetails.codingRooms": roomId } }
    );

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update code content
export const updateCode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { codeContent, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const room = await CodingRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const participant = room.participants.find(p => p.userId === userId);

    if (!participant || participant.role !== 'edit') {
      return res.status(403).json({ message: 'You do not have permission to edit the code.' });
    }

    room.codeContent = codeContent;
    room.lastEdited = new Date();

    await room.save();

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Log code execution result
export const logExecution = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { output, isError, executedBy } = req.body;
    const room = await CodingRoom.findOneAndUpdate(
      { roomId },
      { $push: { executionLogs: { output, isError, executedBy } } },
      { new: true }
    );
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete room (admin only)
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await CodingRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.admin !== userId) return res.status(403).json({ message: 'Only admin can delete the room' });

    await CodingRoom.deleteOne({ roomId });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
