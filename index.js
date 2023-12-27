const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const cors = require('cors');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
    socket.on('join', (options, callback) => {
        console.log('dsad');
        const {error, user} = addUser({
            id: socket.id,
            ...options
        });

        console.log(user);
        console.log(error);

        if (!user) {
            return;
        }

        if (error) {
            return callback(error);
        }

        socket.join(user.roomName);

        socket.emit('message', generateMessage('Admin', 'Welcome'));
        socket.broadcast.to(user.roomName).emit('message', generateMessage('Admin', `${user.userName} has joined!`));
    
        io.to(user.roomName).emit('roomData', {
            users: getUsersInRoom(user.roomName)
        });

        callback();
    });

    socket.on("sendMessage", (msg, callback) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed');
        }

        const user = getUser(socket.id);

        if (!user) return;

        io.to(user.roomName).emit('message', generateMessage(user.userName, msg));
        callback();
    });

    socket.on('shareGeolocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.roomName).emit('message', generateLocationMessage(user.userName, `https://google.com/maps/?q=${location.latitude},${location.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        console.log(user);

        if (user) {
            io.to(user.roomName).emit('message', generateMessage('Admin', `${user.userName} has left!`));
            io.to(user.roomName).emit('roomData', {
                room: user.roomName,
                users: getUsersInRoom(user.roomName)
            });
        }
    });
});

server.listen(port, () => {
    console.log("Server is listening on port ", port);
});