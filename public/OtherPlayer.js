class OtherPlayer {
  constructor(player) {
    this.id = player.id;
    this.roomId = player.roomId;
    this.name = player.name;
    this.number = player.number;
    this.winL = player.winL;
    this.winW = player.winW;
    this.decX = player.decX;
    this.decY = player.decY;
    this.angle = player.angle;
    this.gun = player.gun; //index of gun type in guns array in sketch
    this.kills = player.kills;
    this.index = player.index;
    this.x = player.x;
    this.y = player.y;
  }


  draw() {
    if(this.index != clientPlayer.index){
      fill(100, 200, 40);
      let x = this.returnPlayerLocationX(this.decX);
      let y = this.returnPlayerLocationY(this.decY);
      circle(x, y, 25);
  
      this.gun.drawGun(x, y, this.angle);
  
      textSize(30);
      text("" + this.name, x, y - 40);
    }

    
  }
  
  returnPlayerLocationX(decimal){
    return (1000 * decimal) + clientMap.x;
  }
  returnPlayerLocationY(decimal){
    return (1500 * decimal) + clientMap.y;
  }

}