const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } }); // Pass the server instance to the socket.io constructor
let connectedUsers = [];
let textChatUsers = [];

const port = process.env.PORT || 5000;

const pair = new Map();
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to connected users set



  const updateTextChatUsers = (userid, updatedAvailable, updatedRoom) => {
    textChatUsers = textChatUsers.map((user) => {
      if (user.userid === userid) {
        return {
          ...user,
          available: updatedAvailable,
          room: updatedRoom,
        };
      }
      return user;
    });
  };

  const updateConnectedUser = (userid, updatedAvailable, updatedRoom) => {
    connectedUsers = connectedUsers.map((user) => {
      if (user.userid === userid) {
        return {
          ...user,
          available: updatedAvailable,
          room: updatedRoom,
        };
      }
      return user;
    });
  };
  
  socket.on("userJoined", ({ userid,type }) => {
    
    console.log("jee", userid);

   if(userid==null){
    return;
   }
console.log(userid,type);
   if(type=="video"){
    connectedUsers.push({
      userid: userid,
      available: true,
      room: null,
    });
    pair.set(userid,"video")
    io.emit("videoChatCount",{length:connectedUsers.length});
    if (connectedUsers.length >= 2) {
      const usersArray = Array.from(connectedUsers);
      const excludeme = usersArray.filter(
        (user) => user.userid !== userid && user.available === true
      );

      if (excludeme.length > 0) {
        const randomIndex1 = Math.floor(Math.random() * excludeme.length);

        const user1 = excludeme[randomIndex1].userid;
        const user2 = userid;
        const room = `room-${user1}-${user2}`;

  
        const updateConnectedUser = (userid, updatedAvailable, updatedRoom) => {
          connectedUsers = connectedUsers.map((user) => {
            if (user.userid === userid) {
              return {
                ...user,
                available: updatedAvailable,
                room: updatedRoom,
              };
            }
            return user;
          });
        };


        updateConnectedUser(user1,false,room);
        updateConnectedUser(user2,false,room);
        
        socket.join(room);
        io.to(user1).emit("roomCreated", {
        roomName: room,
        remoteUser: user2,
      });
      io.to(user2).emit("roomCreated", {
        roomName: room,
        remoteUser: user1,
        createPermission: true,
      });
      }

      
    }
   }else{
    textChatUsers.push({
      userid: userid,
      available: true,
      room: null,
    });
    pair.set(userid,"text");
    io.emit("textChatCount",{length:textChatUsers.length});

    if (textChatUsers.length >= 2) {
      const usersArray = Array.from(textChatUsers);
      const excludeme = usersArray.filter(
        (user) => user.userid !== userid && user.available === true
      );

      if (excludeme.length > 0) {
        const randomIndex1 = Math.floor(Math.random() * excludeme.length);

        const user1 = excludeme[randomIndex1].userid;
        const user2 = userid;
        const room = `room-${user1}-${user2}`;
        updateTextChatUsers(user1,false,room);
        updateTextChatUsers(user2,false,room);
        
        socket.join(room);
        io.to(user1).emit("roomCreated", {
        roomName: room,
        remoteUser: user2,
      });
      io.to(user2).emit("roomCreated", {
        roomName: room,
        remoteUser: user1,
        createPermission: true,
      });
      }

      
    }
   }
    
    // console.log(connectedUsers);
   

    // Check if there are at least two users connected
    
  });
 

  socket.on("newUser",({remoteUserId,currentUserId,type})=>{
console.log("rremoUsre",remoteUserId,"currentUserid",currentUserId);
if(currentUserId==null){
  return;
}
if(type=="video"){
  io.emit("videoChatCount",{length:connectedUsers.length});
  if(remoteUserId==null){
    const newUser = connectedUsers.filter((user)=> user.userid!==currentUserId && user.available===true);
    if(newUser.length>0){
      const randomIndex1 = Math.floor(Math.random() * newUser.length);

        const user1 = newUser[randomIndex1].userid;
        const user2 = currentUserId;
        const room = `room-${user1}-${user2}`;

        updateConnectedUser(user1,false,room);
        updateConnectedUser(user2,false,room);
        
        socket.join(room);
        io.to(user1).emit("roomCreated", {
        roomName: room,
        remoteUser: user2,
      });
      io.to(user2).emit("roomCreated", {
        roomName: room,
        remoteUser: user1,
        createPermission: true,
      });
      

    }

    return;

  }else{
   
    updateConnectedUser(remoteUserId,true,null);
    
    socket.to(remoteUserId).emit("userDisconnected");

    const newUser = connectedUsers.filter((user)=>user.userid!==remoteUserId && user.userid!==currentUserId && user.available===true);

    if(newUser.length>0){
      const randomIndex1 = Math.floor(Math.random() * newUser.length);

        const user1 = newUser[randomIndex1].userid;
        const user2 = currentUserId;
        const room = `room-${user1}-${user2}`;

        updateConnectedUser(user1,false,room);
        updateConnectedUser(user2,false,room);
        
        socket.join(room);
        io.to(user1).emit("roomCreated", {
        roomName: room,
        remoteUser: user2,
      });
      io.to(user2).emit("roomCreated", {
        roomName: room,
        remoteUser: user1,
        createPermission: true,
      });

    }else{
      updateConnectedUser(currentUserId,true,null);

    }

  }
}else{

  io.emit("videoChatCount",{length:textChatUsers.length});
  if(remoteUserId==null){
    const newUser = textChatUsers.filter((user)=> user.userid!==currentUserId && user.userid!==undefined && user.available===true);
    if(newUser.length>0){
      const randomIndex1 = Math.floor(Math.random() * newUser.length);

        const user1 = newUser[randomIndex1].userid;
        const user2 = currentUserId;
        const room = `room-${user1}-${user2}`;

        updateTextChatUsers(user1,false,room);
        updateTextChatUsers(user2,false,room);
        
        socket.join(room);
        io.to(user1).emit("roomCreated", {
        roomName: room,
        remoteUser: user2,
      });
      io.to(user2).emit("roomCreated", {
        roomName: room,
        remoteUser: user1,
        createPermission: true,
      });

    }

    return;

  }else{
    
    
    updateTextChatUsers(remoteUserId,true,null);
    
    socket.to(remoteUserId).emit("userDisconnected");

    const newUser = textChatUsers.filter((user)=>user.userid!==remoteUserId && user.userid!==undefined && user.userid!==currentUserId && user.available===true);

    if(newUser.length>0){
      const randomIndex1 = Math.floor(Math.random() * newUser.length);

        const user1 = newUser[randomIndex1].userid;
        const user2 = currentUserId;
        const room = `room-${user1}-${user2}`;

        updateTextChatUsers(user1,false,room);
        updateTextChatUsers(user2,false,room);
        
        socket.join(room);
        io.to(user1).emit("roomCreated", {
        roomName: room,
        remoteUser: user2,
      });
      io.to(user2).emit("roomCreated", {
        roomName: room,
        remoteUser: user1,
        createPermission: true,
      });

    }else{
      updateTextChatUsers(currentUserId,true,null);

    }

  }
}
    


  })

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
  socket.on("answer", ({ ans, to }) => {
    console.log(ans, "to", to);
    io.to(to).emit("answer", { ans: ans });
  });
  socket.on("offer", ({ offer, to }) => {
    console.log(offer, to);
    io.to(to).emit("offer", { offer: offer, from: socket.id });
  });

  socket.on("iceCandidate", ({ iceCandidate, to }) => {
    console.log(iceCandidate, to);
    io.to(to).emit("iceCandidate", { iceCandidate: iceCandidate });
  });

  socket.on("sendMessage", ({ message, remoteUser }) => {
    console.log("messaged Received", { message, remoteUser });
    io.to(remoteUser).emit("messageReceived", message);
  });
  // Handle user disconnection
  // socket.on("dis", ({ currentUserId, remoteUser }) => {
  //   // console.log("User disconnected:", data);
  //   // Remove user from connected users set
  //   connectedUsers.delete(currentUserId);
  //   // console.log(connectedUsers);
  //   console.log(currentUserId, remoteUser);
  //   io.to(remoteUser).emit("userDisconnected", currentUserId);
  // });

  socket.on("disconnect", () => {
    const roomType = pair.get(socket.id);
    if(roomType==undefined){
      return;
    }

    console.log("Disconnected",socket.id,roomType,connectedUsers);


if(roomType=="video"){
  
  const leavinguser= connectedUsers.find((user)=>user.userid ==socket.id);
  if(!leavinguser){
    return;
  }
  if(!leavinguser.room){
    connectedUsers= connectedUsers.filter((user)=>user.userid!==undefined && user.userid!==leavinguser.userid);
    return;
  }
  connectedUsers= connectedUsers.filter((user)=>user.userid!==socket.id);
  console.log(socket.id, "disconnected",leavinguser);
  
    const findRemoteUser = connectedUsers.find((user)=>user.room==leavinguser.room);

    updateConnectedUser(findRemoteUser.userid,true,null);
    
    socket.to(findRemoteUser.userid).emit("userDisconnected");
    io.emit("videoChatCount",{length:connectedUsers.length});
    socket.disconnect();
  
  // console.log(findUser);
  console.log(leavinguser,connectedUsers,"here");
  // console.log(findUser[0]);
  // delete connectedUsers[findUser[0]];
}else{

  const leavinguser= textChatUsers.find((user)=>user.userid ==socket.id);
  if(!leavinguser){
    return;
  }

  if(!leavinguser.room){
    textChatUsers= textChatUsers.filter((user)=>user.userid!==undefined && user.userid!==leavinguser.userid);
    return;
  }
  textChatUsers= textChatUsers.filter((user)=>user.userid!==socket.id);
  console.log(socket.id, "disconnected",leavinguser);
    const findRemoteUser = textChatUsers.find((user)=>user.room==leavinguser.room);
    updateTextChatUsers(findRemoteUser.userid,true,null);
    console.log(findRemoteUser);
    socket.to(findRemoteUser.userid).emit("userDisconnected");
    io.emit("textChatCount",{length:textChatUsers.length});
    socket.disconnect();
  }
  // console.log(findUser);
  // console.log(leavinguser,connectedUsers,textChatUsers);

});
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(port, () => {
  console.log("listening on *:5000"); // Correct the console log port number to match the actual port
});
