class Pistol {

    constructor(xPos, yPos){
        this.x = xPos;
        this.y = yPos
        //draw variables
        this.gLength = 20;
        this.gWidth = 5;
        this.xShift = 25;
        this.yShift = -2.5;

        
        //ammo
        this.startingIn = 12; //mag size/starting ammo
        this.startingOut = 120;

        //reloading
        this.reloadTime = 1000; //milliseconds
        this.tempTimeEnd = 0;
        this.tempInitIn = 0;

        //gun stats
        this.damage = 20;
        this.bulletVelocity = 20;
        this.name = "Pistol";
        

        //shooting variables
        this.canShoot = true;
        this.bulletDisplacement = 48;

    }

    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(100,100,100);
                rect(this.xShift, this.yShift, this.gLength, this.gWidth);
                strokeWeight(2);
                line(this.xShift + 7, this.yShift + 5, 23, 10);
                line(this.xShift + 7, this.yShift, 23, -10);
            pop();
        }
    }

    shoot(){
        if(mouseIsPressed && this.canShoot && score.ammoIn > 0 && !score.reloading){
            sendBulletData();
            score.ammoIn--;
            this.canShoot = false;
        }
        if(!mouseIsPressed){
            this.canShoot = true;
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

  


}