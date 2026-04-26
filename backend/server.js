import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import directMessageRoutes from './routes/directMessageRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Startup safety checks
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key') {
    console.warn('⚠️  WARNING: JWT_SECRET is not set or is using the default placeholder. Set a strong secret before deploying to production.');
}

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Middleware
app.use(express.json());
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Make Socket.IO instance available to all routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups/:groupId/tasks', taskRoutes);
app.use('/api/groups/:groupId/calendar', calendarRoutes);
app.use("/api/groups/:groupId/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups/:groupId/files", fileRoutes);
app.use("/api/messages/direct", directMessageRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Socket.IO connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    socket.join(userId);
  }

  socket.on('joinGroup', (groupId) => {
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      socket.join(groupId);
    }
  });

  socket.on('leaveGroup', (groupId) => {
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      socket.leave(groupId);
    }
  });

  socket.on('joinNotification', (uid) => {
    if (mongoose.Types.ObjectId.isValid(uid)) {
      socket.join(uid);
    }
  });

  socket.on('leaveNotification', (uid) => {
    if (mongoose.Types.ObjectId.isValid(uid)) {
      socket.leave(uid);
    }
  });

  socket.on('disconnect', () => {});

  socket.on("drawing", (data) => {
    if (data.groupId) {
      socket.to(data.groupId).emit("drawing", data);
    }
  });

  socket.on("drawing_active", (data) => {
    if (data.groupId) {
      socket.to(data.groupId).emit("drawing_active", { ...data, socketId: socket.id });
    }
  });
  socket.on("drawing_inactive", (data) => {
    if (data.groupId) {
      socket.to(data.groupId).emit("drawing_inactive", { ...data, socketId: socket.id });
    }
  });
});



const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    // Server started
});