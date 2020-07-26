// socker io have: event.emit('name') to broadcast throughout the room and 
// event.on('name') to run some code after event is emitted
const socket = io('/')
const videoGrid = document.getElementById('video-grid')

// const myPeer = new Peer(undefined, {
//     host: '/',
//     port: '3001'
// })

var myPeer = new Peer({
	host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
})

const peers = {}
const myVideo = document.createElement('video')
myVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video: true, audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream)
    // receive calls
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    socket.on('new-user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnect', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id=>{
    socket.emit('join-room', ROOM_ID, id)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

// make call
function connectToNewUser (userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', ()=>{
        video.remove()
    })
    peers[userId] = call
}