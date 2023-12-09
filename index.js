const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const cors = require('cors')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  })

const port = process.env.PORT || 3000

io.on("connection", (socket) => {
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({
            id: socket.id,
            ...options
        })

        if (!user) {
            return;
        }

        if (error) {
            return callback(error)
        }

        socket.join(user.roomName)

        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.roomName).emit('message', generateMessage('Admin', `${user.userName} has joined!`))
    
        io.to(user.roomName).emit('roomData', {
            room: user.roomName,
            users: getUsersInRoom(user.roomName)
        })

        callback()
    })

    socket.on("sendMessage", (msg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('shareGeolocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps/?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server is listening on port ", port)
})