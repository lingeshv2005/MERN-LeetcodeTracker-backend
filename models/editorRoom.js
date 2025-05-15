const activeRooms = {};

const getRoomCode = (roomId) => {
  return activeRooms[roomId] || '// New collaborative session';
};

const setRoomCode = (roomId, code) => {
  activeRooms[roomId] = code;
};

export { getRoomCode, setRoomCode };
