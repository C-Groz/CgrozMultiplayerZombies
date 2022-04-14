
const socket = io.connect('http://localhost:3000');
let gameActive = false;
let nameInput;
let submitNameButtom;


let players = [];
//socket.on("heartbeat", players => updatePlayers(players));
socket.on("heartbeat", function(players) {
  updateMenus(players);
  updatePlayers(players);
});
socket.once('setPlayerNum', function(playerNum){
  clientPlayer.number = playerNum;
});

function setup() {
  createCanvas(windowWidth, windowHeight);

  clientPlayer = new ClientPlayer();


  nameInput = createInput('Enter Name');
  submitNameButtom = createButton('Submit')

  nameInput.position(windowWidth/2 - 100, windowHeight/2, 0);
  submitNameButtom.position(windowWidth/2 + 50, windowHeight/2, 0);
  submitNameButtom.mousePressed(changeName);

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

    players.forEach(player => {
      player.draw();
      player.move();
    });
  }
  
}

function updateMenus(serverPlayers){
  players = serverPlayers;
}

function changeName(){
  let nameData = {
    name: nameInput.value(),
    number: clientPlayer.number
  }

  socket.emit("nameChange", nameData);

}

function updatePlayers(serverPlayers) {
  let removedPlayers = players.filter(p => serverPlayers.findIndex(s => s.id == p.id));
  for (let player of removedPlayers) {
    removePlayer(player.id);
  }
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer.id)) {
      players.push(new Player(playerFromServer));
    }
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
