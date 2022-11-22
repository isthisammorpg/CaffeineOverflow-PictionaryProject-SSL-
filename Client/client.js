var websocketGame = {
  userName: "",
  score: 0,
  currTime: -1,
  isDrawing : false,
  isTurnToDraw : false,
  erase_bool:false,
  chat_allowed:true,
  LINE_SEGMENT : 0,
  CHAT_MESSAGE : 1,
  GAME_LOGIC : 2,
  ROUND_TIME :6,
  USER_ANS_RIGHT : 7,
  SIGN_IN : 50,
  CREATE : 30,
  JOIN : 21,
  CODE : 911,
// Constant for game logic state
WAITING_TO_START : 0,
GAME_START : 1,
GAME_OVER : 2,
GAME_RESTART : 3,
GUESSED_RIGHT : 4,
ROUND_OVER : 5,
INIT: 412,
   // the starting point of next line drawing.
   startX : 0,
   startY : 0,
}
is_touch_device=false
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
// init script when the DOM is ready.
function $(x) {return document.getElementById(x);}
  // check if existence of WebSockets in browser
  if (window["WebSocket"]) {
    
    console.log('entered');
    // create connection
    websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");
    
    // on open event
    websocketGame.socket.onopen = function(e) {
      console.log('WebSocket connection established.');
    };
    var message = $("code-input").value;
      
      // pack the message into an object.
     
    
    // on close event
    websocketGame.socket.onclose = function(e) {
      console.log('WebSocket connection closed.');
    };      
    websocketGame.socket.onmessage = function(e) {
      // check if the received data is chat or line segment
   console.log("onmessage event:",e.data);
   var data = JSON.parse(e.data);
   if (data.dataType === websocketGame.CHAT_MESSAGE) {
      let li = document.createElement("li");
      li.innerText = data.sender + " : " +data.message;
      $("chat-history").appendChild(li);
   }
   if (data.dataType === websocketGame.CODE) { //Displaying the Code
    $("code").innerHTML=data.message;
 }
   else if (data.dataType === websocketGame.ROUND_TIME) {//Updating the timer
    websocketGame.currTime=data.timer;
    $("timer").innerHTML=data.timer;
 }
   else if (data.dataType === websocketGame.LINE_SEGMENT) {
    context.beginPath();
    context.moveTo(data.startX, data.startY,);
    context.lineTo(data.endX, data.endY);
    context.stroke();
 }
 else if (data.dataType === websocketGame.GAME_LOGIC) {
  if (data.gameState === websocketGame.GUESSED_RIGHT) {
    let li = document.createElement("li");
    li.innerText =data.winner +" Guessed it right!!! ";
    $("chat-history").appendChild(li);
  }
  if (data.gameState === websocketGame.ROUND_OVER) {
    websocketGame.isTurnToDraw = false;
    let li = document.createElement("li");
    li.innerText ="ROUND OVER!! The answer is "+data.answer;
    $("chat-history").appendChild(li);
  }
  if (data.gameState === websocketGame.GAME_OVER) { //Sending scores to server once the game is over
    websocketGame.isTurnToDraw = false;
    let li = document.createElement("li");
    li.innerText ="GAME OVER!!";
    $("chat-history").appendChild(li);
    var data = {};
    data.gameState = websocketGame.GAME_OVER
    data.score = websocketGame.score;
    websocketGame.socket.send(JSON.stringify(data));
  }
  if (data.gameState === websocketGame.USER_ANS_RIGHT) {
    websocketGame.chat_allowed=false;
    console.log(parseInt(data.score_update));
    websocketGame.score=websocketGame.score+parseInt(data.score_update);
    $("score").innerHTML="SCORE: "+websocketGame.score;
  }
  if (data.gameState === websocketGame.GAME_START) {
    // clear the Canvas.
    canvas.width = canvas.width;
    $("code").innerHTML="";

    websocketGame.chat_allowed = true;
    
    if (data.isPlayerTurn) {
      websocketGame.isTurnToDraw = true;
      let li = document.createElement("li");
      li.innerText = "Your turn to draw. Please draw " + data.answer;
      $("chat-history").appendChild(li);
    }
    else {
      let li = document.createElement("li");
      li.innerText = "Game Started. Get Ready. You have one minute to guess.";
      $("chat-history").appendChild(li);
    }
  }
}
 
    };

function sendMessage() {
  if(websocketGame.chat_allowed){
  var message = $("chat-input").value;
  
  // pack the message into an object.
  var data = {};
  data.dataType = websocketGame.CHAT_MESSAGE;
  data.message = message;
  
  websocketGame.socket.send(JSON.stringify(data));
  }
  $("chat-input").value="";
}
function SignIn(){
  console.log($("user-input").value);
  websocketGame.userName = $("user-input").value;
  $("user-input").value="";
}
function JoinRoom(){
    var code = $("code-input").value;
    var data = {};
    data.dataType = websocketGame.INIT;
    data.action = websocketGame.JOIN;
    data.username = websocketGame.userName ;
    data.code = code;
    websocketGame.socket.send(JSON.stringify(data));
    $("code-input").value="";
}
function CreateRoom(){
  var numplayers = $("num-players").value;
  var data = {};
  data.dataType = websocketGame.INIT;
  data.action=websocketGame.CREATE;
  data.username = websocketGame.userName ;

  console.log(data.username);
  data.numplayers = numplayers;
  websocketGame.socket.send(JSON.stringify(data));
  $("num-players").value="";
}
let rectLeft = canvas.getBoundingClientRect().left;
let rectTop = canvas.getBoundingClientRect().top;

const getXY = (e) => {
  mouseX = (!is_touch_device ? e.pageX : e.touches?.[0].pageX) - rectLeft;
  mouseY = (!is_touch_device ? e.pageY : e.touches?.[0].pageY) - rectTop;
};

function drawLine(ctx, x1, y1, x2, y2, thickness) {
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineWidth = thickness;
  ctx.strokeStyle = "#444";
  ctx.stroke();
}
const startDrawing = (e) => {
  //drawing = true
  if (websocketGame.isTurnToDraw){
  getXY(e);
  //Start Drawing
  websocketGame.startX = mouseX;
  websocketGame.startY = mouseY;
  context.beginPath();
  context.moveTo(mouseX, mouseY);
  websocketGame.isDrawing = true;
  }
};


const drawOnCanvas = (e) => {
  if (!is_touch_device) {
    e.preventDefault();
  }
  if (websocketGame.isTurnToDraw){
  //if user is drawing
  if (websocketGame.isDrawing ) {
    //create a line to x and y position of cursor
    getXY(e);
    context.lineTo(mouseX, mouseY);
    context.stroke();
    var data = {};
         data.dataType = websocketGame.LINE_SEGMENT;
         data.startX = websocketGame.startX;
         data.startY = websocketGame.startY;
         data.endX = mouseX;
         data.endY = mouseY;
         websocketGame.socket.send(JSON.stringify(data));
    websocketGame.startX = mouseX;
    websocketGame.startY = mouseY;
    if (websocketGame.erase_bool) {
      //destination-out draws new shapes behind the existing canvas content
      context.globalCompositeOperation = "destination-out";
    } else {
      context.globalCompositeOperation = "source-over";
    }
  }
}
};

const stopDrawing = () => { // When user stops drawing
  if (websocketGame.isTurnToDraw){
  context.beginPath();
  websocketGame.isDrawing  = false;
  }
};

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", drawOnCanvas);
canvas.addEventListener("mouseup", stopDrawing);
}


