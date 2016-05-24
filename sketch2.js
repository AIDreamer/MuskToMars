/**
 * Created by Cam on 5/22/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

// 1280x720 resolution
// Black theme
// Could implement red-orange-ish theme too

var mouseIsOverNewGame;
var mouseIsOverMultiverse;
var mouseIsOverOption;

var mousePressedOverNewGame;
var mousePressedOverMultiverse;
var mousePressedOverOption;

function mainmenu(pressedButton){
    rectMode(RADIUS);
    fill(255);
    var newgame_border;
    var multiverse_border;
    var option_border;

    switch(pressedButton) {
        case 1:
        {
            fill(150);
            newgame_border = rect(640, 300, 165, 35);
            fill(255);
            multiverse_border = rect(640, 420, 165, 35);
            option_border = rect(640, 540, 165, 35);
            break;
        }
        case 2:
        {
            fill(255);
            newgame_border = rect(640, 300, 165, 35);
            fill(150);
            multiverse_border = rect(640, 420, 165, 35);
            fill(255)
            option_border = rect(640, 540, 165, 35);
            break;
        }
        case 3:
        {
            fill(255);
            newgame_border = rect(640, 300, 165, 35);
            multiverse_border = rect(640, 420, 165, 35);
            fill(150);
            option_border = rect(640, 540, 165, 35);
            break;
        }
        default:
        {
            fill(255);
            newgame_border = rect(640, 300, 165, 35);
            multiverse_border = rect(640, 420, 165, 35);
            option_border = rect(640, 540, 165, 35);
        }
    }

    fill(0);
    var newgame = rect(640, 300, 160, 30);
    var multiverse = rect(640, 420, 160, 30);
    var option = rect(640, 540, 160, 30);

    textAlign(CENTER, CENTER);
    fill(255).strokeWeight(0).textSize(30);
    text("New Game", 640, 300);
    text("Multiverse", 640, 420);
    text("Option", 640, 540);

    mouseIsOverNewGame = (mouseX >= 480 && mouseX <= 800 && mouseY >= 270 && mouseY <= 330);
    mouseIsOverMultiverse = (mouseX >= 480 && mouseX <= 800 && mouseY >= 390 && mouseY <= 450);
    mouseIsOverOption = (mouseX >= 480 && mouseX <= 800 && mouseY >= 510 && mouseY <= 570);

    if (mouseIsOverNewGame || mouseIsOverMultiverse || mouseIsOverOption) {cursor(HAND);}
    else {cursor(ARROW);}
}

function mousePressed(){
    mousePressedOverNewGame = mouseIsOverNewGame;
    mousePressedOverMultiverse = mouseIsOverMultiverse;
    mousePressedOverOption = mouseIsOverOption;
}

function mouseReleased(){
    if (mousePressedOverNewGame && mouseIsOverNewGame){
        console.log("New Game!");
    }
    mousePressedOverNewGame = false;

    if (mousePressedOverMultiverse && mouseIsOverMultiverse) {
        console.log("Multiverse!");
    }
    mousePressedOverMultiverse = false;

    if (mousePressedOverOption && mouseIsOverOption) {
        console.log("Option!");
    }
    mousePressedOverOption = false;
}

function setup() {
    createCanvas(1280, 720);
    noStroke();
}

function draw(){
    background(40);
    if (mousePressedOverNewGame){
        mainmenu(1);
    }
    else if (mousePressedOverMultiverse){
        mainmenu(2);
    }
    else if (mousePressedOverOption){
        mainmenu(3);
    }
    else{
        mainmenu(0);
    }
}