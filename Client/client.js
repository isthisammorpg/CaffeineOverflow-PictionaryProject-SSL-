

var websocketGame = {
  userName: "",
  score: 0,
  users : [],
  scores :[] ,
  currTime: -1,
  numofplayers: 0,
  isDrawing : false,
  isTurnToDraw : false,
  erase_bool:false,
  chat_allowed:true,
  LINE_SEGMENT : 0,
  CHAT_MESSAGE : 1,
  LEADERBOARD : 69,
  GAME_LOGIC : 2,
  ROUND_TIME :6,
  USER_ANS_RIGHT : 7,
  SIGN_IN : 50,
  CREATE : 30,
  JOIN : 21,
  CODE : 911,
  CLEAR: 45,
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

//---------------//
let colorsRef = document.getElementsByClassName("colors");

let backgroundButton = document.getElementById("color-background");
let colorButton = document.getElementById("color-input");
let clearButton = document.getElementById("button-clear");
let eraseButton = document.getElementById("button-erase");
let penButton = document.getElementById("button-pen");
let penSize = document.getElementById("pen-slider");
let toolType = document.getElementById("tool-type");

//Inital Features

const init = () => {
  context.strokeStyle = "black";
  context.lineWidth = 1;
  //Set canvas height to parent div height
  // canvas.style.width = "100%";
  // canvas.style.height = "100%";
  // canvas.width = canvas.offsetWidth;
  // canvas.height = canvas.offsetHeight;
  //Set range title to pen size
  toolType.innerHTML = "Pen";
  //Set background and color inputs initially
  canvas.style.backgroundColor = "#ffffff";
  backgroundButton.value = "#ffffff";
  penButton.value = context.strokeStyle;
};
//---------------//

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
 if (data.dataType === websocketGame.LEADERBOARD) { //
    websocketGame.users.push(data.player);
    websocketGame.scores.push(data.scores)
    if (websocketGame.users.length == websocketGame.numofplayers){

    var list = [];
    for (var j = 0; j < websocketGame.users.length; j++) 
      list.push({'name': websocketGame.users[j], 'score': websocketGame.scores[j]});
      list.sort(function(a, b) {
      return ((a.score > b.score) ? -1 : ((a.score== b.score) ? 0 : 1));
    });

   for (var k = 0; k < list.length; k++) {
    websocketGame.users[k] = list[k].name;
    websocketGame.scores[k] = list[k].score;
   }
      console.log(websocketGame.users);
      console.log(websocketGame.scores);
      let table = document.getElementById('mytable');
let thead = document.createElement('thead');
let tbody = document.createElement('tbody');

table.appendChild(thead);
table.appendChild(tbody);
// Adding the entire table to the body tag
// Creating and adding data to first row of the table
let row_1 = document.createElement('tr');
let heading_1 = document.createElement('th');
heading_1.innerHTML = "Player Name";
let heading_2 = document.createElement('th');
heading_2.innerHTML = "Score";

row_1.appendChild(heading_1);
row_1.appendChild(heading_2);
thead.appendChild(row_1);


// Creating and adding data to second row of the table
for (var x=0;x<websocketGame.users.length;x++){
let row_2 = document.createElement('tr');
let row_2_data_1 = document.createElement('td');
row_2_data_1.innerHTML = websocketGame.users[x];
let row_2_data_2 = document.createElement('td');
row_2_data_2.innerHTML = websocketGame.scores[x];

row_2.appendChild(row_2_data_1);
row_2.appendChild(row_2_data_2);
tbody.appendChild(row_2);

}
    }
    //console.log(websocketGame.users[0] + "|" + websocketGame.users[1])
    //console.log(websocketGame.scores[0] + "|" + websocketGame.scores[1]);
}
   else if (data.dataType === websocketGame.ROUND_TIME) {//Updating the timer
    websocketGame.currTime=data.timer;
    $("timer").innerHTML=data.timer;
 }
   else if (data.dataType === websocketGame.LINE_SEGMENT) {
    if(data.is_clear == websocketGame.CLEAR){
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.backgroundColor = "#ffffff";
      backgroundButton.value = "#ffffff";
    }
    else{
    context.beginPath();
    // toolType.innerHTML = data.ToolType;
    context.lineWidth = data.StrokeSize;
    context.strokeStyle = data.StrokeStyle;
    websocketGame.erase_bool=data.is_eraser;
    //canvas.style.backgroundColor = data.BackgroundColor;
    if(websocketGame.erase_bool){
      context.strokeStyle = "white";
    }
    context.moveTo(data.startX, data.startY,);
    context.lineTo(data.endX, data.endY);
    context.stroke();
  }
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
    websocketGame.numofplayers = data.numofplayers;
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
  mouseX = (!is_touch_device ? e.pageX : e.touches?.[0].pageX) - rectLeft - 20;
  mouseY = (!is_touch_device ? e.pageY : e.touches?.[0].pageY) - rectTop - 80;
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
         data.is_eraser=websocketGame.erase_bool;
         data.StrokeSize = context.lineWidth;
         data.StrokeStyle = context.strokeStyle;
        // data.BackgroundColor = backgroundButton.value;
        //  data.ToolType = toolType.innerHTML;   
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

//---------------//
//Button for pen mode
penButton.addEventListener("click", () => {
  if (websocketGame.isTurnToDraw){
  //set range title to pen size
  toolType.innerHTML = "Pen";
  websocketGame.erase_bool = false;
  context.strokeStyle=colorButton.value;
}
});

//Button for eraser mode
eraseButton.addEventListener("click", () => {
  if (websocketGame.isTurnToDraw){
  websocketGame.erase_bool = true;
  //set range title to erase size
  toolType.innerHTML = "Eraser";
}
});

//Adjust Pen size
penSize.addEventListener("input", () => {
  //set width to range value
  if (websocketGame.isTurnToDraw){
  context.lineWidth = penSize.value;
}
});

//Change color
colorButton.addEventListener("change", () => {
  if (websocketGame.isTurnToDraw){
  //set stroke color
  context.strokeStyle = colorButton.value;
}
});

//Change Background
backgroundButton.addEventListener("change", () => {
  if (websocketGame.isTurnToDraw){
  //canvas.style.backgroundColor = backgroundButton.value;
}
});

//Clear
clearButton.addEventListener("click", () => {
  if (websocketGame.isTurnToDraw){
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.backgroundColor = "#ffffff";
  backgroundButton.value = "#ffffff";
  var data = {};
  data.dataType = websocketGame.LINE_SEGMENT;
  data.is_clear = websocketGame.CLEAR;
 // data.BackgroundColor = backgroundButton.value;
 //  data.ToolType = toolType.innerHTML;   
  websocketGame.socket.send(JSON.stringify(data));
}
});
//---------------//

}

window.onload = init();