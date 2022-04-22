class ClientGameMap {
    // moving game map
    
        constructor(xPos, yPos){
            this.x = xPos;
            this.y = yPos;
            this.playerSpeed = 5;
    
            this.coords = [
            //    xpos  ypos l(x) w(y)
                [-1000, 0, 1000, 1000], //left map edge
                [-1000, -1000, 3500, 1000], //top map edge
                [-1000, 1000, 3500, 1000], //bottom map edge
                [1500, 0, 50, 1000], //right map edge
                [600, 0, 30, 200], //right spawn room wall
                [600, 400, 30, 200], //right spawn room wall
                [0, 600, 630, 30], //bottom spawn room wall
                [600, 600, 120, 30],//room under spawn connector wall
                [700, 600, 30, 100],//room under spawn top door wall
                [700, 900, 30, 100],//room under spawn bottom door wall
            ]
    
            this.doors = [
                //             n  x    y    l   w    cost  x/y interaction dist spawns
                //new ClientDoor(1, 600, 200, 30, 200, 1000, 50, 25, [1, 5]), 
                //new ClientDoor(2, 700, 700, 30, 200, 1000, 50, 25, [3, 4]),
            ]
            this.doorCoords = [
            //   n  x    y    l   w
                [1, 600, 200, 30, 200], //door 1
                [2, 700, 700, 30, 200]  //door 2
            ]
            this.doorsActive;
    
            this.enemySpawns = [
                [300, -5, 100, 10], //spawn 0 (top left)
                [1100, -5, 100, 10], //spawn 1 (top right)
                [-5, 300, 10, 100], //spawn 2 (left top)
                [-5, 800, 10, 100], //spawn 3 (left bottom)
                [500, 995, 100, 10], //spawn 4 (bottom left)
                [1300, 995, 100, 10], //spawn 5 (bottom right)
            ]
    
            this.pickups = [
                //this.topGunPickup = new WallGun(150, -40, new Olympia(clientPlayer.x, clientPlayer.y)),
            ]
    
            let mapCoords = {
                rectCoords: this.coords,
                doorCoords: this.doorCoords,
                doorsActive: [1, 2],
            }
    
            socket.emit('mapData', mapCoords);
            this.moveData;
        }
    
        drawMap(){
            fill(0,0,0);
            for(var i = 0; i < this.coords.length; i++){
                rect(this.coords[i][0] + this.x, this.coords[i][1] + this.y, this.coords[i][2], this.coords[i][3] )
            }
            //this.drawBullets(currentBullets);
            //this.drawOtherPlayers(connectedUsersData);
            //this.drawDoors();
            //this.drawPickups();
            //this.drawSpawns();
            //this.drawEnemies(enemiesData);
        }
    
        move(){
    
            if (keyIsDown(65)) {
                if(!this.anyRectangleContains(clientPlayer.leftX, clientPlayer.y)){
                    this.x += this.playerSpeed;
                    //for(var i = 0; i < enemies.length; i++){
                    //enemies[i].x += this.playerSpeed;
                    //}
                }
                
            }
          
            if (keyIsDown(68)) {   
                    if(!this.anyRectangleContains(clientPlayer.rightX, clientPlayer.y)){
                    this.x -= this.playerSpeed;
                    //for(var i = 0; i < enemies.length; i++){
                    //enemies[i].x -= this.playerSpeed;
                    //}
                }
                
            }
          
            if (keyIsDown(87)){
                    if(!this.anyRectangleContains(clientPlayer.x, clientPlayer.topY)){
                    this.y += this.playerSpeed;
                    //for(var i = 0; i < enemies.length; i++){
                    //enemies[i].y += this.playerSpeed;
                    //}
                }
            }
          
            if (keyIsDown(83)) {
                    if(!this.anyRectangleContains(clientPlayer.x, clientPlayer.bottomY)){
                    this.y -= this.playerSpeed;
                    //for(var i = 0; i < enemies.length; i++){
                    //enemies[i].y -= this.playerSpeed;
                    //}
                }
                
            }
            this.moveData = {
                index: clientPlayer.index,
                decX: this.decimalPlayerLocationX(),
                decY: this.decimalPlayerLocationY()
            };
            
    
        }
        
        decimalPlayerLocationX(){
            return (clientPlayer.x - this.x) / 1000;
        }
        decimalPlayerLocationY(){
            return (clientPlayer.y - this.y)/ 1500;
        }
        returnPlayerLocationX(decimal){
            return (1000 * decimal) + this.x;
        }
        returnPlayerLocationY(decimal){
            return (1500 * decimal) + this.y;
        }
    
        drawOtherPlayers(players){
            fill(100, 200, 40);
            for(let i = 0; i < clientPlayer.index; i++){
                if(players[i] != null){
                    let x = this.returnPlayerLocationX(players[i].decX);
                    let y = this.returnPlayerLocationY(players[i].decY);
                    circle(x, y, 50);
    
                    players[i].gun.drawGun(x, y, players[i].angle);
    
                    textSize(30);
                    text("" + players[i].id, x - 9, y - 30);
                }
            }
    
            for(let i = clientPlayer.index + 1; i < players.length; i++){
                if(players[i] != null){
                    let x = this.returnPlayerLocationX(players[i].decX);
                    let y = this.returnPlayerLocationY(players[i].decY);
                    circle(x, y, 50);
    
                    players[i].gun.drawGun(x, y, players[i].angle);
    
                    textSize(30);
                    text("" + players[i].id, x - 9, y - 30);
                }
            }
    
        }
    
        drawEnemies(enemies){
            enemies.forEach(enemy => {
                if(enemy != null){
                    enemy.healthPercent = enemy.health / enemy.initialHealth * 100;
                    fill(60 + enemy.healthPercent/2.5, 10, 10);
                    circle(enemy.x + this.x, enemy.y + this.y, 50);
                    //textSize(30);
                    //text(enemy.index, enemy.x + this.x, enemy.y - 30 + this.y);
                }
                
            });
        }
    
        drawBullets(bullets){
            bullets.forEach(element => {
                circle(element.x + this.x, element.y + this.y, 5);
            });
        }
    
        drawDoors(){
            fill(181, 101, 21);
            this.doors.forEach(element => {
                if(this.doorsActive != null){
                    this.doorsActive.forEach(n => {
                        if(n == element.doorNum){
                            rect(element.x + this.x, element.y + this.y, element.l, element.w);
                        }
                    })
                }
            });
        }
    
        drawSpawns(){
            fill(131, 105, 83);
            this.enemySpawns.forEach(spawn => {
                rect(spawn[0] + this.x, spawn[1] + this.y, spawn[2], spawn[3]);
            });
    
        }
    
        drawPickups(){
            this.pickups.forEach(element => {
                element.drawPickup();
            });
        }
    
        anyRectangleContains(xPos, yPos){
            for(var i = 0; i < this.coords.length; i++){
                if((xPos > (this.coords[i][0] + this.x) ) && (xPos < (this.coords[i][0] + this.x) + this.coords[i][2]) && (yPos > (this.coords[i][1] + this.y)) && (yPos < (this.coords[i][1] + this.y) + this.coords[i][3])){
                    return true;
                }
            }
    
            for(var a = 0; a < this.doorCoords.length; a++){
                if((xPos > (this.doorCoords[a][1] + this.x) ) && (xPos < (this.doorCoords[a][1] + this.x) + this.doorCoords[a][3]) && (yPos > (this.doorCoords[a][2] + this.y)) && (yPos < (this.doorCoords[a][2] + this.y) + this.doorCoords[a][4])){
                    return true;
                }
            }
    
            
            return false;
            
        }
    
        cornerCollision(cornerX, cornerY, circleX, circleY, circleRad){
            if(collidePointCircle(cornerX, cornerY, circleX, circleY, circleRad * 2)){
                console.log(69);
                return true;
            }
            return false;
        }
    
        listCornerCollision(cornerList, circleX, circleY, circleRad){
            cornerList.forEach(element => {
                if(this.cornerCollision(element[0], element[1], circleX, circleY, circleRad)){
                    return true;
                }
            });
            return false;
        }
    
    }