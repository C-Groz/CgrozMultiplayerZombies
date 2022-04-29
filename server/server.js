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

const server = app.listen(process.env.PORT || 3000);
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
          bullets.push(new Bullet(bulletData.startX, bulletData.startY, bulletData.angle, bulletData.damage, bulletData.velocity, bulletData.sprayDeviation, bulletData.playerFired, bulletData.roomId, bulletData.decreaseConstant, bulletData.bulletDecay));
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

    socket.on('playerDown', 
    function(downedPlayerData){
      players[downedPlayerData.index].downed = true;
      players[downedPlayerData.index].previousWeapon = downedPlayerData.previousWeapon;
      players[downedPlayerData.index].gun = 9;
      io.to(downedPlayerData.roomId).emit('downedPlayerMessage', downedPlayerData)
    });

    socket.on('playerRevive', function(downedPlayer){
      players[downedPlayer.index].gun = downedPlayer.previousWeapon;
      players[downedPlayer.index].downed = false;
      players[downedPlayer.index].health = 100;
      io.to(downedPlayer.roomId).emit('playerRevived', downedPlayer);
    })



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
      enemies.push(new Enemy(0, enemies.length, .25, 25, .25, room, 0));
      enemies.push(new Enemy(2, enemies.length, .25, 25, .25, room, 0));
      roundInfos.push(new RoundInfo(room, roundInfos.length));
      let doorsInRoomStart = doors.filter(d => d.roomId == room);
      io.to(room).emit("startGame", doorsInRoomStart);
    });

   

    socket.on("disconnect", () => {
      //io.sockets.emit("disconnect", socket.id);
      tempPlayer = players.filter(player => player.id == socket.id);
      players = players.filter(player => player.id !== socket.id);
      if(tempPlayer[0].index != null){
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
    const roundInfoInRoom = roundInfos.filter(r => r.roomId === room);
    io.to(room).emit("heartbeat", playersInRoom);
    io.to(room).emit("doorData", doorsInRoom);
    io.to(room).emit('bulletData', bulletsInRoom);
    io.to(room).emit('enemyData', enemiesInRoom);
    io.to(room).emit('roundData', roundInfoInRoom);
  
    players.forEach(element =>{
      playerKills.push(element.kills);
      element.x = returnPlayerLocationX(element.decX);
      element.y = returnPlayerLocationY(element.decY);
    });

    io.sockets.emit('killData', playerKills);

    if(roundInfoInRoom[0] != null){
      if(roundInfoInRoom[0].enemiesRemaining <= 0 && enemiesInRoom.length == 0 && roundInfoInRoom[0].enemyCounter == roundInfoInRoom[0].roundEnemyAmount){
        roundInfos[roundInfoInRoom[0].index].round++;
        roundInfos[roundInfoInRoom[0].index].enemyCounter = 0;
        roundInfos[roundInfoInRoom[0].index].roundEnemyAmount = 2 * roundInfos[roundInfoInRoom[0].index].round + 4;
        roundInfos[roundInfoInRoom[0].index].enemiesRemaining = roundInfos[roundInfoInRoom[0].index].roundEnemyAmount;
        if(roundInfos[roundInfoInRoom[0].index].enemySpeed <= .75){
          roundInfos[roundInfoInRoom[0].index].enemySpeed+= .05;
        }
        if(roundInfos[roundInfoInRoom[0].index].timeBetweenEnemies >= 200){
          roundInfos[roundInfoInRoom[0].index].timeBetweenEnemies-= 20;
        }
        roundInfos[roundInfoInRoom[0].index].enemyStartingHealth+= 5;

      }
      spawnEnemies(roundInfos[roundInfoInRoom[0].index]);
    }


    playerKills = [];
    updateBullets();
    moveEnemies();
    playerEnemyContact(playersInRoom, enemiesInRoom)
  }
}
function returnPlayerLocationX(decimal){
  return (1000 * decimal);
}
function returnPlayerLocationY(decimal){
  return (1500 * decimal);
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
    let roomRoundInfo = roundInfos.filter(r => r.roomId === room);
    if(roomRoundInfo[0] == null || roomRoundInfo[0].gameActive == false){
      const count = players.filter(p => p.roomId == room).length;
      if (count < leastPopulatedCount) {
        leastPopulatedCount = count;
        leastPopulatedRoom = room;
      }
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
  enemies.splice(index, 1);
  if(enemies.length > 0){
      for(var i = index; i < enemies.length; i++){
          if(enemies[i] != null){   
              enemies[i].index--;
          }
      }
  }
  let roundInfo = roundInfos.filter(r => r.roomId == roomId);
  roundInfos[roundInfo[0].index].enemiesRemaining--;
}

function spawnEnemies(roundInfo){
  if(((roundInfo.lastEnemySpawn + roundInfo.timeBetweenEnemies) < Date.now()) && (roundInfo.enemyCounter < roundInfo.roundEnemyAmount)){
      roundInfo.enemyRandomSpawnVariable = Math.random();
      enemies.push(new Enemy(roundInfo.spawnsActive[Math.trunc((roundInfo.spawnsActive.length) * Math.random())], enemies.length, roundInfo.enemySpeed, roundInfo.enemyStartingHealth, .5, roundInfo.roomId, roundInfo.enemyRandomSpawnVariable));
      roundInfo.lastEnemySpawn = Date.now();
      roundInfo.enemyCounter++;
  }
}

function moveEnemies(){
  enemies.forEach(enemy => {
    var closestPlayer = determineClosestPlayer(enemy.x, enemy.y, enemy.roomId);
    if(closestPlayer != null){
      determineEnemyTraj(enemy, closestPlayer);
      if(enemy.x < closestPlayer.x && enemy.xClearPos){
          enemy.x+=enemy.Xspeed;  
      }
      if(enemy.x > closestPlayer.x && enemy.xClearNeg){
        enemy.x+=enemy.Xspeed;  
      }
      if(enemy.y < closestPlayer.y && enemy.yClearPos){
        enemy.y+=enemy.Yspeed;  
      }
      if(enemy.y > closestPlayer.y && enemy.yClearNeg){
        enemy.y+=enemy.Yspeed;  
      }
    }
  })
}

function determineEnemyTraj(enemy, player){
  //quad 1
  if(player.x >= enemy.x && player.y < enemy.y){
    enemy.angle = -1 *Math.atan((enemy.y - player.y)/(player.x - enemy.x));
  }

  //quad 2
  if(player.x > enemy.x && player.y >= enemy.y){
    enemy.angle = Math.atan((player.y - enemy.y)/(player.x - enemy.x));
  }

  //quad 3
  if(player.x <= enemy.x && player.y > enemy.y){
    enemy.angle = 3.14159 + Math.atan((enemy.y - player.y)/(Math.abs(enemy.x - player.x )));
  }

  //quad 4
  if(player.x < enemy.x && player.y <= enemy.y){
    enemy.angle = 3.14159 + Math.atan((enemy.y - player.y )/(Math.abs(enemy.x - player.x)));
  }

  if(enemyRectangleContains(enemy.x + 27, enemy.y)){
    enemy.xClearPos = false;
  }else{
    enemy.xClearPos = true;
  }
  if(enemyRectangleContains(enemy.x - 27, enemy.y)){
    enemy.xClearNeg = false;
  }else{
    enemy.xClearNeg = true;
  }
  if(enemyRectangleContains(enemy.x, enemy.y + 27)){
    enemy.yClearPos = false;
  }else{
    enemy.yClearPos = true;
  }
  if(enemyRectangleContains(enemy.x, enemy.y - 27)){
    enemy.yClearNeg = false;
  }else{
    enemy.yClearNeg = true;
  }
  enemy.Xspeed = enemy.speed * Math.cos(enemy.angle);
  enemy.Yspeed = enemy.speed * Math.sin(enemy.angle);

}
function enemyRectangleContains(xPos, yPos){
  for(var i = 4; i < mapData.rectCoords.length; i++){
      if((xPos > (mapData.rectCoords[i][0])) && (xPos < (mapData.rectCoords[i][0]) + mapData.rectCoords[i][2]) && (yPos > (mapData.rectCoords[i][1])) && (yPos < (mapData.rectCoords[i][1]) + mapData.rectCoords[i][3])){
          return true;
      }
  }

  for(var i = 4; i < mapData.doorCoords.length; i++){
      if((xPos > (mapData.doorCoords[i][0]) ) && (xPos < (mapData.doorCoords[i][0]) + mapData.doorCoords[i][2]) && (yPos > (mapData.doorCoords[i][1])) && (yPos < (mapData.doorCoords[i][1]) + mapData.doorCoords[i][3])){
          return true;
      }
  }

  return false;
  
}

function determineClosestPlayer(enemyX, enemyY, roomId){
  var playersInRoom = players.filter(p => p.roomId == roomId);

  var minDistance = 100000000;
  var closestPlayer;

  playersInRoom.forEach(player => {
    if(!player.downed){
      tempDistance = Math.sqrt(Math.pow(player.x - enemyX, 2) + Math.pow(player.y - enemyY, 2));
      if(tempDistance < minDistance){
        minDistance = tempDistance;
        closestPlayer = player;
      } 
    }
  })
  return closestPlayer;
}

function playerEnemyContact(players, enemies){
  enemies.forEach(enemy => {
    players.forEach(player =>{
      var distance = 0;
      distance = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
      if(distance <= 50){
        player.health -= enemy.damage;
      }
    });
  });
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
                      bullets[i].damage -= bullets[i].damageDecreaseConstant;
                  }
                  enemy.bulletInEnemy = i;
                  bullets[i].bulletInEnemy = enemy.index;
              }else if(enemy.bulletInEnemy == i){
                  enemy.bulletInEnemy = -1;
              }
              if(bullets[i].damage <= 0){
                bullets.splice(i, 1);
              }

              if(enemy.health <= 0.01){
                players[bullets[i].playerFired].kills++;
                removeEnemy(enemy.index, enemy.roomId);
                bullets[i].bulletInEnemy = -1;
              }
          }
          });
          if(bullets[i] != null){
              bullets[i].x += bullets[i].velocity * Math.cos(bullets[i].angle) + (bullets[i].sprayDeviation * Math.sin(bullets[i].angle));
              bullets[i].y += bullets[i].velocity * Math.sin(bullets[i].angle) - (bullets[i].sprayDeviation * Math.cos(bullets[i].angle));
              bullets[i].damage -= bullets[i].bulletDecay;
          }
      }
  }
      
  
}



