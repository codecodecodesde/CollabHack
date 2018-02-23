var redisClient = require('../module/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io){
  var sessionPath = '/temp_sessions';

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

    // if(!(sessionId in collaborations)) {
    //   collaborations[sessionId] = {
    //     'participants': []
    //   };
    // }

    //first check in memory
    if(sessionId in collaborations){
      collaborations[sessionId]['participants'].push(socket.id);
    }
    else{//check in redis
      redisClient.get(sessionPath + '/' + sessionId, function(data) {
        //exist in redis, restore the changes from redis
        if(data){
          console.log("session terminated previously, get back from redis");
          collaborations[sessionId] = {
            'cachedInstructions': JSON.parse(data),
            'participants':[]
          }
        }//first time created or expired
        else{
            console.log('creating new session');
            collaborations[sessionId] = {
              'cachedInstructions': [],
              'participants': []
            }
          }
          //1: 123, 222
          collaborations[sessionId]['participants'].push(socket.id);
          //io.to(socket.id).emit("userchange", socket.id);
      })
    }

    //socket event listeners
    socket.on('change', delta => {
             console.log("change " + socketIdtoSessionId[socket.id] + " " + delta);
             let sessionId = socketIdtoSessionId[socket.id];
             if(sessionId in collaborations){
               collaborations[sessionId]['cachedInstructions'].push(['change', delta, Date.now()]);
             }

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
         })

      socket.on('restoreBuffer', () => {
        //get sessionId
        let sessionId = socketIdtoSessionId[socket.id];
        console.log('restore buffer for session ' + sessionId, 'socketId: ' + socket.id);

        if(sessionId in collaborations){
          let instructions = collaborations[sessionId]['cachedInstructions'];
          for(let i = 0; i < instructions.length; i++){
            socket.emit(instructions[i][0], instructions[i][1]);
          }
        }else{
          console.log('cannot find any collaboration for the session');
        }
      });

      socket.on('disconnect', function(){
        let sessionId = socketIdtoSessionId[socket.id];
        console.log('disconnect session' + sessionId, 'socketId: ' + socket.id);

        let foundAndRemove = false;
        if(sessionId in collaborations){
          let participants = collaborations[sessionId]['participants'];
          let index = participants.indexOf(socket.id);

          if(index >= 0){
            //remove this participants
            participants.splice(index, 1);
            foundAndRemove = true;

            if(participants.length == 0){
              console.log('this is the last participant');
              //remove from memory and redis

              let key = sessionPath + '/' + sessionId;
              let value = JSON.stringify(collaborations[sessionId]['cachedInstructions']);

              redisClient.set(key, value, redisClient.redisPrint);
              redisClient.expire(key, TIMEOUT_IN_SECONDS);

              delete collaborations[sessionId];
            }
          }
        }

        if(!foundAndRemove){
          console.log('warning: cannot find the socketId in collaborations');
        }

      })

    })
}
