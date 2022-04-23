class Magnum extends Pistol{

    constructor(xPos, yPos){
        super();

        //gun length/width
        this.gLength = 40;
        this.gWidth = 6;
        this.xShift = 25;
        this.yShift = -3;
        this.bulletDisplacement = 60;

        this.startingIn = 6; //mag size/starting ammo
        this.startingOut = 42;
        this.reloadTime = 1300;
        this.damage = 80;
        this.bulletVelocity = 20;
        this.name = "Magnum";
        this.textSize = 35;
        this.yDisplacement = 36;
        this.bulletCooldown = 700;
        this.lastShot = 0;
        this.img = loadImage('images/magnum.png');
        this.imgl = 52;
        this.imgw = 30;
        this.cost = 1000;
        this.ammoCost = 500;
        this.damageDecreaseConstant = 8;

        this.gunIndex = 1;
        
    }
    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(169,169,169);
                rect(this.xShift, this.yShift, this.gLength, this.gWidth);
                strokeWeight(2);
                line(this.xShift + 6, this.yShift + 6, 23, 10);
                line(this.xShift + 6, this.yShift, 23, -10);
                line(this.xShift + 35, this.yShift + 3, this.xShift + 37, this.yShift + 3);
            pop();
        }
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