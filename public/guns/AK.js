class AK extends AutoRifle {
    constructor(xPos, yPos) {
        super();
        this.gLength = 50;
        this.damage = 55;
        this.bulletVelocity = 15;
        this.timeBetweenBullets = 130;
        this.bulletDisplacement = 80;
        this.name = "AK-47";
        this.img = loadImage('images/ak1.png');
        this.cost = 2000;
        this.ammoCost = 500;
        this.imgl = 80;
        this.imgw = 30;
        this.damageDecreaseConstant = 10;

        this.gunIndex = 3;
    }

    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(139,69,19);
                rect(this.xShift, this.yShift, this.gLength, this.gWidth);
                fill(0,0,0);
                rect(this.xShift + 7, this.yShift + 1, 10, 4);
                rect(this.xShift + 48, this.yShift + 1, 8, 4);
                strokeWeight(2);
                line(this.xShift + 10, this.yShift + 6, 30, 8); //right arm
                line(this.xShift + 5, this.yShift + 12, 21.5, 12); //right arm
                line(this.xShift + 20, this.yShift, 37, -10); //left arm
                line(this.xShift + 13, this.yShift - 6, 20, -16); //left arm
            pop();
        }
    }
}