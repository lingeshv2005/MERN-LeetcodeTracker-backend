import Problem from '../models/Problem.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new problem
export const createProblem = async (req, res) => {
  try {
    const {
      title,
      userId, // The user ID should come from the session or authentication middleware
      statement,
      inputFormat,
      outputFormat,
      constraints = [],
      sampleInput,
      sampleOutput,
      tags = [],
      difficulty = 'Medium',
      points = 100,
      timeLimit = 1,
      memoryLimit = 256,
      testCases = [],
      isPublic = false, // Default to private unless specified
    } = req.body;

    const problemData = {
      problemId: uuidv4(), // Generate a new unique problemId
      createdBy: userId, // The user creating the problem
      title,
      statement,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      tags,
      difficulty,
      points,
      timeLimit,
      memoryLimit,
      testCases,
      isPublic, // Whether the problem is public or private
    };

    const newProblem = new Problem(problemData);
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create problem', error: error.message });
  }
};

// Get all public problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ isPublic: true }); // Only get problems that are public
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch problems', error: error.message });
  }
};

// Get a problem by problemId (No check for public/private access)
export const getProblemById = async (req, res) => {
  try {
    const { problemId } = req.params;
    const problem = await Problem.findOne({ problemId });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch problem', error: error.message });
  }
};

// Update a problem - Only the creator can update it
export const updateProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const updateData = req.body;

    // Find the problem first
    const problem = await Problem.findOne({ problemId });

    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Ensure that only the creator can update the problem
    if (problem.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this problem' });
    }

    // Prepare fields to update
    const updatedProblemData = {};

    if (updateData.title) updatedProblemData.title = updateData.title;
    if (updateData.statement) updatedProblemData.statement = updateData.statement;
    if (updateData.inputFormat) updatedProblemData.inputFormat = updateData.inputFormat;
    if (updateData.outputFormat) updatedProblemData.outputFormat = updateData.outputFormat;
    if (updateData.constraints) updatedProblemData.constraints = updateData.constraints;
    if (updateData.sampleInput) updatedProblemData.sampleInput = updateData.sampleInput;
    if (updateData.sampleOutput) updatedProblemData.sampleOutput = updateData.sampleOutput;
    if (updateData.tags) updatedProblemData.tags = updateData.tags;
    if (updateData.difficulty) updatedProblemData.difficulty = updateData.difficulty;
    if (updateData.points) updatedProblemData.points = updateData.points;
    if (updateData.timeLimit) updatedProblemData.timeLimit = updateData.timeLimit;
    if (updateData.memoryLimit) updatedProblemData.memoryLimit = updateData.memoryLimit;
    if (updateData.testCases) updatedProblemData.testCases = updateData.testCases;
    if (updateData.isPublic !== undefined) updatedProblemData.isPublic = updateData.isPublic; // Allow toggling the public status

    // Update the problem with new data
    const updatedProblem = await Problem.findOneAndUpdate(
      { problemId },
      { $set: updatedProblemData },
      { new: true }
    );

    res.status(200).json(updatedProblem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update problem', error: error.message });
  }
};

// Delete a problem - Only the creator can delete it
export const deleteProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const problem = await Problem.findOne({ problemId });

    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Ensure that only the creator can delete the problem
    if (problem.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this problem' });
    }

    await Problem.findOneAndDelete({ problemId });
    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete problem', error: error.message });
  }
};
