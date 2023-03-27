const http = require("../index");
const io = require("socket.io")(http);

const createRoom = async (roomName, roomId) => {
  io.of("/").adapter.rooms.set(roomId, new Set());
  return `Room ${roomName} created  with Id ${roomId}`;
};

module.exports = {
  createRoom,
};
