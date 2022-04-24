const express = require("express");
const socket = require('socket.io');
const app = express();
const short = require('short-uuid');

const Player = require("./Player");
const Door = require("./Door");
const Bullet = require("./Bullet");
const Enemy = require("./Enemy");
const RoundInfo = require("./RoundInfo");




const ROOM_MAX_CAPACITY = 4;

const server = app.listen(3000);
console.log('The server is now running at http://localhost:3000');
app.use(express.static("public"));
const io = socket(server);

const rooms = [short.generate()];
let players = [];
let doors = [];
let roundInfos = [];
let userCounter = 0;
let bullets = [];
var enemies = []
var mapData;
var playerKills = [];
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

    var playersInRoom = players.filter(p => p.roomId == roomId);

    let playerInfo = {
      playerNum: userCounter,
      roomId: roomId,
      index: players.length,
      roomIndex: playersInRoom.length,
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
          let roundInfo = roundInfos.filter(r => r.roomId == doorData.roomId);
          doorData.spawnsActivate.forEach(spawn => {
            roundInfos[roundInfo[0].index].spawnsActive.push(spawn);
          });
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
      enemies.push(new Enemy(0, enemies.length, 10, 25, .5, room, 0));
      enemies.push(new Enemy(2, enemies.length, 10, 25, .5, room, 0));
      roundInfos.push(new RoundInfo(room, roundInfos.length));
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
    const bulletsInRoom = bullets.filter(b => b.roomId === room);
    const enemiesInRoom = enemies.filter(e => e.roomId === room);
    const roundInfo = roundInfos.filter(r => r.roomId === room);
    io.to(room).emit("heartbeat", playersInRoom);
    io.to(room).emit("doorData", doorsInRoom);
    io.to(room).emit('bulletData', bulletsInRoom);
    io.to(room).emit('enemyData', enemiesInRoom);
    io.to(room).emit('roundData', roundInfo);
  
    players.forEach(element =>{
      playerKills.push(element.kills);
    });

    io.sockets.emit('killData', playerKills);

    if(roundInfo[0] != null){
      if(roundInfo[0].enemiesRemaining <= 0 && enemiesInRoom.length == 0 && roundInfo[0].enemyCounter == roundInfo[0].roundEnemyAmount){
        roundInfos[roundInfo[0].index].round++;
        roundInfos[roundInfo[0].index].enemyCounter = 0;
        roundInfos[roundInfo[0].index].roundEnemyAmount = 2 * roundInfos[roundInfo[0].index].round + 4;
        roundInfos[roundInfo[0].index].enemiesRemaining = roundInfos[roundInfo[0].index].roundEnemyAmount;
      }
      spawnEnemies(roundInfos[roundInfo[0].index]);
    }


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

function removeEnemy(index, roomId){
  var enemiesTemp = [];
  enemies.splice(index, 1);
  if(enemies.length > 0){
      for(var i = 0; i < index; i++){
          enemiesTemp.push(enemies[i]);
      }
      for(var i = index; i < enemies.length; i++){
          if(enemies[i] != null){   
              enemies[i].index--;
              enemiesTemp.push(enemies[i]);
          }
      }
  }
  enemies = enemiesTemp;
  let roundInfo = roundInfos.filter(r => r.roomId == roomId);
  roundInfos[roundInfo[0].index].enemiesRemaining--;
}

function spawnEnemies(roundInfo){
  if(((roundInfo.lastEnemySpawn + roundInfo.timeBetweenEnemies) < Date.now()) && (roundInfo.enemyCounter < roundInfo.roundEnemyAmount)){
      roundInfo.enemyRandomSpawnVariable = Math.random();
      enemies.push(new Enemy(roundInfo.spawnsActive[Math.trunc((roundInfo.spawnsActive.length) * Math.random())], enemies.length, 10, 25, .5, roundInfo.roomId, roundInfo.enemyRandomSpawnVariable));
      roundInfo.lastEnemySpawn = Date.now();
      roundInfo.enemyCounter++;
  }
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
          
          enemies.forEach(enemy => {
            if(bullets[i] != null && enemy != null && enemy.roomId == bullets[i].roomId){
              if(enemyContainsBullet(enemy.x, enemy.y, bullets[i].x, bullets[i].y)){
                  if(enemy.bulletInEnemy != i && bullets[i].bulletInEnemy != enemy.index && enemy.roomId == bullets[i].roomId){
                      enemy.health -= bullets[i].damage;
                      enemy.healthPercent = enemy.health/enemy.initialHealth;
                  }
                  enemy.bulletInEnemy = i;
                  bullets[i].bulletInEnemy = enemy.index;
              }else if(enemy.bulletInEnemy == i){
                  enemy.bulletInEnemy = -1;
              }

              if(enemy.health <= 0){
                  players[bullets[i].playerFired].kills++;
                  removeEnemy(enemy.index, enemy.roomId);
              }
          }

          });
          if(bullets[i] != null){
              bullets[i].x += bullets[i].velocity * Math.cos(bullets[i].angle) + (bullets[i].sprayDeviation * Math.sin(bullets[i].angle));
              bullets[i].y += bullets[i].velocity * Math.sin(bullets[i].angle) - (bullets[i].sprayDeviation * Math.cos(bullets[i].angle));
          }
      }
  }
      
  
}



