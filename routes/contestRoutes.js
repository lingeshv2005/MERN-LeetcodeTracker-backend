// routes/contestRoutes.js

import express from 'express';
import {
  createContest,
  getContestById,
  addParticipantToContest,
  joinPublicContest,
  updateContest,
  addSubmissionToContestProblem,
  getContestsCreatedByUser,
  logCheatingAttempt,
  getContestByUserParticipant,
} from '../controller/contestController.js';

const router = express.Router();

router.post('/', createContest);
router.get('/created-by', getContestsCreatedByUser);
router.get('/:contestId', getContestById);
router.post('/:contestId/participants', addParticipantToContest);
router.post('/:contestId/join', joinPublicContest);
router.put('/:contestId', updateContest);
router.post('/:contestId/submit', addSubmissionToContestProblem);
router.post('/cheat', logCheatingAttempt);
router.get('/participant/:userId', getContestByUserParticipant);

export default router;
