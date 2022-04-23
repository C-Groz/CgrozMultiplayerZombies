class Deagle extends Pistol{

    constructor(xPos, yPos){
        super();

        //gun length/width
        this.gLength = 28;
        this.gWidth = 8;
        this.xShift = 25;
        this.yShift = -4;
        this.bulletDisplacement = 48;

        this.startingIn = 7; //mag size/starting ammo
        this.startingOut = 49;
        this.reloadTime = 800;
        this.damage = 50;
        this.bulletVelocity = 20;
        this.name = "Deagle";
        this.textSize = 40;
        this.yDisplacement = 37.5;
        this.bulletCooldown = 400;
        this.lastShot = 0;
        this.img = loadImage('images/deagle.png');
        this.imgl = 50;
        this.imgw = 30;
        this.cost = 1500;
        this.ammoCost = 500;
        this.damageDecreaseConstant = 7;

        this.gunIndex = 2;
    }
    drawGun(xPos,yPos) {
        
        rect(this.xShift, this.yShift, this.gLength, this.gWidth);
        strokeWeight(2);
        line(this.xShift + 6, this.yShift + 8, 23, 10);
        line(this.xShift + 6, this.yShift, 23, -10);
    }
    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(100,100,100);
                rect(this.xShift, this.yShift, this.gLength, this.gWidth);
                strokeWeight(2);
                line(this.xShift + 6, this.yShift + 8, 23, 10);
                line(this.xShift + 6, this.yShift, 23, -10);
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