/**
 * Created by Cam on 5/22/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

var items = [
    {name: "Explosives", list: ["Nuclear fission bomb", "Boosted fission bomb", "Hydrogen bomb"], mouseIsOver:false, mousePressedOver:false},
    {name: "Orbital Mirror", list: ["Construct: Space Station - Mirror Manufacturing"], mouseIsOver:false, mousePressedOver:false},
    {name: "Meteor", list: ["Construct: Space Station - Meteor Analysis"], mouseIsOver:false, mousePressedOver:false},
    {name: "Pyrolysis", list: ["Pyrolyze: Mars' earth"], mouseIsOver:false, mousePressedOver:false},
    {name: "Life", list: ["Moss"], mouseIsOver:false, mousePressedOver:false}
];

var marsStatusUI = {year: 2016, budget: 0, costperyear: 0, population: 0};

var tabSelected = -1;

/**
 *  Default state of in-game screen
 */
function menuUI(){
    var mouseIsOverSomething = false;

    rectMode(CORNERS);
    fill(255);
    rect(0, 565, 975, 720); //Item box
    rect(975, 515, 1280, 720); //Status box border
    fill(0);
    rect(0, 570, 975, 720); //Item box
    rect(980, 520, 1280, 720); //Status box

    for (var i = 0; i < items.length; i++) {
        fill(255); rect(20*(i+1) + 120*i - 5, 520, 20*(i+1) + 120*(i+1) + 5, 565);
        fill(0); rect(20*(i+1) + 120*i, 525, 20*(i+1) + 120*(i+1), 565);

        textAlign(CENTER, CENTER);
        if (i===tabSelected){fill(255).strokeWeight(0).textSize(20);}
        else {fill(255).strokeWeight(0).textSize(18);}

        text(items[i].name, 20 * (i + 1) + 120 * i + 60, 545);

        items[i].mouseIsOver = (mouseX >= 20 * (i + 1) + 120 * i && mouseX <= 20 * (i + 1) + 120 * (i + 1)
                                && mouseY >= 530 && mouseY <= 565);

        if (!mouseIsOverSomething) {
            mouseIsOverSomething = items[i].mouseIsOver;
        }
    }

    fill(0); rect(20 * (tabSelected + 1) + 120 * tabSelected, 565, 20 * (tabSelected + 1) + 120 * (tabSelected + 1), 570);

    if (mouseIsOverSomething) {
        cursor(HAND);
    }
    else {
        cursor(ARROW);
    }

} //menuUI()

/**
 *  Category display
 */
function category(){
    if (tabSelected > -1){
        for (var i=0; i<items[tabSelected].list[i]; i++){
            fill(255); rect(15*(i+1) + 120*i - 5, 520, 15*(i+1) + 120*(i+1) + 5, 565);
            fill(0); rect(15*(i+1) + 120*i, 525, 15*(i+1) + 120*(i+1), 565);

        }
    }
}

function mousePressed(){
    for (var i=0; i<items.length; i++) {
        items[i].mousePressedOver = items[i].mouseIsOver;
    }
}

function mouseReleased() {
    for (var i=0; i<items.length; i++) {
        if (items[i].mousePressedOver && items[i].mouseIsOver){
            tabSelected = i;
        }
    }
}

function setup() {
    createCanvas(1280, 720);
    noStroke();
}

function draw(){
    background(40);
    menuUI();
}