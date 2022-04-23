class Sniper {
    constructor(xPos, yPos){
        this.x = xPos;
        this.y = yPos;

        //gun length/width
        this.gLength = 80;
        this.gWidth = 5;
        this.xShift = 25;
        this.yShift = -4;
        this.bulletDisplacement = 110;


        //ammo
        this.startingIn = 5; //mag size/starting ammo
        this.startingOut = 30;
        
        //reloading
        this.reloadTime = 1400; //milliseconds
        this.tempTimeEnd = 0;
        this.tempInitIn = 0;

        //gun stats
        this.damage = 150;
        this.bulletVelocity = 40;
        this.name = "Sniper";
        this.textSize = 22;
        this.yDisplacement = 33;
        this.bulletCooldown = 1000;
        this.canShoot = true;
        this.lastShot = 0;
        this.damageDecreaseConstant = 5;

        this.gunIndex = 8;
    }
    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(10,80,10);
                rect(this.xShift, this.yShift + 1, this.gLength, this.gWidth);
                strokeWeight(2);
                line(this.xShift + 10, this.yShift + 6, 30, 8); //right arm
                line(this.xShift + 5, this.yShift + 12, 21.5, 12); //right arm
                line(this.xShift + 20, this.yShift, 37, -10); //left arm
                line(this.xShift + 13, this.yShift - 6, 20, -16); //left arm
            pop();
        }
    }


    startReload(){
        this.tempTimeEnd = millis() + this.reloadTime;
        this.tempInitIn = this.ammoIn;

        score.reloading = true;
    }
    reload(){
        if(score.ammoIn + score.ammoOut > this.startingIn){
            score.ammoOut -= this.startingIn - score.ammoIn;
            score.ammoIn = this.startingIn;
        }else{
            score.ammoIn += score.ammoOut;
            score.ammoOut = 0;
        }
        score.reloading = false;
    }
    shoot(){
        if(mouseIsPressed && this.canShoot && score.ammoIn > 0 && !score.reloading && this.lastShot + this.bulletCooldown < millis()){
            sendBulletData();
            score.ammoIn--;
            this.canShoot = false;
            this.lastShot = millis();
        }
        if(!mouseIsPressed){
            this.canShoot = true;
        }
    } 
}