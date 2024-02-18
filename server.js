const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!!✌️'))
  .catch((err) => console.error('DB connection error:', err));

const port = process.env.PORT || 8000;
app.set('port', port);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://chatapp-akshayb99.netlify.app/',
    methods: ['GET', 'POST'],
  },
});

let activeUsers = [];

io.on('connection', (socket) => {
  // add new User
  socket.on('new-user-add', (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    // send all active users to new user
    io.emit('get-users', activeUsers);
  });

  // send message to a specific user
  socket.on('send-message', (data) => {
    const { receiveId } = data;
    const user = activeUsers.find((user) => user.userId === receiveId);
    console.log("active Users:", activeUsers);
    console.log('Data: ', data);
    console.log("user to send :",user);
    if (user) {
      io.to(user.socketId).emit('recieve-message', data);
    }
  });

  socket.on('disconnect', () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log('User Disconnected', activeUsers);
    // send all active users to all users
    io.emit('get-users', activeUsers);
  });
});

server.listen(port, () => {
  console.log(`App running on the port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
