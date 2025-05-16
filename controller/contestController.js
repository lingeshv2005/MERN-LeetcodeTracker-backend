import Contest from '../models/Contest.js';
import Problem from '../models/Problem.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
// import { Newspaper } from 'lucide-react';

// Create a new contest
export const createContest = async (req, res) => {
  try {
    const contestId = uuidv4();
    const {
      title,
      description,
      createdByUserId,
      editors = [],
      backgroundImage,
      startTime,
      endTime,
      durationMinutes,
      isPublic = true,
      allowLateJoin = false,
      showLeaderboardDuringContest = true,
      autoEvaluate = true,
      problems,
    } = req.body;

    const newContest = new Contest({
      contestId,
      title,
      description,
      createdByUserId,
      editors,
      backgroundImage,
      startTime,
      endTime,
      durationMinutes,
      isPublic,
      allowLateJoin,
      showLeaderboardDuringContest,
      autoEvaluate,
      problems,
      participants: [],
    });

    await newContest.save();
    res.status(201).json({ message: "Contest created successfully!!!" });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create contest', error });
  }
};

// Get contest by ID
export const getContestById = async (req, res) => {
  try {
    const { userId } = req.query;
    const contest = await Contest.findOne({ contestId: req.params.contestId });

    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();

    if (now > new Date(contest.endTime)) {
      return res.status(403).json({ message: 'The contest has ended. Details are no longer accessible.' });
    }

    const isParticipant = contest.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this contest' });
    }

    const contestObj = contest.toObject();

    if (now < new Date(contest.startTime)) {
      contestObj.problems = undefined;
    }

    res.json(contestObj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contest', error });
  }
};

// Add participant to a non-public contest
export const addParticipantToContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { userId, editorUserId } = req.body;

    const contest = await Contest.findOne({ contestId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (!contest.editors.includes(editorUserId)) {
      return res.status(403).json({ message: 'Only editors can add participants to this contest.' });
    }

    if (contest.isPublic) {
      return res.status(400).json({ message: 'Participants can join public contests automatically.' });
    }

    const alreadyJoined = contest.participants.some(p => p.userId === userId);
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Participant already added.' });
    }

    contest.participants.push({ userId, submissions: [], score: 0 });
    await contest.save();

    res.status(200).json({ message: 'Participant added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add participant', error });
  }
};

// Join a public contest
export const joinPublicContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { userId } = req.body;

    const contest = await Contest.findOne({ contestId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (!contest.isPublic) {
      return res.status(403).json({ message: 'This contest is not public. Joining is restricted.' });
    }

    const alreadyJoined = contest.participants.some(p => p.userId === userId);
    if (alreadyJoined) {
      return res.status(200).json({ message: 'Already joined' });
    }

    contest.participants.push({ userId, submissions: [], score: 0 });
    await contest.save();

    res.status(200).json({ message: 'Successfully joined the contest' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining contest', error });
  }
};

// Update contest
export const updateContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { userId } = req.body;

    const contest = await Contest.findOne({ contestId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.createdByUserId !== userId && !contest.editors.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to update this contest' });
    }

    const updatedContestData = req.body;

    const updatedContest = await Contest.findOneAndUpdate(
      { contestId },
      { $set: updatedContestData },
      { new: true }
    );

    res.status(200).json(updatedContest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update contest', error });
  }
};

const getExtension = (language) => {
  const map = {
    python: 'py',
    javascript: 'js',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'cs',
    ruby: 'rb',
    go: 'go',
    rust: 'rs',
    php: 'php',
    swift: 'swift',
    typescript: 'ts',
    kotlin: 'kt',
  };
  return map[language.toLowerCase()] || 'txt';
};


// Get all contests created by a specific user
export const getContestsCreatedByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const contests = await Contest.find({ createdByUserId: userId });

    if (!contests.length) {
      return res.status(404).json({ message: 'No contests found for this user' });
    }

    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contests', error });
  }
};


export const addSubmissionToContestProblem = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { userId, problemId, code, language, version = '*' } = req.body;

    const contest = await Contest.findOne({ contestId });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();
    if (now > new Date(contest.endTime))
      return res.status(403).json({ message: 'Contest has ended. Submissions are no longer accepted.' });

    if (now < new Date(contest.startTime))
      return res.status(403).json({ message: 'Contest has not started yet' });

    const participant = contest.participants.find(p => p.userId === userId);
    if (!participant)
      return res.status(403).json({ message: 'You are not a participant in this contest' });

    // if (!contest.allowLateJoin && participant.joinedAt > contest.startTime)
    //   return res.status(403).json({ message: 'Late joiners are not allowed to submit.' });

    const problemExists = contest.problems.includes(problemId);
    if (!problemExists)
      return res.status(400).json({ message: 'Problem not part of this contest' });

    const problem = await Problem.findOne({ problemId });
    if (!problem)
      return res.status(404).json({ message: 'Problem not found' });

    const { testCases, timeLimit = 1, memoryLimit = 256 } = problem;
    const totalTestCases = testCases.length;
    let passedTestCases = 0;
    let status = 'Accepted';
    let errorOutput = '';
    
    const testCaseResults = []; // Store the results of each test case

    for (const testCase of testCases) {
      try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
          language,
          version,
          files: [{ name: `main.${getExtension(language)}`, content: code }],
          stdin: testCase.input,
        });

        const actualOutput = (response.data.run.stdout || '').trim();
        const expectedOutput = (testCase.output + '\n' || '').trim();
        const execTime = (response.data.run.time || 0) * 1000; // in ms
        const memoryUsedKb = (response.data.run.memory || 0) / 1024; // in MB

        if (execTime > timeLimit * 1000) {
          status = 'TLE';
          break;
        }

        if (memoryUsedKb > memoryLimit) {
          status = 'RE';
          break;
        }

        if (actualOutput === expectedOutput) {
          passedTestCases++;
        } else {
          status = 'Wrong Answer';
        }

        // Collect the details for the current test case
        testCaseResults.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput,
          execTime,
          memoryUsedKb,
          status: actualOutput === expectedOutput ? 'Passed' : 'Failed',
        });

      } catch (err) {
        status = 'RE';
        errorOutput = err?.response?.data?.message || err.message || 'Unknown error';
        break;
      }
    }

    if (passedTestCases === 0 && status === 'Accepted') {
      status = 'Wrong Answer';
    }

    const scoreAwarded = totalTestCases > 0
      ? passedTestCases * (problem.points / totalTestCases)
      : 0;

    const newSubmission = {
      problemId,
      code,
      language,
      submittedAt: new Date(),
      result: {
        status,
        passedTestCases,
        totalTestCases,
      },
      scoreAwarded,
    };

    participant.submissions.push(newSubmission);

    const previousBest = participant.submissions
      .filter(sub => sub.problemId === problemId)
      .reduce((max, sub) => Math.max(max, sub.scoreAwarded || 0), 0);

    if (scoreAwarded > previousBest) {
      participant.score += (scoreAwarded - previousBest);
    }

    await contest.save();

    res.status(200).json({
      message: 'Submission evaluated',
      submission: newSubmission,
      testCaseResults, // Include the results of each test case in the response
      stderr: errorOutput || null,
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Submission failed', error: error.message });
  }
};


export const logCheatingAttempt = async (req, res) => {
  const { contestId, userId, cheating } = req.body;

  if (!contestId || !userId || !cheating?.reason || !cheating?.timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await Contest.updateOne(
      { contestId, 'participants.userId': userId },
      {
        $push: {
          'participants.$.cheatingAttempts': {
            detectedAt: new Date(cheating.timestamp),
            type: cheating.reason,
            details: cheating.details || '',
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Contest or participant not found' });
    }

    res.status(200).json({ message: 'Cheating attempt logged successfully' });
  } catch (err) {
    console.error('Error logging cheating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContestByUserParticipant = async (req, res) => {
  const { userId } = req.params;

  try {
    const contests = await Contest.find({
      'participants.userId': userId
    });

    res.status(200).json(contests);
  } catch (error) {
    console.error('Error fetching contests for participant:', error);
    res.status(500).json({ message: 'Server error while fetching contests.' });
  }
};
