
const socket = io.connect('http://localhost:3000');
let gameActive = false;
let playerName = "n/a";

let players = [];
//socket.on("heartbeat", players => updatePlayers(players));
socket.on("heartbeat", players => {
  updateMenus(players);
  updatePlayers(players);
});
function setup() {
  createCanvas(windowWidth, windowHeight);
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
      rect(windowWidth/2 - 150, windowHeight/2 - 200 + 50*i, 300, 50);
    }

    text(playerName, windowWidth/2, windowHeight/2 - 150);

    let nameInput = createInput('Enter Name');
    nameInput.position(windowWidth/2 - 150, windowHeight/2);
    nameInput.size(200);
    nameInput.input()

    let submitButton = createButton('submit');
    submitButton.position(nameInput.x + nameInput.width, 65);
    submitButton.mousePressed(enterName);


  }else{

    players.forEach(player => {
      player.draw();
      player.move();
    });
  }
  
}

function updateMenus(serverPlayers){

}

function enterName(){
  playerName = input.value();
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
