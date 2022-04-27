class M4 extends AutoRifle {
    constructor(xPos, yPos) {
        super();
        this.gLength = 40;
        this.gWidth = 4;
        this.damage = 45;
        this.bulletVelocity = 16;
        this.timeBetweenBullets = 115;
        this.bulletDisplacement = 75;
        this.name = "M4";
        this.img = loadImage('images/m41.png');
        this.cost = 2000;
        this.ammoCost = 500;
        this.imgl = 80;
        this.imgw = 30;
        this.damageDecreaseConstant = 10;

        this.gunIndex = 4;
    }

    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(0,0,0);
                rect(this.xShift, this.yShift + 2, this.gLength, this.gWidth);
                rect(this.xShift + 20, this.yShift + 1, 10, 6);
                rect(this.xShift + 40, this.yShift + 3, 10, 2);
                strokeWeight(2);
                line(this.xShift + 10, this.yShift + 6, 30, 8); //right arm
                line(this.xShift + 5, this.yShift + 12, 21.5, 12); //right arm
                line(this.xShift + 20, this.yShift, 37, -10); //left arm
                line(this.xShift + 13, this.yShift - 6, 20, -16); //left arm
            pop();
        }
    }


}