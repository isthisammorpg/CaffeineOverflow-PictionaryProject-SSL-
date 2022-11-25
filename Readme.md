##  Structure

------
    |
    |
    ------Server
    |    |
    |    ---server.js
    |    |
    |    ---game.js
    |
    |
    ------Client
         |
         ---client.js
         |
         ---index.html
         |
         ---indexJS.js
         |
         ---login.html
         |
         ---loginstyle.css
         |
         ---gamewallpaper0.jpg
         |
         ---gamewallpaper1.jpg
         |
         ---profilePic.jpg
         
##  Packages

#### - Node.js

#### - WebSockets

## Files

- server.js

This javascript file implements the server for our game. It stores all the rooms that are active at any given point of time. When it receives a
request to create a room, it creates one and adds it to the dictionary of rooms. When it recieves the request to join an already existing room
it simply adds the user to that room.

- game.js

It is in this file that the entire logic for a game room is implemented. It comprises of 2 classes-User and Room.
The User class contains all the information about a user i.e. username, userID, socket and score.
The Room class represents a room. It contains all the information about a room i.e. No. of players in the room, an array of users in that room etc. It also contains all the functions required to communicate with client which is elaborated in "Working".

- client.js

This file is responsible for communicating with the server and also for retrieving data from
the webpage. It implements the canvas required for drawing the image as well as the chat feature.

- index.html

This is the webpage for any client that joins the game. Contains the canvas and the chat box  and options to sign-in/login and Join/Create room.

-indexJS.js

This file contains the code which handles the basic interactions taking place in index.html such as clicking of various buttons etc.

## Working

1. To run the game simply open the terminal in Server folder and execute "node server.js". This would start the server at port 8000. To join the game simply open index.html.

2. All the communications between the client and the server take place using WebSockets wherein we transmit data using JSON string and then parsing through them in the receiving end. Each transmitted
message has a particular type associated with it which allows the receiver to know the purpose for which the message is intended. For eg While the drawer draws the figure, the coordinates of
his movements are sent to the server, which recognizes it to be for drawing purpose and sends it to all the clients which also recognize this data type and replicate the drawing in their respective 
windows.

3. Any player who opens up our webpage would be first asked to sign-in/login. After that the player has 2 options-either to create a new room or join an existing one. The user credentials are also displayed on the screen when the sign-in is successful.To join an existing room 
the player should enter the code for that room. Or if he wishes to create a new room, then he needs to specify the number of players for that room. After this a room code would be displayed
which the player may share with his/her friends who want join the same room.
Once the game begins the room decides which player is supposede to draw. This is done by iterating through the users array sequentially and then sending a message to the drawer telling him 
that he is the drawer and what he needs to draw.

4. Once the drawer starts drawing the figure is replicated in real time in all the webpages associated with that particular room and 1 minute timer starts.

5. After this the users can start putting in their guesses in the chat. The client sends these chats to the server where the server checks if the client has guessed it correctly. The server transmits
this guess to all the clients irrespective of whether it is right or wrong. If it is right then the server sends a message to all the clients saying that a certain has guessed it right. When
this happens the server sends a special message to the user who guessed it right. This message disables the chat for that particular user and adds the current time to his/her total score. Therefore, the faster the one answers, more points does he get.

6. After the timer is over, the server sends a message to all the clients in that room telling the what the current answer was.

7. Now, the server picks the next user in the array and the enitre process is repeated until every player has been the drawer. The final scores after the game are then updated in the users array.

8. These scores are then sent each client so that all of them can display a Leaderboard. Althought the problem statement asked us to implement a global Leaderboard, we instead chose to make a leaderboard for the current game only.  
