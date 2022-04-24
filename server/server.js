const express = require("express");
const socket = require('socket.io');
const app = express();
const short = require('short-uuid');

const Player = require("./Player");
const Door = require("./Door");
const Bullet = require("./Bullet");


const ROOM_MAX_CAPACITY = 4;

const server = app.listen(3000);
console.log('The server is now running at http://localhost:3000');
app.use(express.static("public"));
const io = socket(server);

const rooms = [short.generate()];
let players = [];
let doors = [];
let userCounter = 0;
let bullets = [];
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
var mapData;
var roundEnemyAmount;
var round = 1;
var enemiesRemaining = enemies.length;
var playerKills = [];
var spawnsActive = [0, 2];
var timeBetweenEnemies = 1000; 
var lastEnemySpawn = Date.now();
var enemyCounter;
setInterval(updateGame, 5); //default 16 

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

    socket.on('bulletFired', 

    function(bulletData){
        if(bulletData.startX != null){
          bullets.push(new Bullet(bulletData.startX, bulletData.startY, bulletData.angle, bulletData.damage, bulletData.velocity, bulletData.sprayDeviation, bulletData.playerFired, bulletData.roomId));
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
      doors.forEach(door => {
        if(door.roomId == doorData.roomId && door.doorNum == doorData.doorNum){
          door.open = true;
        }
      })
    })
    socket.once('mapData', 

    function(mapCoords){
        mapData = mapCoords;
        currentDoorCoords = mapCoords.doorCoords;
    });
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
    const bulletsInRoom = bullets.filter(b => b.roomId === room)
    io.to(room).emit("heartbeat", playersInRoom);
    io.to(room).emit("doorData", doorsInRoom);
    io.to(room).emit('bulletData', bulletsInRoom);


    roundInfo = {
      roundNum: round,
      enemiesNum: enemiesRemaining
    }
  
    players.forEach(element =>{
      playerKills.push(element.kills);
    });

    //io.sockets.emit('enemyData', enemies);

    //io.sockets.emit('roundData', roundInfo);

    io.sockets.emit('killData', playerKills);

    //updateBullets();
    //spawnEnemies();
    //if(enemiesRemaining <= 0 && enemies.length == 0 && enemyCounter == roundEnemyAmount){
      //newRound();
    //}

    playerKills = [];
    updateBullets();
  
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

function rectangleContains(x, y, rectX, rectY, rectL, rectW){
  if((x > rectX) && (x < rectX + rectL) && (y > rectY) && (y < rectY + rectW)){
      return true;
  }
  return false
}

function enemyContainsBullet(enemyX, enemyY, bulletX, bulletY){
  if(bulletX == null || enemyX == null){
      return false;
  }
  var distance = Math.sqrt(Math.pow(enemyX - bulletX, 2) + Math.pow(enemyY - bulletY, 2));
  if(distance <=30){
      return true;
  }
  return false;
}

function updateBullets(){

  if(bullets.length != 0){
      for(var i = 0; i < bullets.length; i++){
          mapData.rectCoords.forEach(element => {
              if(bullets[i] != null){
                  if(rectangleContains(bullets[i].x, bullets[i].y, element[0], element[1], element[2], element[3])){
                      bullets.splice(i, 1);
                  }
              }
          });
          doors.forEach(door => {
              if(bullets[i] != null && !door.open && door.roomId == bullets[i].roomId){
                  if(rectangleContains(bullets[i].x, bullets[i].y, door.x, door.y, door.l, door.w)){
                      bullets.splice(i, 1);
                  }
              }
          });
          
          /*
          enemies.forEach(enemy => {
              if(bullets[i] != null && enemy != null){
                  if(enemyContainsBullet(enemy.x, enemy.y, bullets[i].x, bullets[i].y)){
                      if(enemy.bulletInEnemy != i && bullets[i].bulletInEnemy != enemy.index){
                          enemy.health -= bullets[i].damage;
                          enemy.healthPercent = enemy.health/enemy.initialHealth;
                      }
                      enemy.bulletInEnemy = i;
                      bullets[i].bulletInEnemy = enemy.index;
                  }else if(enemy.bulletInEnemy == i){
                      enemy.bulletInEnemy = -1;
                  }

                  if(enemy.health <= 0){
                      connectedUsers[bullets[i].playerFired].kills++;
                      removeEnemy(enemy.index);
                      console.log("removed Enemy: " + enemy.index);
                  }
                  }



                  
          });
          */
          if(bullets[i] != null){
              bullets[i].x += bullets[i].velocity * Math.cos(bullets[i].angle) + (bullets[i].sprayDeviation * Math.sin(bullets[i].angle));
              bullets[i].y += bullets[i].velocity * Math.sin(bullets[i].angle) - (bullets[i].sprayDeviation * Math.cos(bullets[i].angle));
          }
      }
  }
      
  
}



