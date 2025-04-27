// socket.js
import { Server as SocketIOServer } from 'socket.io';
import { getCurrentUser } from './user.route.js';
import { parseCookies } from './parseCookies.js';

let io; // shared reference

const onlineUsers = new Set();

export const initSocketIO = (httpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie || '';
      const fakeReq = { cookies: parseCookies(cookies) };
      const user = await getCurrentUser(fakeReq);
      if (user) {
        socket.user = user;
        return next();
      }
      return next(new Error('Authentication error'));
    } catch (err) {
      console.error('Socket auth error:', err);
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    if (!user) return;

    const userId = user.id;
    socket.join(`user:${userId}`);
    onlineUsers.add(user);
    io.emit('user:online', Array.from(onlineUsers));

    socket.on('user:online', () => {
      if (!onlineUsers.has(user)) {
        onlineUsers.add(user);
        io.emit('user:online', Array.from(onlineUsers));
      }
    });

    socket.on('disconnect', () => {
      socket.leave(`user:${userId}`);
      onlineUsers.delete(user);
      io.emit('user:online', Array.from(onlineUsers));
    });

    socket.on('ping-check', (callback) => {
      if (callback) callback();
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
