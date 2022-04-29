class Hands {
    constructor(xPos, yPos){
        this.x = xPos;
        this.y = yPos;

        //ammo
        this.startingIn = 0; //mag size/starting ammo
        this.startingOut = 0;
        
        //reloading
        this.reloadTime = 1; //milliseconds
        this.tempTimeEnd = 0;
        this.tempInitIn = 0;

        //gun stats
        this.damage = 0;
        this.bulletVelocity = 0;
        this.timeBetweenBullets = 0;
        this.name = "Unarmed";
        this.textSize = 45;
        this.yDisplacement = 40;
        this.damageDecreaseConstant = 0;

        this.canShoot = false;
        this.lastBulletFired = 0;
    }

    drawGun(xPos,yPos) {
        circle(xPos + 21, yPos + 13, 5);
        circle(xPos + 21, yPos - 13, 5);
    }
    shoot(){

    }
}