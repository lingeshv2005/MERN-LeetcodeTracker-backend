import express from 'express';
import {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from '../controller/problemController.js';

const router = express.Router();

router.post('/', createProblem);
router.get('/', getAllProblems);
router.get('/:problemId', getProblemById);
router.put('/:problemId', updateProblem);
router.delete('/:problemId', deleteProblem);

export default router;
