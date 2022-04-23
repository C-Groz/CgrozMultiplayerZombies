class Famas extends AutoRifle{
    constructor(xPos, yPos){
        super();
        this.gLength = 40;
        this.gWidth = 4;
        this.damage = 35;
        this.bulletVelocity = 22;
        this.timeBetweenBullets = 80;
        this.bulletDisplacement = 75;
        this.name = "Famas";
        this.img = loadImage('images/FAMASG2.png');
        this.cost = 2000;
        this.ammoCost = 500;
        this.imgl = 80;
        this.imgw = 30;
        this.damageDecreaseConstant = 5;

        this.gunIndex = 5;
    }
    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(69,69,69);
                rect(this.xShift, this.yShift + 2, this.gLength, this.gWidth);
                fill(0,0,0);
                rect(this.xShift + 40, this.yShift + 3, 10, 2);
                strokeWeight(2);
                line(this.xShift + 10, this.yShift + 6, 30, 8); //right arm
                line(this.xShift + 5, this.yShift + 12, 21.5, 12); //right arm
                line(this.xShift + 20, this.yShift + 1, 37, -10); //left arm
                line(this.xShift + 13, this.yShift - 5.5, 20, -16); //left arm
            pop();
        }
    }
}