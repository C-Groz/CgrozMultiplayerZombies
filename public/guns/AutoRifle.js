class AutoRifle {


    constructor(xPos, yPos) {
        this.x = xPos;
        this.y = yPos;

        //gun length/width
        this.gLength = 40;
        this.gWidth = 6;
        this.xShift = 25;
        this.yShift = -4;
        this.bulletDisplacement = 100;


        //ammo
        this.startingIn = 30; //mag size/starting ammo
        this.startingOut = 250;
        
        //reloading
        this.reloadTime = 1000; //milliseconds
        this.tempTimeEnd = 0;
        this.tempInitIn = 0;

        //gun stats
        this.damage = 40;
        this.bulletVelocity = 15;
        this.timeBetweenBullets = 130;
        this.name = "AR";
        this.textSize = 45;
        this.yDisplacement = 40;
        this.damageDecreaseConstant = 10;

        this.canShoot = true;
        this.lastBulletFired = 0;
    }

    
    drawGun(xPos,yPos) {
        fill(100,100,100);
        rect(xPos, yPos, this.gLength, this.gWidth);
        strokeWeight(2);
        
    }
    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(100,100,100);
                rect(this.xShift, this.yShift, this.gLength, this.gWidth);
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
        if(mouseIsPressed && score.ammoIn > 0 && !score.reloading && this.lastBulletFired + this.timeBetweenBullets < millis()){
            sendBulletData();
            score.ammoIn--;
            this.lastBulletFired = millis();
        }
    }


}