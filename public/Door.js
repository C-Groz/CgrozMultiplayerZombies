class Door{
    constructor(door){
        this.doorNum = door.doorNum;  
        this.roomId = door.roomId;
        this.cost = door.cost;
        this.open = door.open;
        this.x = door.x;
        this.y = door.y;
        this.l = door.l;
        this.w = door.w;
        this.xDist = door.xDist;
        this.yDist = door.yDist;
        this.pickedUpBool = false;
        this.activateSpawns = door.activateSpawns;
    }

    draw(){
        if(!this.open){
            fill(181, 101, 21);
            rect(this.x + clientMap.x, this.y + clientMap.y, this.l, this.w);
        }
    }
    playerInProximity(){
        if(this.rectangleContains(this.x - this.xDist + clientMap.x, this.y - this.yDist + clientMap.y, this.l + this.xDist * 2, this.w + this.yDist * 2, clientPlayer.x, clientPlayer.y)){
            return true;
        }
        return false;
    }

    userInteracted(){
        if(score.money >= this.cost){
        this.openDoor();
        }
    }

    offerInteraction(){
        if(!this.open){
            fill(255, 255, 255);
            textSize(30);
            text("F to Open Door $" + this.cost, clientPlayer.x, clientPlayer.y + 100);
        }
    }

    openDoor(){
        let doorData = {
            doorNum: this.doorNum,
            roomId: clientPlayer.roomId
        }
        socket.emit("openDoor", doorData);



        score.money -= this.cost;

        //this.activateSpawns.forEach(element => {
        //    spawnsActive.push(element);
        //});
    }

    rectangleContains(rectX, rectY, rectL, rectW, x, y){
        if((x > rectX) && (x < rectX + rectL) && (y > rectY) && (y < rectY + rectW)){
            return true;
        }
        return false
    }
}