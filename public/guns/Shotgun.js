class Shotgun {
    constructor(xPos, yPos){
        this.x = xPos;
        this.y = yPos;

        //gun length/width
        this.gLength = 35;
        this.gWidth = 5;
        this.xShift = 25;
        this.yShift = -4;
        this.bulletDisplacement = 70;


        //ammo
        this.startingIn = 2; //mag size/starting ammo
        this.startingOut = 40;
        
        //reloading
        this.reloadTime = 800; //milliseconds
        this.tempTimeEnd = 0;
        this.tempInitIn = 0;

        //gun stats
        
        this.damage = 40; // per bullet(5)
        this.bulletVelocity = 20;
        this.name = "Shotgun";
        this.textSize = 22;
        this.yDisplacement = 33;

        this.canShoot = true;
        this.lastBulletFired = 0;
        this.cost = 500;
        this.ammoCost = 250;
        this.img = loadImage('images/shotgun.png');
        this.imgl = 85;
        this.imgw = 45;
        this.damageDecreaseConstant = 15;
        this.lastShot = 0;
        this.bulletCooldown = 100;
        this.rangeBulletDecay = .125;
    }

    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(96, 54, 24);
                rect(this.xShift, this.yShift + 1, this.gLength, this.gWidth, 10);
                fill(0, 0, 0);
                rect(this.xShift + 35, this.yShift + 2.5, 10, 2);
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
            
            for(var i = -4; i < 5; i+=2){
                sendBulletDataShotgun(i);
            }

            score.ammoIn--;
            this.canShoot = false;
            this.lastShot = millis();
        }
        if(!mouseIsPressed){
            this.canShoot = true;
        }
    } 


}