

const socket = io.connect('https://safe-sands-40981.herokuapp.com/', { transports : ['websocket'] });
//const socket = io.connect('localhost:3000');

let gameActive = false;
let sessionOver = false;
let nameInput;
let submitNameButton;
let startGameButton;
let runOnce = true;
let runOnce2 = true;
let playerStats;
let leaderBoardData;
let leaderBoardActive = false;

//comment

let players = [];
let doors = [];
let bullets = [];
//socket.on("heartbeat", players => updatePlayers(players));
socket.on("heartbeat", function(players) {
  updateMenus(players);
  updatePlayers(players);
  sendDrawData();
});
socket.once('sessionOver', function(roomSessionActive){
  gameActive = roomSessionActive;
  sessionOver = true;
});
socket.on("updateIndex", function(indexRemoved) {
  if(clientPlayer.index > indexRemoved){
    clientPlayer.index--;
  }
});
socket.on("doorData", function(doorsFromServer){
  for(var i = 0; i < doors.length; i++){
    if(doors[i].open != doorsFromServer[i].open){
      doors[i].open = true;
      clientMap.doorCoords.splice(i-2, 1);
    }
  }
});
socket.on('killData', function(playerKills){
  if(playerKills[clientPlayer.index] > killData[clientPlayer.index]){
      score.money += 25 * (playerKills[clientPlayer.index] - killData[clientPlayer.index]);
  }
  killData = playerKills;
});
socket.on('bulletData', function(bulletsFromServer){
  bullets = bulletsFromServer;
});

socket.on('enemyData', function(enemies){
  enemiesData = enemies;
});

socket.on("roundData", function(roundInfo){
  if(roundInfo[0] != null){
    score.round = roundInfo[0].round;
    score.enemiesRemaining = roundInfo[0].enemiesRemaining;
  }
});

socket.on('downedPlayerMessage', function(playerData){
  displayDownMessage(playerData.name);
});

socket.on('playerDown', function(playerData){
  if(playerData.index == clientPlayer.index && playerData.roomId == clientPlayer.roomId){
    downPlayer();
  }
});

socket.on('playerRevived', function(downedPlayer){
  if(downedPlayer.index == clientPlayer.index){
    clientMap.playerSpeed = 5;
    currentGun = guns[0];
    clientPlayer.gunIndex = 0;
    players[clientPlayer.roomIndex].health = 100;
    if(score.money <= 500){
      score.money = 500;
    }
    
  }
});

socket.on('leaderBoardData', function(data){
  leaderBoardData = data;
})

socket.once('setPlayerNum', function(playerInfo){
  clientPlayer.number = playerInfo.playerNum;
  clientPlayer.roomId = playerInfo.roomId;
  clientPlayer.index = playerInfo.index;
  clientPlayer.roomIndex = playerInfo.roomIndex;

});
socket.once('startGame', function(startDoors){
  doors.push(new Door(startDoors[0]));
  doors.push(new Door(startDoors[1]));
  let mapCoords = {
    rectCoords: clientMap.coords,
    doorCoords: clientMap.doorCoords,
  }
  socket.emit('mapData', mapCoords);
  gameActive = true;
  closeLeaderBoard();
});



function setup() {
  createCanvas(windowWidth, windowHeight);

  players = [];
  clientPlayer = new ClientPlayer();
  mbox = new MysteryBox(300, 950);
  clientMap = new ClientGameMap(windowWidth/2 - 300, windowHeight - 750);
  currentGun = new M1911(clientPlayer.x, clientPlayer.y);
  score = new Score();
  


  guns = [
    //new Pistol(0,0),
    new M1911(0,0), //0
    new Magnum(0,0), //1
    new Deagle(0,0), //2
    new AK(0,0), //3 
    new M4(0,0), //4
    new Famas(0,0), //5
    new MP5(0,0), //6
    new Olympia(0,0), //7
    new Barrett(0,0), //8
    new Hands(0,0)//9
  ]

  wallGuns = [
    this.topGunPickup = new WallGun(150, -40, new Olympia(clientPlayer.x, clientPlayer.y)),
  ]

  killData = [];
  enemiesData = [];
  downMessageTime = 1500;
  downMessageStart = 0;
  currentDownedPlayerName = "";
  reviveTime = 1000;
  reviveTimeStart = 0;
  reviveInProgress = false;
  reviveStartBoolean = false;


  nameInput = createInput('Enter Name');
  submitNameButton = createButton('Submit');
  startGameButton = createButton('Start Game');
  leaderBoardButton = createButton('Leaderboard');
  closeLeaderBoardButton = createButton('Close');

  nameInput.position(windowWidth/2 - 100, windowHeight/2 + 15, 0);
  submitNameButton.position(windowWidth/2 + 50, windowHeight/2 + 15, 0);
  submitNameButton.mousePressed(changeName);
  startGameButton.position(windowWidth/2 - 150, windowHeight/2 + 50, 0);
  startGameButton.mousePressed(startGame);
  startGameButton.size(300, 50);
  startGameButton.style('font-size', '35px');
  let col = color(134, 194, 156);
  startGameButton.style('background-color', col);
  leaderBoardButton.size(300, 50);
  leaderBoardButton.position(windowWidth/2 - 150, windowHeight/2 + 100, 0);
  leaderBoardButton.mousePressed(activateLeaderboard);
  leaderBoardButton.style('font-size', '35px');
  closeLeaderBoardButton.mousePressed(closeLeaderBoard);
  closeLeaderBoardButton.size(100, 50);
  closeLeaderBoardButton.style('font-size', '30px');
  closeLeaderBoardButton.hide();



  this.data = {
    winW: windowWidth,
    winL: windowHeight,
    decX: clientMap.decimalPlayerLocationX(),
    decY: clientMap.decimalPlayerLocationY(),
  }
  socket.emit('start', this.data);

}

function draw() {
  background(220);
  if(!gameActive && !sessionOver){
    //textFont(inconsolata);
    textAlign(CENTER, CENTER);
    textSize(50);
    fill(160, 10, 20);
    text("Chank's Zombies", windowWidth/2, windowHeight/2 - 300);

    textSize(30);
    fill(105,105,105);
    text("Players in lobby: " + players.length, windowWidth/2, windowHeight/2 - 225);

    for(var i = 0; i < 4; i++){
      fill(105,105,105);
      rect(windowWidth/2 - 150, windowHeight/2 - 200 + 50*i, 300, 50);
    }
    for(var i = 0; i < 4; i++){
      fill(0,0,0);
      if(players[i] != null){
        text(players[i].name, windowWidth/2, windowHeight/2 - 175 + 50*i)
      }else{
        text("empty", windowWidth/2, windowHeight/2 - 175 + 50*i)
      }
    }

  }else if(gameActive){

    nameInput.hide();
    submitNameButton.hide();
    leaderBoardButton.hide();
    startGameButton.hide();
    clientPlayer.determineAngle();
    clientMap.move();
    currentGun.shoot();
    drawBullets();
    sendDrawData();

    if(players[clientPlayer.roomIndex].downed){
      clientPlayer.speed = 0;
    }

    players.forEach(player => {
      player.draw();
    });

    //reload
    if((keyIsDown(82) && !score.reloading) || score.ammoIn == 0 && !score.reloading){
      currentGun.startReload();
    }
    if(score.reloading && currentGun.tempTimeEnd < millis()){
      currentGun.reload();
    }
    
    clientPlayer.drawPlayer();
    currentGun.drawGun(clientPlayer.x, clientPlayer.y, clientPlayer.angle);
    clientMap.drawMap();
    wallGuns.forEach(wallGun => {
      wallGun.drawPickup();
    });
    mbox.drawMysteryBox();

    score.playerHealth = players[clientPlayer.roomIndex].health;

    doors.forEach(door => {
      door.draw();
      if(door.playerInProximity() && !door.open){
        door.offerInteraction();
        if(keyIsDown(70) && !door.pickedUpBool){
          door.userInteracted();
          door.pickedUpBool = true;
        }
        if(!keyIsDown(70)){
          door.pickedUpBool = false;
        }
      }
      
    });
    score.drawScoreLayout();
  
    if(mbox.playerInProximity()){
      if(!mbox.open){
        mbox.offerInteraction();
        mbox.pickedUpBool = false;
      }

      if(keyIsDown(70) && !mbox.pickedUpBool && !mbox.spinning && mbox.open){
        mbox.userPickedUp();
        mbox.pickedUpBool = true;
        mbox.fPressed = true;
      }
      if(keyIsDown(70) && !mbox.open && score.money >= mbox.cost && !mbox.fPressed){
        mbox.startSpin();
        mbox.fPressed = true;
      }
      if(!keyIsDown(70)){
        mbox.fPressed = false;
      }
    }

    wallGuns.forEach(element => {
      if(element.playerInProximity()){
        element.offerPickup();
        if(keyIsDown(70) && !element.pickedUpBool){
          element.userPickedUp();
          element.pickedUpBool = true;
        }
        if(!keyIsDown(70)){
          element.pickedUpBool = false;
        }
      }
  });

  inProximityOfDownedPlayer()
  

  if(downMessageStart + downMessageTime > millis() && gameActive){
    fill(255,255,255)
    textSize(40);
    text(currentDownedPlayerName + " is downed", windowWidth/2, windowHeight/2 + 200);
  }
  }else if(sessionOver){

    if(runOnce){
      playerStats = [
        player1 = {
          name: "",
          kills: "",
        },
        player2 = {
          name: "",
          kills: "",
        },
        player3 = {
          name: "",
          kills: "",
        },
        player4 = {
          name: "",
          kills: "",
        },
      ]

      var count = 0;
      players.forEach(player => {
        if(player.roomId == clientPlayer.roomId){
          playerStats[count].name = player.name;
          playerStats[count].kills = player.kills;
          count++;
        }
      });
      runOnce = false;
    }

    textSize(50);
    fill(160, 10, 20);
    text("Game Over", windowWidth/2, windowHeight/6);

    textSize(30);
    fill(0, 0, 0);
    text("Player", windowWidth/2 - 125, windowHeight/2 - 125);
    text("Kills", windowWidth/2 + 125, windowHeight/2 - 125);


    for(var i = 0; i < 4; i++){
      fill(105,105,105);
      rect(windowWidth/2 - 250, windowHeight/2 - 100 + 50*i, 250, 50);
      rect(windowWidth/2, windowHeight/2 - 100 + 50*i, 250, 50);

      fill(220);
      text(playerStats[i].name, windowWidth/2 - 125, windowHeight/2 - 75 + 50*i);
      text(playerStats[i].kills, windowWidth/2 + 125, windowHeight/2 - 75 + 50*i);
    }

  }
  if(leaderBoardActive){
    nameInput.hide();
    submitNameButton.hide();
    leaderBoardButton.hide();
    startGameButton.hide();
    fill(105,105,105);
    rect(50, 50, windowWidth - 100, windowHeight - 100, 50);
    closeLeaderBoardButton.show();
    closeLeaderBoardButton.position(windowWidth/2 - 50, windowHeight - 100);
    if(leaderBoardData != null){
      fill(230, 230, 230)
      textSize(40);
      text("Solos", windowWidth/2, (windowHeight/20)*2);
      for(var i = 0; i < 3; i++){
        textSize(20);
        text(leaderBoardData.solos[i].name + ": " + leaderBoardData.solos[i].kills, windowWidth/2, (windowHeight/20)*(3 + (i)));
      }

      textSize(40);
      text("Duos", windowWidth/2, (windowHeight/20)*6);
      for(var i = 0; i < 3; i++){
        textSize(20);
        text(leaderBoardData.duos[i].name + ": " + leaderBoardData.duos[i].kills, windowWidth/2, (windowHeight/20)*(7 + (i)));
      }
      textSize(40);
      text("Trios", windowWidth/2, (windowHeight/20)*10);
      for(var i = 0; i < 3; i++){
        textSize(20);
        text(leaderBoardData.trios[i].name + ": " + leaderBoardData.trios[i].kills, windowWidth/2, (windowHeight/20)*(11 + (i)));
      }

      textSize(40);
      text("Quads", windowWidth/2, (windowHeight/20)*14);
      for(var i = 0; i < 3; i++){
        textSize(20);
        text(leaderBoardData.quads[i].name + ": " + leaderBoardData.quads[i].kills, windowWidth/2, (windowHeight/20)*(15 + (i)));
      }
    }
  }
}

function closeLeaderBoard(){
  leaderBoardActive = false;
  nameInput.show();
  submitNameButton.show();
  leaderBoardButton.show();
  startGameButton.show();
  closeLeaderBoardButton.hide();
}

function updateMenus(serverPlayers){
  players = serverPlayers;
}

function allPlayersDowned(playersInRoom){
  var count = 0;
  playersInRoom.forEach(player => {
    if(player.downed == false){
      count++;
    }
  });
  if(count > 0){
    return false;
  }else{
    return true;
  }
}

function startGame(){
  leaderBoardActive = false;
  socket.emit('startRoom', clientPlayer.roomId);
}

function activateLeaderboard(){
  leaderBoardActive = true;
}

function changeName(){
  let nameData = {
    name: nameInput.value(),
    number: clientPlayer.number
  }

  socket.emit("nameChange", nameData);

}

function displayDownMessage(name){
  currentDownedPlayerName = name;
  downMessageStart = millis();
}

function downPlayer(){
  currentGun = new Hands(clientPlayer.x, clientPlayer.y);
  players[clientPlayer.index].gun = 9;
  clientPlayer.gun = 9;
  clientMap.playerSpeed = 0;
}

function updatePlayers(serverPlayers) {
  let removedPlayers = players.filter(p => serverPlayers.findIndex(s => s.id === p.id));
  for (let player of removedPlayers) {
    removePlayer(player.id);
  }
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if(Object.getPrototypeOf(serverPlayers[i]) != null){
      let tempPlayer = serverPlayers[i];
      removePlayer(serverPlayers[i].id);
      players.push(new OtherPlayer(tempPlayer));

    }
    if(!playerExists(playerFromServer.id)) {
      players.push(new OtherPlayer(playerFromServer));
    }
  }
  for(var i = 0; i < players.length; i++){
    players[i].gun = guns[players[i].gun];
}

}
function sendDrawData(){
  if(clientMap.moveData != null && clientPlayer != null){
    let data = {
      index: clientMap.moveData.index,
      decX: clientMap.moveData.decX, 
      decY: clientMap.moveData.decY,
      angle: clientPlayer.angle, 
      gunIndex: clientPlayer.gunIndex,
  }
  socket.emit('drawData', data);
  }
  if(allPlayersDowned(players)){
    if(runOnce2){
      playerInfo = {
        roomId: clientPlayer.roomId,
        playerNames: [],
        playerKills: [],
      }
      players.forEach(player => {
        playerInfo.playerNames.push(player.name);
        playerInfo.playerKills.push(player.kills);
      });
      socket.emit('allPlayersDowned', playerInfo);
      runOnce2 = false;
    }
  }
}

function inProximityOfDownedPlayer(){
  downedPlayers = players.filter(player => player.downed == true && player.index != clientPlayer.index);
  if(downedPlayers.length > 0){
    downedPlayers.forEach(downedPlayer => {
      let distance = sqrt(pow(downedPlayer.x - players[clientPlayer.index].x, 2) + pow(downedPlayer.y - players[clientPlayer.index].y, 2));
      if(distance < 75){
        offerRevive(downedPlayer);
      }
    });
  }
}

function offerRevive(downedPlayer){
  textSize(30);
  fill(255, 255, 255);
  text("Hold F to Revive " + downedPlayer.name, windowWidth/2, windowHeight/2 + 200);

  if(keyIsDown(70) && !reviveStartBoolean){
    reviveStartBoolean = true;
    reviveInProgress = true;
    reviveTimeStart = millis();
  }
  if(keyIsDown(70) && reviveInProgress){
    
  }else{
    reviveInProgress = false;
    reviveStartBoolean = false;
  }
  if(reviveTimeStart + reviveTime < millis() && reviveStartBoolean && reviveInProgress){
    revive(downedPlayer);
  }
}

function revive(downedPlayer){
  socket.emit('playerRevive', downedPlayer);
}

function drawBullets(){
  fill(0, 0, 0)
  bullets.forEach(element => {
      circle(element.x + clientMap.x, element.y + clientMap.y, 2.5);
  });
}

function sendBulletData(){
  let bulletData = {
      startX: clientPlayer.x - clientMap.x + currentGun.bulletDisplacement*cos(clientPlayer.angle),
      startY: clientPlayer.y - clientMap.y + currentGun.bulletDisplacement*sin(clientPlayer.angle),
      damage: currentGun.damage,
      velocity: currentGun.bulletVelocity,
      angle: clientPlayer.angle,
      sprayDeviation: 0,
      playerFired: clientPlayer.index,
      roomId: clientPlayer.roomId,
      decreaseConstant: currentGun.damageDecreaseConstant,
      bulletDecay: 0,

  }
  socket.emit('bulletFired', bulletData);
}

function sendBulletDataShotgun(sprayDeviation){
  let bulletData = {
      startX: clientPlayer.x - clientMap.x + currentGun.bulletDisplacement*cos(clientPlayer.angle),
      startY: clientPlayer.y - clientMap.y + currentGun.bulletDisplacement*sin(clientPlayer.angle),
      damage: currentGun.damage,
      velocity: currentGun.bulletVelocity,
      angle: clientPlayer.angle,
      sprayDeviation: sprayDeviation,
      playerFired: clientPlayer.index,
      roomId: clientPlayer.roomId,
      decreaseConstant: currentGun.damageDecreaseConstant,
      bulletDecay: currentGun.rangeBulletDecay,
  }
  socket.emit('bulletFired', bulletData);
}


function playerExists(playerFromServer) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id == playerFromServer) {
      return true;
    }
  }
  return false;
}

function removePlayer(playerId) {
  players = players.filter(player => player.id !== playerId);
}

