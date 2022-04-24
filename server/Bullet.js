class Bullet {
    constructor(x, y, angle, damage, velocity, sprayDeviation, playerFired, roomId){
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.velocity = velocity;
        this.sprayDeviation = sprayDeviation;
        this.playerFired = playerFired;
        this.bulletInEnemy = -1;
        this.roomId = roomId;
    }
}

module.exports = Bullet;