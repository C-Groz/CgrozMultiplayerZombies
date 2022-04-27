class MysteryBox{
    constructor(xPos, yPos){
        this.x = xPos;
        this.y = yPos;
        this.length = 150;
        this.width = 50;
        this.xDist = 50;
        this.yDist = 50;
        this.cost = 1000;
        this.spinning = false;
        this.open = false;
        this.fPressed = false;
        this.gunCurrent;

        this.time = 0;
        this.timeEnd = 0;
        this.spinDuration = 5000;
        this.timeIncrement = 1000;
        this.timeSpinning = 0;
        this.gunIndex = 0;
        this.pickedUpBool = false;

        this.tempGunPickup = new WallGun(0, 0, new AK(0,0));
        this.tempGunPickup.message = "F to pick up";
        this.tempGunPickup.cost = " ";
        this.tempGunPickup.xTextDisplacement = 70;

        this.guns = [
            //new Pistol(0,0),
            new M1911(0,0), //0
            new Magnum(0,0), //1
            new Deagle(0,0), //2
            new AK(0,0), //3 
            new M4(0,0), //4
            new Famas(0,0), //5
            new MP5(0,0), //6
            new Olympia(0,0), //7
            new Barrett(0,0), //8
        ]
        

        this.questionmark = loadImage('images/questionMark.png');
        this.questionmarkflipped = loadImage('images/questionmarkflipped.png');
        this.glow = loadImage('images/light_burst_green.jpg');

    }
    drawMysteryBox(){
        fill(159,198,255)
        rect(this.x + clientMap.x, this.y + clientMap.y, this. length, this.width);
        if(!this.open){
            image(this.questionmark, this.x + clientMap.x + 10, this.y + clientMap.y, 50, 50);
            image(this.questionmarkflipped, this.x + clientMap.x + 90, this.y + clientMap.y, 50, 50);
        }
        if(this.open){
            image(this.glow, this.x + clientMap.x + 1, this.y + clientMap.y, 148, 49);
            if(this.timeSpinning >= this.spinDuration){
                this.spinning = false;
                this.offerGunInBox(this.guns[this.gunIndex]);
                
            }
            else if(this.time + this.timeIncrement < millis() && this.spinning){
                this.gunIndex = floor(random(0,this.guns.length - .0001));
                this.time = millis();
                this.timeSpinning += this.timeIncrement;
            }

            this.drawGunInBox(this.guns[this.gunIndex]);
            
        }
        
    }
    playerInProximity(){
        if(this.rectangleContains(this.x - this.xDist + clientMap.x, this.y - this.yDist + clientMap.y, this.length + this.xDist * 2, this.width + this.yDist * 2, clientPlayer.x, clientPlayer.y)){
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
    offerInteraction(){
        fill(255, 255, 255);
        textSize(30);
        text("F To Buy Mystery Gun $" + this.cost, clientPlayer.x, clientPlayer.y + 100);
    }
    startSpin(){
        this.spinning = true;
        this.open = true;
        this.time = millis();
        this.timeEnd = this.timeStart + this.timeDuration;    
        this.timeSpinning = 0;    
        score.money -= this.cost;
    }
    drawGunInBox(gun){
        image(gun.img, this.x + this.length/2 - gun.imgl/2 + clientMap.x, this.y + this.width/2 - gun.imgw/2 + clientMap.y, gun.imgl, gun.imgw)
    }
    offerGunInBox(gun){
        this.tempGunPickup.x = this.x + this.length/2 - gun.imgl/2;
        this.tempGunPickup.y = this.y + this.width/2 - gun.imgw/2;
        this.tempGunPickup.setGun(gun);
        if(this.playerInProximity()){
            this.tempGunPickup.offerPickup();
        }
        
    }
    userPickedUp(){
        var tempGun = currentGun;
        currentGun = this.guns[this.gunIndex]; 
        this.guns[this.gunIndex] = tempGun;

        score.ammoIn = currentGun.startingIn;
        score.ammoOut = currentGun.startingOut;

        this.closeBox();
    
    }
    closeBox(){
        this.open = false;
        this.time = 0;
        this.timeEnd = 0;
        this.spinDuration = 5000;
        this.timeIncrement = 1000;
        this.timeSpinning = 0;
        this.gunIndex = 0;
        this.pickedUpBool = false;
    }
}