import express from "express";
import {
  createChannel,
  getChannelByCommunicationId,
  addParticipantToChannel,
  addMessageToChannel,
  getChannelsByUserId,
  updateChannelDetails
} from "../controller/channelController.js";

const router = express.Router();

router.post("/", createChannel);
router.get("/:userId/getChannelsByUser", getChannelsByUserId);
router.get("/:communicationId/:userId", getChannelByCommunicationId);
router.post("/participant/:communicationId", addParticipantToChannel);
router.put("/addmessage/:communicationId", addMessageToChannel);
router.put("/update/:communicationId", updateChannelDetails);

export default router;
