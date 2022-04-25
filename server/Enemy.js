class Enemy{

    constructor(spawn, index, speed, health, damage, roomId, enemyRandomSpawnVariable){

        this.enemySpawns = [
            //x   y   l    w   xdev            ydev
            [300, -5, 100, 10, 100, 0], //spawn 0 (top left)
            [1100, -5, 100, 10, 100, 0], //spawn 1 (top right)
            [-5, 300, 10, 100, 0, 100], //spawn 2 (left top)
            [-5, 800, 10, 100, 0, 100], //spawn 3 (left bottom)
            [500, 995, 100, 10, 100, 0], //spawn 4 (bottom left)
            [1300, 995, 100, 10, 100, 0], //spawn 5 (bottom right)
        ]

        this.spawn = spawn;
        this.x = this.enemySpawns[this.spawn][0] + this.enemySpawns[this.spawn][4] * enemyRandomSpawnVariable;
        this.y = this.enemySpawns[this.spawn][1] + this.enemySpawns[this.spawn][5] * enemyRandomSpawnVariable;
        this.index = index;
        this.speed = speed;
        this.health = health;
        this.damage = damage;
        this.initialHealth = this.health;
        this.healthPercent = 100;
        this.bulletInEnemy = -1;
        this.roomId = roomId;
        this.Xspeed = 0;
        this.Yspeed = 0;
        this.xClearPos = true;
        this.xClearNeg = true;
        this.yClearPos = true;
        this.yClearNeg = true;

    }   
    
}

module.exports = Enemy;