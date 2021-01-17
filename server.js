const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
require('dotenv').config()

const { v4: uuid } = require('uuid')

// set our viewing engine to use EJS template
app.set('view engine', 'ejs')
// where our static files will reside
app.use(express.static('public'))

app.get('/', (req, res)=>{
    res.redirect(`/room/${uuid()}`)
})

app.get('/room/:room', (req, res)=>{
    res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
    // join-room event will be called from client to server letting server know that it have joined
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        // will broadcast new-user-connected event so that other client's frontend can consume it 
        socket.to(roomId).broadcast.emit('new-user-connected', userId )
        socket.on('disconnect', ()=>{
            socket.to(roomId).broadcast.emit('user-disconnect', userId)
        })

    })
})

srv = server.listen(process.env.PORT || 3000)




var ExpressPeerServer = require('peer').ExpressPeerServer;
var peerExpress = require('express');
var peerApp = peerExpress();
var peerServer = require('http').createServer(peerApp);
var options = { debug: true }
var peerPort = 9000;


peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));

peerServer.listen(peerPort)