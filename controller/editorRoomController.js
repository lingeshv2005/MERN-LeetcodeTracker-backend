import { getRoomCode, setRoomCode } from '../models/editorRoom.js';

const joinEditorRoom = (socket, roomId) => {
  socket.join(roomId);
  const existingCode = getRoomCode(roomId);
  socket.emit('codeUpdate', existingCode); // Send current code to new user

  socket.on('codeUpdate', ({ roomId, code }) => {
    setRoomCode(roomId, code); // Save code state
    socket.to(roomId).emit('codeUpdate', code); // Broadcast to others
  });
};

export { joinEditorRoom };
