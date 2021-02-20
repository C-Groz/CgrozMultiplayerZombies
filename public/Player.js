class Player {
  constructor(player) {
    this.x = player.x;
    this.y = player.y;
    this.id = player.id;
    this.rgb = player.rgb;
  }


  draw() {
    stroke(this.rgb.r, this.rgb.g, this.rgb.b);
    fill(this.rgb.r, this.rgb.g, this.rgb.b);
    circle(this.x, this.y, 50);
  }

}