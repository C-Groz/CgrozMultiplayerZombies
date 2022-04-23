
const socket = io.connect('http://localhost:3000');
let gameActive = false;
let nameInput;
let submitNameButton;
let startGameButton;


let players = [];
let doors = [];
//socket.on("heartbeat", players => updatePlayers(players));
socket.on("heartbeat", function(players) {
  updateMenus(players);
  updatePlayers(players);
  sendDrawData();
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
socket.once('setPlayerNum', function(playerInfo){
  clientPlayer.number = playerInfo.playerNum;
  clientPlayer.roomId = playerInfo.roomId;
  clientPlayer.index = playerInfo.index;
});
socket.once('startGame', function(startDoors){
  doors.push(new Door(startDoors[0]));
  doors.push(new Door(startDoors[1]));
  gameActive = true;
});



function setup() {
  createCanvas(windowWidth, windowHeight);

  clientPlayer = new ClientPlayer();
  clientMap = new ClientGameMap(windowWidth/2 - 300, windowHeight - 750);
  currentGun = new M1911(clientPlayer.x, clientPlayer.y);


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
  
  ]


  nameInput = createInput('Enter Name');
  submitNameButton = createButton('Submit');
  startGameButton = createButton('Start Game');

  nameInput.position(windowWidth/2 - 100, windowHeight/2 + 15, 0);
  submitNameButton.position(windowWidth/2 + 50, windowHeight/2 + 15, 0);
  submitNameButton.mousePressed(changeName);
  startGameButton.position(windowWidth/2 - 150, windowHeight/2 + 50, 0);
  startGameButton.mousePressed(startGame);
  startGameButton.size(300, 50);

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
  if(!gameActive){
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
  


  }else{
    nameInput.hide();
    submitNameButton.hide();
    startGameButton.hide();
    clientPlayer.determineAngle();
    clientMap.move();
    sendDrawData();

    players.forEach(player => {
      player.draw();
    })
    
    clientPlayer.drawPlayer();
    currentGun.drawGun(clientPlayer.x, clientPlayer.y, clientPlayer.angle);
    clientMap.drawMap();

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
  }
  
}

function updateMenus(serverPlayers){
  players = serverPlayers;
}

function startGame(){
  socket.emit('startRoom', clientPlayer.roomId);
}

function changeName(){
  let nameData = {
    name: nameInput.value(),
    number: clientPlayer.number
  }

  socket.emit("nameChange", nameData);

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
