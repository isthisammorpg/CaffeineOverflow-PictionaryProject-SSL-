var port = 8000;
var INIT=412;
var CREATE=30;
var JOIN=21;
var CODE=911;
// Server code
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({ port: port });

var User = require('./game').User;
var Room = require('./game').Room;
var rooms={} //stores all the rooms

  //console.log(game.gameID);
  rooms["123"]=new Room(3);

server.on('connection', function(socket) {
  socket.on('message', function(message){
    console.log("received");
    var data = JSON.parse(message);
    if (data.dataType === INIT) {
      if(data.action === JOIN){ // When user requests to join in
        user = new User(socket,data.username);
        rooms[data.code].addUser(user);
        console.log("Welcome "+data.username);
      }
      if(data.action === CREATE){ //when a user creates a new Room
        console.log("Welcome "+data.username);
        user = new User(socket,data.username);
        new_code = "1" + Math.floor( Math.random() * 1000);
        rooms[new_code]=new Room(parseInt(data.numplayers));
        rooms[new_code].addUser(user);
        var data = {};
        data.dataType = CODE;
        data.message = new_code;
        socket.send(JSON.stringify(data));
        console.log("New code: " + new_code);
        
      }
    }
  }
  )
 
});

console.log("WebSocket server is running.");
console.log("Listening to port " + port + ".");
