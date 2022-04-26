class RoundInfo{
    constructor(roomId, index){
        this.roomId = roomId;
        this.round = 1;
        this.enemiesRemaining = 2;
        this.index = index;
        this.lastEnemySpawn = Date.now();
        this.timeBetweenEnemies = 1000;
        this.enemyCounter = 0;
        this.roundEnemyAmount = 0;
        this.enemyRandomSpawnVariable;
        this.spawnsActive = [0,2];
        this.gameActive = true;
    }
}

module.exports = RoundInfo;