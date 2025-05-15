import express from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  addParticipant,
  updateCode,
  logExecution,
  deleteRoom
} from '../controller/codingRoomController.js';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:roomId', getRoomById);
router.post('/:roomId/participant', addParticipant);
router.put('/:roomId/code', updateCode);
router.post('/:roomId/execute', logExecution);
router.delete('/:roomId', deleteRoom);

export default router;
