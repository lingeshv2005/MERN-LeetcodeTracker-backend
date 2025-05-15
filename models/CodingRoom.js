import mongoose from 'mongoose';

const codingRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    admin: { type: String, required: true }, // custom userId as string
  
    participants: [{
      userId: { type: String, required: true }, // custom userId
      role: { type: String, enum: ['view', 'edit'], default: 'view' },
      addedBy: { type: String, default: "link" },
    }],
  
    language: { type: String, default: 'javascript' },
    codeContent: { type: String, default: '' },
  
    executionLogs: [{
      output: { type: String },
      isError: { type: Boolean, default: false },
      executedBy: { type: String, required: true }, // custom userId
      timestamp: { type: Date, default: Date.now }
    }],
  
    accessType: { type: String, enum: ['private', 'public'], default: 'private' },
    accessLink: { type: String },
  
    lastEdited: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  });
  
export default mongoose.model('CodingRoom', codingRoomSchema);
