class Player {
  constructor(id, roomId, num, winL, winW, decX, decY, angle, index, gun) {
    this.id = id;
    this.roomId = roomId;
    this.name = "New Player";
    this.number = num;
    this.winL = winL;
    this.winW = winW;
    this.decX = decX;
    this.decY = decY;
    this.angle = angle;
    this.gun = gun; //index of gun type in guns array in sketch
    this.kills = 0;
    this.index = index;
    this.x = this.returnPlayerLocationX(this.decX);
    this.y = this.returnPlayerLocationY(this.decY);
  }
  returnPlayerLocationX(decimal){
    return (1000 * decimal);
  }
  returnPlayerLocationY(decimal){
    return (1500 * decimal);
  }
}

module.exports = Player;