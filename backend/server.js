import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  }
});

// Make Socket.IO accessible to controllers
app.locals.io = io;

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('subscribe_ride', (data) => {
    if (data && data.rideId) {
      const room = `ride_${data.rideId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    }
  });

  socket.on('unsubscribe_ride', (data) => {
    if (data && data.rideId) {
      const room = `ride_${data.rideId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    }
  });

  // Driver client can emit location updates; server will forward to subscribers
  socket.on('driver:updateLocation', (data) => {
    try {
      const { rideId, lng, lat } = data || {};
      if (rideId) {
        const room = `ride_${rideId}`;
        io.to(room).emit('driver_location_update', { lng, lat });
        console.log(`Emitted driver_location_update to ${room}`, { lng, lat });
      } else {
        // broadcast as fallback
        io.emit('driver_location_update', { lng: data.lng, lat: data.lat });
        console.log('Broadcasted driver_location_update', data);
      }
    } catch (err) {
      console.error('Error handling driver:updateLocation', err);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on http://localhost:' + PORT);
});
