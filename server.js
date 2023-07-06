const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin:  '*' } }); // Pass the server instance to the socket.io constructor
const connectedUsers = new Set();

const port = process.env.PORT || 5000;

const pair = new Map();
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  // Add user to connected users set


 
  socket.on("userJoined",({userid})=>{
    console.log("jee",userid);
    connectedUsers.add(userid);
  
    // Check if there are at least two users connected
    if (connectedUsers.size >= 2) {
      // Select two random users from the connected users set
      const usersArray = Array.from(connectedUsers);
      const randomIndex1 = Math.floor(Math.random() * usersArray.length);
      const randomIndex2 = Math.floor(Math.random() * (usersArray.length - 1));
      const user1 = usersArray[randomIndex1];
      const user2 = usersArray[randomIndex2 === randomIndex1 ? usersArray.length - 1 : randomIndex2];
  
      // Create a room for the two random users
      const roomName = `room-${user1}-${user2}`;
      socket.join(roomName);
      io.to(user1).emit("roomCreated", {roomName:roomName,remoteUser:user2});
      io.to(user2).emit("roomCreated", {roomName:roomName,remoteUser:user1,createPermission:true});
      pair.set(roomName,user2);
      connectedUsers.delete(user1);
      connectedUsers.delete(user2);
      console.log(connectedUsers);
  }  })
;


// socket.on("peer:nego:needed",(data)=>{
//   console.log("negoneeded",data);
// })


socket.on("peer:nego:needed", ({ to, offer }) => {
  console.log("peer:nego:needed", offer);
  io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
});

socket.on("peer:nego:done", ({ to, ans }) => {
  console.log("peer:nego:done", ans);
  io.to(to).emit("peer:nego:final", { from: socket.id, ans });
});
socket.on("answer",({ans,to})=>{
  console.log(ans,"to",to);
  io.to(to).emit("answer",{ans:ans});
})
socket.on("offer",({offer,to})=>{
  console.log(offer,to);
  io.to(to).emit("offer",{offer:offer,from:socket.id});
})
socket.on("iceCandidate",({candiate,remoteUser})=>{
  io.to(remoteUser).emit("iceCandidate",candiate);
})


socket.on("sendMessage",({message,remoteUser})=>{
console.log("messaged Received",{message,remoteUser});
  io.to(remoteUser).emit("messageReceived",message);
})
  // Handle user disconnection
  socket.on("dis", ({currentUserId,remoteUser}) => {
    // console.log("User disconnected:", data);
    // Remove user from connected users set
    connectedUsers.delete(currentUserId);
    // console.log(connectedUsers);
    console.log(currentUserId,remoteUser);
    io.to(remoteUser).emit("userDisconnected",currentUserId);

  });

  

});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(port, () => {
  console.log('listening on *:5000'); // Correct the console log port number to match the actual port
});
