class Barrett extends Sniper{
    constructor(xPos, yPos){
        super();
        this.name = "Barrett 50 Cal";
        this.img = loadImage('images/barrett.png');
        this.cost = 2000;
        this.ammoCost = 1000;
        this.imgl = 100;
        this.imgw = 40;
        this.damageDecreaseConstant = 5;
    }
}