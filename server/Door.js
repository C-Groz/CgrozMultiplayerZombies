class Door {
    constructor(num, roomId, cost, x, y, l, w, xInteractionDist, yInteractionDist, spawns) {
        this.doorNum = num  
        this.roomId = roomId;
        this.cost = cost;
        this.open = false;
        this.x = x;
        this.y = y;
        this.l = l;
        this.w = w;

        this.xDist = xInteractionDist;
        this.yDist = yInteractionDist;

        this.activateSpawns = spawns;
    }
  }
  
  module.exports = Door;