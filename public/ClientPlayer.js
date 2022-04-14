class ClientPlayer{
    //client side player class
    
        constructor(){
            this.x = windowWidth/2;
            this.y = windowHeight/2;
            this.radius = 50;
            this.angle = 0;
            this.number = 69;
            this.index;
            this.gunIndex = 0;
    
            this.topY = this.y - 28;
            this.leftX = this.x - 28;
            this.rightX = this.x + 28;
            this.bottomY = this.y + 28;
    
            this.lastEnemyHit = 0;
        }
    
        //draws green circle in middle of screen
        drawPlayer(){
            fill(0, 150, 0);
            circle(this.x, this.y, 50);
        }
    
        determineAngle(){
            //quad 1
            if(mouseX >= this.x && mouseY < this.y){
                this.angle = -1 *atan((this.y - mouseY)/(mouseX - this.x));
            }
    
            //quad 2
            if(mouseX > this.x && mouseY >= this.y){
                this.angle = atan((mouseY - this.y)/(mouseX - this.x));
            }
    
            //quad 3
            if(mouseX <= this.x && mouseY > this.y){
                this.angle = 3.14159 + atan((this.y - mouseY)/(abs(this.x - mouseX )));
            }
    
            //quad 4
            if(mouseX < this.x && mouseY <= this.y){
                this.angle = 3.14159 + atan((this.y - mouseY )/(abs(this.x-mouseX)));
            }
    
        }
    
        enemyContact(enemyX, enemyY){
            var distance = 0;
            distance = sqrt(pow(enemyX - this.x + clientMap.x, 2) + pow(enemyY - this.y + clientMap.y, 2));
            if(distance <= 50){
                return true;
            }
            return false;
        }
    
        enemyHit(damage){
            if(this.lastEnemyHit + 10 < millis()){
                score.playerHealth -= damage;
                this.lastEnemyHit = millis();
            }
            
        }
    
        
    
    }