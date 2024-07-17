const express = require('express');
const connectToMongo = require('./db');
const driverRouters = require('./routers/driversRoutes');
const cors = require('cors');
const app = express();

const http = require('http');
const socketIo = require('socket.io');
const driver = require('./modules/driver');
const axios = require('axios');

const server = http.createServer(app);

const { v4: uuidv4 } = require('uuid');

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store locations keyed by roomId
let locations = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  
  socket.on('createroom', () => {
    const randomString = uuidv4(); // Generates a unique random string
    const baseName = 'room';
    const uniqueRoomName = `${baseName}-${randomString}`;

    socket.join(uniqueRoomName); // Join the specified room
    console.log(`Room Created with name ${uniqueRoomName}`);

    // Emit storeRoomId event when createroom is called
    socket.emit('storeRoomId', { roomId: uniqueRoomName });
  });

  socket.on('driverConnected', () => {
    socket.to(uniqueRoomName).emit('joinedRoom');
  });

  // Store the room ID for the driver
  socket.on('storeRoomId', async (data) => {
    const { id, roomId } = data;
    console.log('storeRoomId event received with data:', data);
    try {
      if (id) {
        // Store the driver ID in the socket object
        socket.driverId = id;

        let d = await driver.findOneAndUpdate(
          { _id: id },
          { roomId: roomId },
          { new: true } 
        );

        if (d) {
          console.log(`Room ID ${roomId} updated for driver: ${d._id}`);
        } else {
          console.log(`Driver not found with id: ${id}`);
        }
      } else {
        console.log(`No valid id provided for updating roomId. ${id}`);
      }
    } catch (err) {
      console.error('Error storing roomId:', err);
    }
  });

  // Driver joins a room and updates location
  socket.on('updateLocation', (data) => {
    const { roomId, location } = data;
    locations[roomId] = location;
    io.to(roomId).emit('locationUpdate', { roomId, location });
    console.log(location);
  });

  //store new updated waypoints
  


  // Update waypoints
  socket.on('updateWaypoints', async (data) => {
    const { roomId, waypoints } = data;
    try {
      // Find the driver by roomId and update waypoints
      let d = await driver.findOneAndUpdate(
        { roomId: roomId },
        { waypoints: waypoints },
        { new: true }
      );

      if (d) {
        console.log(`Waypoints updated for driver: ${d._id}`);
        // Broadcast the new waypoints to other users in the room
        io.to(roomId).emit('waypointsUpdate', { roomId, waypoints });
      } else {
        console.log(`Driver not found with roomId: ${roomId}`);
      }
    } catch (err) {
      console.error('Error updating waypoints:', err);
    }
  });

  // Passenger joins a room to track location
  socket.on('trackLocation', async ({ driverId }) => {
    try {
      let d = await driver.findOne({ _id: driverId });
      if (d) {
        const roomId = d.roomId;
        socket.join(roomId);
        if (locations[roomId]) {
          socket.emit('locationUpdate', { roomId, location: locations[roomId] });
        }
        if (d.waypoints && Array.isArray(d.waypoints)) {
          socket.emit('waypointsUpdate', { waypoints: d.waypoints });
        } else {
          console.log(`No waypoints found for driver: ${driverId}`);
        }
      } else {
        console.log(`Driver not found with id: ${driverId}`);
      }
    } catch (err) {
      console.error('Error tracking location:', err);
    }
  });
  

  socket.on('disconnect', async () => {
    console.log('user disconnected', socket.id);

    // Access the stored driver ID
    const driverId = socket.driverId;
    console.log(driverId)
    if (driverId) {
      try {
        const response = await axios.delete(`http://192.168.0.105:5000/driver/${driverId}`);
        console.log('Delete request sent:', response.data);
      } catch (error) {
        console.error('Error sending delete request:', error);
      }
    }
  });
});

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).send("WELCOME To TravelTrack APP");
});

app.use('/driver', driverRouters);

connectToMongo();

server.listen(PORT, () => {
  console.log(`TravelTrack backend is listening at http://localhost:${PORT}`);
});
