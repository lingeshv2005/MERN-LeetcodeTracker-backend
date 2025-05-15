import express from 'express';
import { getActiveDailyCodingChallenge } from '../controller/dailyProblemController.js';

const router = express.Router();

// Route to get the active daily coding challenge question
router.get('/daily-problem', getActiveDailyCodingChallenge);

export default router;
