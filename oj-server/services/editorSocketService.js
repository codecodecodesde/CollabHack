module.exports = function(io){
  //record all the participants in each session
  //the server can send changes to all of them
  var collaborations = {};

  //map from socketId to sessionId
  var socketIdtoSessionId = {};

  io.on('connection', (socket) => {
    //console.log(socket);
    // var message = socket.handshake.query['message'];
    // console.log(message);
    // io.to(socket.id).emit('message', 'hehe from server');

    let sessionId = socket.handshake.query['sessionId'];
    socketIdtoSessionId[socket.id] = sessionId;

    if(!(sessionId in collaborations)) {
      collaborations[sessionId] = {
        'participants': []
      };
    }

  collaborations[sessionId]['participants'].push(socket.id);

  socket.on('change', delta => {
           console.log("change " + socketIdtoSessionId[socket.id] + " " + delta);
           let sessionId = socketIdtoSessionId[socket.id];
           if (sessionId in collaborations) {
               let participants = collaborations[sessionId]['participants'];
               for (let i = 0; i < participants.length; i++) {
                   if (socket.id != participants[i]) {
                       io.to(participants[i]).emit("change", delta);
                   }
               }
           } else {
               console.log("could not tie socket id to any collaboration");
           }
       });
    });
}
