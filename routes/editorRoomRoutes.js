import express from 'express'
const router = express.Router();
import { compileCode } from '../controller/compilerController.js';

// Sample GET route for testing
router.get('/status', (req, res) => {
  res.json({ status: 'Editor backend is running' });
});
router.post('/compile', compileCode);

export default router;