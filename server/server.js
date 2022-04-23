const express = require("express");
const socket = require('socket.io');
const app = express();
const short = require('short-uuid');

const Player = require("./Player");
const Door = require("./Door");

const ROOM_MAX_CAPACITY = 4;

const server = app.listen(3000);
console.log('The server is now running at http://localhost:3000');
app.use(express.static("public"));
const io = socket(server);

const rooms = [short.generate()];
let players = [];
let doors = [];
let userCounter = 0;
var doorsActive;
var currentDoorCoords;
var enemyRandomSpawnVariable = Math.random();
var enemySpawns = [
    //x   y   l    w   xdev            ydev
    [300, -5, 100, 10, 100, 0], //spawn 0 (top left)
    [1100, -5, 100, 10, 100, 0], //spawn 1 (top right)
    [-5, 300, 10, 100, 0, 100], //spawn 2 (left top)
    [-5, 800, 10, 100, 0, 100], //spawn 3 (left bottom)
    [500, 995, 100, 10, 100, 0], //spawn 4 (bottom left)
    [1300, 995, 100, 10, 100, 0], //spawn 5 (bottom right)
]
var enemies = [
    //new Enemy(0, 0, 10, 25, .5),
    //new Enemy(2, 1, 10, 25, .5),
]
var roundEnemyAmount;
var round = 1;
var enemiesRemaining = enemies.length;
var playerKills = [];
var spawnsActive = [0, 2];
var timeBetweenEnemies = 1000; 
var lastEnemySpawn = Date.now();
var enemyCounter;
setInterval(updateGame, 10); //default 16 

io.sockets.on('connection', 
  function(socket) {

    console.log("New connection " + socket.id);
    userCounter++;

    socket.on('start', 
    function(data){
      players.push(new Player(socket.id, roomId, userCounter, data.winL, data.winW, data.decX, data.decY, 0, players.length, 0));
    });

    socket.on('drawData', 

        function(data){
            if(players[data.index] != null){
                players[data.index].decY = data.decY;
                players[data.index].decX = data.decX;
                players[data.index].angle = data.angle;
                players[data.index].gun = data.gunIndex;
            }
        });

    var roomId = getRoom();
    socket.join(roomId);

    let playerInfo = {
      playerNum: userCounter,
      roomId: roomId,
      index: players.length,
    }
    socket.emit('setPlayerNum', playerInfo);

    socket.on('nameChange', 
    function(nameData){
      players.forEach(player => {
        if(player.number == nameData.number){
          player.name = nameData.name;
        }
      })
    });

    socket.on('openDoor', function(doorData){
      console.log(doorData.doorNum + " " + doorData.roomId)
      doors.forEach(door => {
        if(door.roomId == doorData.roomId && door.doorNum == doorData.doorNum){
          door.open = true;
        }
      })
    })

    socket.once('startRoom', 
    function(room){
      doors.push(new Door(1, room, 1000, 600, 200, 30, 200, 50, 25, [1, 5]))
      doors.push(new Door(2, room, 1000, 700, 700, 30, 200, 50, 25, [3, 4]))
      let doorsInRoomStart = doors.filter(d => d.roomId == room);
      io.to(room).emit("startGame", doorsInRoomStart);
    });

   

    socket.on("disconnect", () => {
      //io.sockets.emit("disconnect", socket.id);
      tempPlayer = players.filter(player => player.id == socket.id);
      players = players.filter(player => player.id !== socket.id);
      if(tempPlayer != null){
        updateIndexes(tempPlayer[0].index);
      }
    });
    
  
  });





function updateGame() {
  for (const room of rooms) {
    const playersInRoom = players.filter(p => p.roomId === room);
    const doorsInRoom = doors.filter(d => d.roomId === room);
    io.to(room).emit("heartbeat", playersInRoom);
    io.to(room).emit("doorData", doorsInRoom);

    roundInfo = {
      roundNum: round,
      enemiesNum: enemiesRemaining
    }
  
    //players.forEach(element =>{
    //  playerKills.push(element.kills);
    //});


    //io.sockets.emit('bulletsData', bullets);

    //io.sockets.emit('enemyData', enemies);

    //io.sockets.emit('roundData', roundInfo);

    //io.sockets.emit('killData', playerKills);

    //updateBullets();
    //spawnEnemies();
    //if(enemiesRemaining <= 0 && enemies.length == 0 && enemyCounter == roundEnemyAmount){
      //newRound();
    //}

    //playerKills = [];
  
  }
}

function updateIndexes(removedIndex){
  for(var i = removedIndex; i < players.length; i++){
    players[i].index--;
  }
  for (const room of rooms) {
    io.to(room).emit("updateIndex", removedIndex);
  }
}

function getRoom() {
  let leastPopulatedCount = Infinity;
  let leastPopulatedRoom = rooms[0];
  for (const room of rooms) {
    const count = players.filter(p => p.roomId == room).length;
    if (count < leastPopulatedCount) {
      leastPopulatedCount = count;
      leastPopulatedRoom = room;
    }
  }

  if (leastPopulatedCount >= ROOM_MAX_CAPACITY) {
    
    const newRoom = short.generate()
    console.log('Creating new room', newRoom);
    rooms.push(newRoom);
    leastPopulatedRoom = newRoom; 
  }
  return leastPopulatedRoom;
}



