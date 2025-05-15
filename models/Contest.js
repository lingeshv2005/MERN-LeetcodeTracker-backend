import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ContestSchema = new mongoose.Schema(
  {
    contestId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    description: { type: String },
    createdByUserId: { type: String, required: true },
    editors: [{ type: String }],
    backgroundImage: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    isPublic: { type: Boolean, default: true },
    allowLateJoin: { type: Boolean, default: false },
    showLeaderboardDuringContest: { type: Boolean, default: true },
    autoEvaluate: { type: Boolean, default: true },
    problems: [{ type: String }],
    participants: [
      {
        userId: { type: String },
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        cheatingAttempts: [
          {
            detectedAt: { type: Date, default: Date.now },
            type: { type: String, required: true },
            details: { type: String },
          }
        ],
        submissions: [
          {
            problemId: { type: String },
            code: { type: String },
            language: { 
              type: String, 
              enum: ['cpp', 'java', 'python', 'javascript'], 
              required: true 
            },
            submittedAt: { type: Date, default: Date.now },
            result: {
              status: { 
                type: String, 
                enum: ['Accepted', 'Wrong Answer', 'TLE', 'RE', 'CE'], 
                default: 'Wrong Answer' 
              },
              passedTestCases: { type: Number },
              totalTestCases: { type: Number },
            },
            scoreAwarded: { type: Number },
          }
        ],
      }
    ],
  },
  { timestamps: true }
);

const Contest = mongoose.model('Contest', ContestSchema);
export default Contest;
