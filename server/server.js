const express = require("express");
const socket = require('socket.io');
const app = express();
const short = require('short-uuid');
const mysql = require('mysql');

const Player = require("./Player");
const Door = require("./Door");
const Bullet = require("./Bullet");
const Enemy = require("./Enemy");
const RoundInfo = require("./RoundInfo");
//const { Client } = require("socket.io/dist/client");

const ROOM_MAX_CAPACITY = 4;

const server = app.listen(process.env.PORT || 3000);
console.log('The server is now running at port ' + process.env.PORT);
app.use(express.static("public"));
const io = socket(server);

let sqlConnected = false;
let LBsolos;
let LBduos;
let LBtrios;
let LBquads;

const connection = mysql.createConnection({
  host: 'cgrozdatabase.ciimbtwlcait.us-east-1.rds.amazonaws.com', // host for connection
  port: '3306', // default port for mysql is 3306
  database: 'sys', // database from which we want to connect out node application
  user: 'admin', // username of the mysql connection
  password: 'SQL45rootuser.0' // password of the mysql connection
});

try{
  connection.connect();
  sqlConnected = true;
  updateLeaderBoard();
  console.log('sql connected');
}catch(err){
  console.log('unable to connect to mysql err: ' + err);
  sqlConnected = false;
}

let rooms = [short.generate()];
let lastRoomLoggedInDB = "";
let players = [];
let doors = [];
let roundInfos = [];
let userCounter = 0;
let bullets = [];
var enemies = []
var mapData;
var sessionInfo = [];
var playerKills;
setInterval(updateGame, 8); //default 16 
setInterval(updateLeaderBoard, 12000);



io.sockets.on('connection', 
  function(socket) {
    console.log("New connection " + socket.id);

    socket.on('start', 
    function(data){
      updateLeaderBoard();
      userCounter++;

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

    socket.once('allPlayersDowned', function(playerInfo){
      var gameActive = false;
      io.to(playerInfo.roomId).emit('sessionOver', gameActive);
      sendGameDataToDataBase(playerInfo.roomId);
    });

    socket.on('nameChange', 
    function(nameData){
      players.forEach(player => {
        if(player.number == nameData.number){
          player.name = nameData.name;
        }
      })
    });


    
    socket.on('playerRevive', function(downedPlayer){
      players[downedPlayer.index].gun = 0;
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
      var playersInRoomStart = players.filter(p => p.roomId == room);
      var playerNames = "";
      playersInRoomStart.forEach(player => {
        playerNames += player.name + ", ";
      });
      playerNames = playerNames.substring(0, playerNames.length - 2);
      sessionInfo.push([room, 0, playersInRoomStart.length, playerNames]);
      let doorsInRoomStart = doors.filter(d => d.roomId == room);
      io.to(room).emit("startGame", doorsInRoomStart);
    });

   

    socket.on("disconnect", () => {
      //io.sockets.emit("disconnect", socket.id);
      tempPlayer = players.filter(player => player.id == socket.id);
      players = players.filter(player => player.id !== socket.id);
      if(tempPlayer[0] != null){
        updateIndexes(tempPlayer[0].index);
      }
    });
    
  
  });





function updateGame() {
  for (const room of rooms) {
    try{
      var playersInRoom = players.filter(p => p.roomId === room);
      var doorsInRoom = doors.filter(d => d.roomId === room);
      var bulletsInRoom = bullets.filter(b => b.roomId === room);
      var enemiesInRoom = enemies.filter(e => e.roomId === room);
      var roundInfoInRoom = roundInfos.filter(r => r.roomId === room);

      io.to(room).emit("heartbeat", playersInRoom);
      io.to(room).emit("doorData", doorsInRoom);
      io.to(room).emit('bulletData', bulletsInRoom);
      io.to(room).emit('enemyData', enemiesInRoom);
      io.to(room).emit('roundData', roundInfoInRoom);
    
      players.forEach(element =>{
        if(element != null){
          playerKills.push(element.kills);
          element.x = returnPlayerLocationX(element.decX);
          element.y = returnPlayerLocationY(element.decY);
        }
      });

      playersInRoom.forEach(player => {
        if(player.health <= 0 && !player.downed){
          player.downed = true;
          player.gun = 9;
          let playerData = {
            id: player.id,
            roomId: room,
            name: player.name,
            index: player.index,
          }
          io.to(room).emit('playerDown', playerData);
          io.to(room).emit('downedPlayerMessage', playerData);
        }
      })


      if(roundInfoInRoom[0] != null){
        if(roundInfoInRoom[0].enemiesRemaining <= 0 && enemiesInRoom.length == 0 && roundInfoInRoom[0].enemyCounter == roundInfoInRoom[0].roundEnemyAmount){
          roundInfos[roundInfoInRoom[0].index].round++;
          roundInfos[roundInfoInRoom[0].index].enemyCounter = 0;
          roundInfos[roundInfoInRoom[0].index].roundEnemyAmount = 2 * roundInfos[roundInfoInRoom[0].index].round + 4;
          roundInfos[roundInfoInRoom[0].index].enemiesRemaining = roundInfos[roundInfoInRoom[0].index].roundEnemyAmount;
          if(roundInfos[roundInfoInRoom[0].index].enemySpeed <= 1){
            roundInfos[roundInfoInRoom[0].index].enemySpeed += .05;
          }
          if(roundInfos[roundInfoInRoom[0].index].timeBetweenEnemies >= 200){
            roundInfos[roundInfoInRoom[0].index].timeBetweenEnemies-= 20;
          }
          roundInfos[roundInfoInRoom[0].index].enemyStartingHealth+= 5;

        }
        spawnEnemies(roundInfos[roundInfoInRoom[0].index]);
      }


      updateBullets(room);
      moveEnemies(room);
      playerEnemyContact(playersInRoom, enemiesInRoom);

      
      if(playersInRoom.length == 0){
        rooms = rooms.filter(r => r != room);
        console.log("Removed room " + room);
      }

      io.to(room).emit('killData', playerKills);

      playerKills = [];

      
    }catch(err){
      console.log("room: " + room + " err: " + err);
      rooms = rooms.filter(r => r != room);
      console.log("Removed room due to err" + room);
      sendGameDataToDataBase(room);
    }
  }
}
function sendGameDataToDataBase(roomId){
  if(sqlConnected){
    var kills = sessionInfo.filter(session => session[0] == roomId)[0][1];
    var gameType;
    var numPlayers = sessionInfo.filter(session => session[0] == roomId)[0][2];
    var playerNamesString = sessionInfo.filter(session => session[0] == roomId)[0][3];
   
    if(numPlayers == 1){
      //gameType = "solos";
      gameType = "solos";
    }
    else if(numPlayers == 2){
      //gameType = "duos";
      gameType = "duos";
    }
    else if(numPlayers == 3){
      //gameType = "trios";
      gameType = "trios";
    }
    else if(numPlayers == 4){
      //gameType = "quads";
      gameType = "quads";
    }
    var today = new Date().
    toLocaleString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}).
    replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');

    var sql = "INSERT INTO " + gameType + " (name, kills, date) VALUES ('" + playerNamesString + "', '" + kills + "', '" + today + "')";
    if(lastRoomLoggedInDB != roomId || gameType == ""){
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
      lastRoomLoggedInDB = roomId;
    }

  }
}

function updateLeaderBoard(){
  if(sqlConnected){
    try{
      var sql = "SELECT * FROM solos ORDER BY kills DESC LIMIT 0, 3;"
      connection.query(sql, function (err, result) {
        if (err) throw err;
        LBsolos = result;
      });

      sql = "SELECT * FROM duos ORDER BY kills DESC LIMIT 0, 3;"
      connection.query(sql, function (err, result) {
        if (err) throw err;
        LBduos = result;
      });

      sql = "SELECT * FROM trios ORDER BY kills DESC LIMIT 0, 3;"
      connection.query(sql, function (err, result) {
        if (err) throw err;
        LBtrios = result;
      });

      sql = "SELECT * FROM quads ORDER BY kills DESC LIMIT 0, 3;"
      connection.query(sql, function (err, result) {
        if (err) throw err;
        LBquads = result;
      });
      data = {
        solos: LBsolos,
        duos: LBduos,
        trios: LBtrios,
        quads: LBquads,
      };
      io.sockets.emit('leaderBoardData', data);
    }
    catch(err){
      console.log(err);
    }
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

function moveEnemies(roomId){
  enemies.forEach(enemy => {
    if(enemy.roomId == roomId){
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
    }
  });
  

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

function updateBullets(roomId){

  if(bullets.length != 0){
      for(var i = 0; i < bullets.length; i++){
        if(bullets[i].roomId == roomId){
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
                if(enemy.health <= 0){
                  players[bullets[i].playerFired].kills++;
                  sessionInfo.forEach(session => {
                    if(session[0] == players[bullets[i].playerFired].roomId){
                      session[1]++;
                    }
                  })
                  removeEnemy(enemy.index, enemy.roomId);
                  bullets[i].bulletInEnemy = -1;
                }
                if(bullets[i].damage <= 0){
                  bullets.splice(i, 1);
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
      
  
}



