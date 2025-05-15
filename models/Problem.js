import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ProblemSchema = new mongoose.Schema(
  {
    problemId: { type: String, unique: true, required: true },
    createdBy: { type: String, required: true },
    title: { type: String, required: true },
    statement: { type: String, required: true },
    inputFormat: { type: String },
    outputFormat: { type: String },
    constraints: [{ type: String }],
    sampleInput: { type: String },
    sampleOutput: { type: String },
    tags: [{ type: String }],
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    points: { type: Number, default: 100 },
    timeLimit: { type: Number, default: 1 }, // in seconds
    memoryLimit: { type: Number, default: 256 }, // in MB
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        hidden: { type: Boolean, default: true },
      }
    ],
    isPublic: { type: Boolean, default: false }, // new field to control access
  },
  { timestamps: true }
);

const Problem = mongoose.model('Problem', ProblemSchema);
export default Problem;
