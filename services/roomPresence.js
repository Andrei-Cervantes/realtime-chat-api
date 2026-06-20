const roomUsers = new Map();

export function addUserToRoom(roomId, username) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  roomUsers.get(roomId).add(username);
}

export function removeUserFromRoom(roomId, username) {
  if (roomUsers.has(roomId)) {
    roomUsers.get(roomId).delete(username);
    if (roomUsers.get(roomId).size === 0) {
      roomUsers.delete(roomId);
    }
  }
}

export function getRoomUsers(roomId) {
  return roomUsers.has(roomId) ? Array.from(roomUsers.get(roomId)) : [];
}
