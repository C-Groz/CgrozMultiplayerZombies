class WallGun {
    constructor(xPos, yPos, gun){
        this.x = xPos;
        this.y = yPos;
        this.message = "F to buy " + gun.name + " $";
        this.message2 = "F to reload " + gun.name + " Ammo $"
        this.cost = gun.cost;
        this.ammoCost = gun.ammoCost;
        this.pickedUpBool = false;
        this.img = gun.img;
        this.gun = gun;
        this.xDist = gun.imgl;
        this.yDist = gun.imgw;



        this.xTextDisplacement = 140;
        this.yTextDisplacement = 100;

    }

    userPickedUp(){
        if(score.money >= this.cost && !this.pickedUpBool && currentGun.name != this.gun.name){
            score.money -= this.cost;
            currentGun = this.gun; 
            score.ammoIn = currentGun.startingIn;
            score.ammoOut = currentGun.startingOut;
            clientPlayer.gunIndex = this.gun.gunIndex;
        }
        else if(score.money >= this.ammoCost && !this.pickedUpBool && currentGun.name == this.gun.name){
            score.money -= this.ammoCost;  
            score.ammoOut = currentGun.startingOut;
        }
        
    }
    drawPickup(){
        image(this.img, this.x + clientMap.x - 20, this.y + clientMap.y, this.gun.imgl, this.gun.imgw)
    }
    offerPickup(){
        if(currentGun.name != this.gun.name){
            fill(255, 255, 255);
            textSize(30);
            text(this.message + this.cost, clientPlayer.x, clientPlayer.y + this.yTextDisplacement);
        }else{
            fill(255, 255, 255);
            textSize(30);
            text(this.message2 + this.ammoCost, clientPlayer.x, clientPlayer.y + 100);
        }
        
    }
    setGun(gun){
        this.gun = gun;
    }
    playerInProximity(){
        if(this.rectangleContains(this.x - 60 + clientMap.x, this.y - 30 + clientMap.y, this.xDist + 60, 120, clientPlayer.x, clientPlayer.y)){
            return true;
        }
        return false;
    }
    rectangleContains(rectX, rectY, rectL, rectW, x, y){
        if((x > rectX) && (x < rectX + rectL) && (y > rectY) && (y < rectY + rectW)){
            return true;
        }
        return false
    }
}