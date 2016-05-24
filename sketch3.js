/**
 * Created by Cam on 5/22/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

var items = [
    {name: "Explosives", list: ["Nuclear fission bomb", "Boosted fission bomb", "Hydrogen bomb"], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[]},
    {name: "Orbital Mirror", list: ["Construct: Space Station - Mirror Manufacturing"], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[]},
    {name: "Meteor", list: ["Construct: Space Station - Meteor Analysis"], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[]},
    {name: "Pyrolysis", list: ["Pyrolyze: Mars' earth"], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[]},
    {name: "Life", list: ["Moss"], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[]}
];

var marsStatusUI = {year: 2016, budget: 0, costperyear: 0, population: 0};

var tabSelected = -1;

/**
 *  Default state of in-game screen
 */
function menuUI(){
    var mouseIsOverSomething = false;
    textAlign(CENTER, CENTER);

    rectMode(CORNERS);
    fill(255);
    rect(0, 565, 975, 720); //Item box border
    rect(975, 515, 1280, 720); //Status box border
    fill(0);
    rect(5, 570, 975, 720); //Item box
    rect(980, 520, 1280, 720); //Status box

    for (var i = 0; i < items.length; i++) {
        fill(255); rect(20*(i+1) + 120*i - 5, 520, 20*(i+1) + 120*(i+1) + 5, 565);
        fill(0); rect(20*(i+1) + 120*i, 525, 20*(i+1) + 120*(i+1), 565);

        if (i===tabSelected){fill(255).strokeWeight(0).textSize(20);}
        else {fill(255).strokeWeight(0).textSize(18);}
        text(items[i].name, 20 * (i + 1) + 120 * i + 60, 545);

    }

    if (tabSelected>-1) {
        fill(0);
        rect(20 * (tabSelected + 1) + 120 * tabSelected, 565, 20 * (tabSelected + 1) + 120 * (tabSelected + 1), 570);
    }
    
} //menuUI()

/**
 *  Category display
 */
function category(){
    if (tabSelected > -1){
        for (var i=0; i<items[tabSelected].list.length; i++){
            rectMode(CORNERS);
            fill(150); rect(40 + 25*i + 140*i, 585, 50 + 25*i + 140*(i+1), 705); //Item border
            fill(0); rect(45 + 25*i + 140*i, 590, 45 + 25*i + 140*(i+1), 700); //Item

            rectMode(CENTER);
            fill(255).strokeWeight(0).textSize(14);
            text(items[tabSelected].list[i], 115 + 25*i + 140*i, 645, 120, 100);
        }
    }
}

/**
 *  Function governing mouse properties
 */
function mouseProperty(){
    var mouseIsOverSomething;
    for (var i = 0; i < items.length; i++){
        items[i].mouseIsOver = (mouseX >= 20 * (i + 1) + 120 * i && mouseX <= 20 * (i + 1) + 120 * (i + 1)
        && mouseY >= 530 && mouseY <= 565);
    }

    if (tabSelected > -1){
        for(var i=0; i<items[tabSelected].mouseIsOverList.length; i++) {
            items[tabSelected].mouseIsOverList[i] = (mouseX >= 15 + 30 * i + 140 * i && mouseX <= 15 + 30 * i + 140 * (i + 1)
            && mouseY >= 590 && mouseY <= 700);
        }
    }

    for (var i = 0; i < items.length; i++){
        if (!mouseIsOverSomething) {
            mouseIsOverSomething = items[i].mouseIsOver;
        }
    }

    if (tabSelected > -1) {
        for (var i = 0; i < items[tabSelected].mouseIsOverList.length; i++) {
            if (!mouseIsOverSomething) {
                mouseIsOverSomething = items[tabSelected].mouseIsOverList[i];
            }
        }
    }

    if (mouseIsOverSomething) {
        cursor(HAND);
    }
    else {
        cursor(ARROW);
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

    for (var i=0; i<items.length; i++) {
        for (var j = 0; j < items[i].list.length; j++) {
            items[i].mouseIsOverList.push(false);
        }
    }
}

function draw(){
    background(40);
    menuUI();
    category();
    mouseProperty();
}