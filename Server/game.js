// Constants
var LINE_SEGMENT = 0;
var CHAT_MESSAGE = 1;
var GAME_LOGIC = 2;
var ROUND_TIME=6;
// Constant for game logic state
var WAITING_TO_START = 0;
var GAME_START = 1;
var GAME_OVER = 2;
var GAME_RESTART = 3; 
var GUESSED_RIGHT=4;
var ROUND_OVER = 5;
var USER_ANS_RIGHT = 7;


function User(socket,name) {
    this.socket = socket; 
    this.score = 0;
    this.name = name;
    this.id = "1" + Math.floor( Math.random() * 1000000000);
  }
function Room(num_players) {
    this.num_players=num_players;
    this.users = []; 
    this.playerTurn = -1;
    this.timeSecond = 60;

  this.wordsList = ['apple','football','sun','ice-cream','leaf'];
  this.currentAnswer = undefined;

  this.currentGameState = WAITING_TO_START;
  
  // send the game state to all players.
  var gameLogicData = {
    dataType: GAME_LOGIC,
    gameState: WAITING_TO_START
  };

  this.sendAll(JSON.stringify(gameLogicData));
  }  
  Room.prototype.addUser = function(user){
    this.users.push(user); 
    var room = this; 
    var data = {
      dataType: CHAT_MESSAGE,
      sender: "Server",
      message: "Welcome " + user.id 
         + " joining the party. Total connection: " + this.users.length
    };  
    room.sendAll(JSON.stringify(data));
    this.handleOnUserMessage(user);
    // handle user closing
    user.socket.onclose = function(){
      console.log('A connection left.');
      room.removeUser(user);
    }
    if (this.currentGameState === WAITING_TO_START && this.users.length == this.num_players) {
      this.startGame();
    }
  };
  Room.prototype.removeUser = function(user) {
    // loop to find the user
    for (var i=this.users.length; i >= 0; i--) {
      if (this.users[i] === user) {
        this.users.splice(i, 1);
      }
    }
  };
  Room.prototype.sendAll = function(message) {
    for (var i=0, len=this.users.length; i<len; i++) {
      this.users[i].socket.send(message);
    }
  };
  Room.prototype.handleOnUserMessage = function(user) {
    var room = this;
  // handle on message
  user.socket.on('message', function(message){
    console.log("[GameRoom] Receive message from " 
          + user.id + ": " + message); 
    
    var data = JSON.parse(message);
    if (data.dataType === CHAT_MESSAGE) {
      // add the sender information into the message data object.
      data.sender = user.name;
    }
    room.sendAll(JSON.stringify(data));
    
    // check if the message is guessing right or wrong
    if (data.dataType === CHAT_MESSAGE) {
      console.log("Current state: " + room.currentGameState);
      
      if (room.currentGameState === GAME_START) {
        console.log("Got message: " + data.message 
            + " (Answer: " + room.currentAnswer + ")");
      }
      
      if (room.currentGameState === GAME_START && data.message === room.currentAnswer) {
        var gameLogicData = {
          dataType: GAME_LOGIC,
          gameState: GUESSED_RIGHT,
          winner: user.name,
          answer: room.currentAnswer
        };
        var gameLogicWinner = {
          dataType: GAME_LOGIC,
          gameState: USER_ANS_RIGHT,
          score_update: room.timeSecond
        };
        room.sendAll(JSON.stringify(gameLogicData));
        user.socket.send(JSON.stringify(gameLogicWinner));
      }
    }
    
    if (data.gameState === GAME_OVER) {
      user.score=parseInt(data.score);
      console.log(user.name+" : "+user.score);
    }
  });
  };
  Room.prototype.startGame = function() {
    var room = this;
    
    // pick a player to draw
    this.playerTurn = (this.playerTurn+1);
    
    console.log("Start game with player " + this.playerTurn 
        + "'s turn.");
    
    // pick an answer
    var answerIndex = Math.floor(Math.random() * this.wordsList.length);
    this.currentAnswer = this.wordsList[answerIndex];
    
    // game start for all players
    var gameLogicDataForAllPlayers = {
      dataType: GAME_LOGIC,
      gameState: GAME_START,
      isPlayerTurn: false
    };
    
    this.sendAll(JSON.stringify(gameLogicDataForAllPlayers));
    
    // game start with answer to the player in turn.
    var gameLogicDataForDrawer = {
      dataType: GAME_LOGIC,
      gameState: GAME_START,
      answer: this.currentAnswer,
      isPlayerTurn: true
    };
  
    // the user who draws in this turn.
    var user = this.users[this.playerTurn];
    user.socket.send(JSON.stringify(gameLogicDataForDrawer));
    
    
    // game over the game after 1 minute.
    this.timeSecond = 60;
    const countDown = setInterval(() => {
    this.timeSecond--;
    var timeforplayers = {
      dataType: ROUND_TIME,
      timer: this.timeSecond,
    };
    if (this.timeSecond == 0 || this.timeSecond < 1) {
      clearInterval(countDown);
      room.currentGameState = GAME_RESTART;
      var gameLogicData = {
            dataType: GAME_LOGIC,
            gameState: ROUND_OVER,
            answer: room.currentAnswer
          };
    }
    room.sendAll(JSON.stringify(timeforplayers));
    if (this.timeSecond == 0 || this.timeSecond < 1) {

      var gameLogicData = {
            dataType: GAME_LOGIC,
            gameState: ROUND_OVER,
            answer: room.currentAnswer
          };
          room.sendAll(JSON.stringify(gameLogicData));
          if (this.playerTurn<this.users.length-1) {
            room.startGame();
          }
          else{
            var gameoverData = {
              dataType: GAME_LOGIC,
              gameState: GAME_OVER,
            };
            room.sendAll(JSON.stringify(gameoverData));
            room.currentGameState = GAME_OVER;
          }
    }
    room.currentGameState = GAME_START;
    
    }, 1000);
    ;

    room.currentGameState = GAME_START;
  };
  module.exports.User = User;
  module.exports.Room = Room;