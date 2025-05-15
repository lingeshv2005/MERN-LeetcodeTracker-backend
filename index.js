import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { getAllUsers, getByUsername, getUsernameByUserId, getUserSearch } from './controller/UserController.js';
import editorRoutes from './routes/editorRoomRoutes.js';
import { joinEditorRoom } from './controller/editorRoomController.js';
import codingRoomRouter from './routes/codingRoomRoutes.js';
import channelRouter from './routes/channelRoutes.js';
import contestRouter from './routes/contestRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import userDataRoutes from './routes/userDataRoutes.js';
import dailyProblemRouter from './routes/dailyProblemRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

// Initialize Socket.IO with CORS and transports configuration
const io = new Server(server, {
  cors: {},
  transports: ['websocket', 'polling'], // Allow WebSocket and polling as fallback
});

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: 'https://leetcode-tracker-tau.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('✅ Connected to MongoDB using Mongoose'))
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });

// Routes setup
app.get('/users', getAllUsers);
app.get('/users/:username', getByUsername);
app.get('/user/:userId', getUsernameByUserId);
app.get('/users/search/:q', getUserSearch);
app.use('/', dailyProblemRouter);
app.use('/coding-room', codingRoomRouter);
app.use('/editor', editorRoutes);
app.use('/channel', channelRouter);
app.use('/contest', contestRouter);
app.use('/problems', problemRoutes);
app.use('/userdata', userDataRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joined room: ${roomId}`);
    joinEditorRoom(socket, roomId);
  });

  socket.on('codeUpdate', ({ roomId, code }) => {
    console.log(`Code updated in room ${roomId} by ${socket.id}`);
    socket.to(roomId).emit('codeUpdate', code); 
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on('connect_error', (err) => {
    console.error('WebSocket connection failed:', err.message);
  });

  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`User joined channel ${channelId}`);
  });

  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId);
    console.log(`User left channel ${channelId}`);
  });

  socket.on("sendMessage", ({ channelId, message }) => {
    socket.to(channelId).emit("newMessage", message); 
  });

});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
