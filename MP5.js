class MP5 extends SMG{
    constructor(xPos, yPos){
        super();
        this.name = "MP5";
        this.img = loadImage('images/mp5.png');
        this.imgl = 65;
        this.imgw = 30;
        this.ammoCost = 500;
        this.cost = 1500;
        this.damageDecreaseConstant = 10;

        this.gunIndex = 6;
    }
    drawGun(xPos, yPos, angle) {
        if(xPos != null){
            push();
                translate(xPos, yPos);
                rotate(angle);
                fill(0,0,0);
                rect(this.xShift, this.yShift + 2, this.gLength, this.gWidth);
                fill(200, 40, 0);
                rect(this.xShift + 29, this.yShift + 2.5, 6, 3);
                strokeWeight(2);
                line(this.xShift + 10, this.yShift + 6, 30, 8); //right arm
                line(this.xShift + 5, this.yShift + 12, 21.5, 12); //right arm
                line(this.xShift + 20, this.yShift + 2, 37, -10); //left arm
                line(this.xShift + 13, this.yShift - 6, 20, -16); //left arm
            pop();
        }
    }
}