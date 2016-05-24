/**
 * Created by Cam on 5/22/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

var items = [
    {name: "Explosives", list: ["Nuclear fission bomb", "Boosted fission bomb", "Hydrogen bomb",], mouseIsOver:false},
    {name: "Orbital Mirror", list: ["Construct: Space Station - Mirror Manufacturing"], mouseIsOver:false},
    {name: "Meteor", list: ["Construct: Space Station - Meteor Analysis"], mouseIsOver:false},
    {name: "Pyrolysis", list: ["Pyrolyze: Mars' earth"], mouseIsOver:false},
    {name: "Life", list: ["Moss"], mouseIsOver:false}
];

function itemMenuUI(){
    var mouseIsOverSomething;
    rectMode(CORNERS);
    fill(255); rect(0, 565, 1280, 720);
    fill(0); rect(0, 570, 1280, 720);

    for (var i=0; i<items.length; i++){
        fill(255); rect(20*(i+1) + 120*i - 5, 520, 20*(i+1) + 120*(i+1) + 5, 565);
        fill(0); rect(20*(i+1) + 120*i, 525, 20*(i+1) + 120*(i+1), 565);

        textAlign(CENTER, CENTER);
        fill(255).strokeWeight(0).textSize(18);
        text(items[i].name, 20*(i+1) + 120*i + 60, 545);

        items[i].mouseIsOver = (mouseX >= 20*(i+1) + 120*i && mouseX <= 20*(i+1) + 120*(i+1)
                                && mouseY >= 530 && mouseY <= 565);

        if (!mouseIsOverSomething) {mouseIsOverSomething = items[i].mouseIsOver}
    }

    if (mouseIsOverSomething) {cursor(HAND);}
    else {cursor(ARROW);}
}

function setup() {
    createCanvas(1280, 720);
    noStroke();
}

function draw(){
    background(40);
    itemMenuUI()
}