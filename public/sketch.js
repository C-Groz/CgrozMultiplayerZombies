const { text } = require("express");

const socket = io.connect('http://localhost:3000');
let gameActive = false;

let players = [];
//socket.on("heartbeat", players => updatePlayers(players));
socket.on("heartbeat", players => updateMenus(players));
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  if(!gameActive){
    text("Chank's Zombies", windowWidth/2, 200);
  }else{
    players.forEach(player => {
      player.draw();
      player.move();
    });
  }
  
}

function updateMenus(serverPlayers){

}

function updatePlayers(serverPlayers) {
  let removedPlayers = players.filter(p => serverPlayers.findIndex(s => s.id == p.id));
  for (let player of removedPlayers) {
    removePlayer(player.id);
  }
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer)) {
      players.push(new Player(playerFromServer));
    }
  }
}

function playerExists(playerFromServer) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === playerFromServer) {
      return true;
    }
  }
  return false;
}

function removePlayer(playerId) {
  players = players.filter(player => player.id !== playerId);
}
