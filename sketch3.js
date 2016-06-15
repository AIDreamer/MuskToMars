/**
 * Created by Cam on 5/22/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

var Item = function(itemName, img, price, dPrice) {
    this.itemName = itemName;
    this.img = img;
    this.price = price;
    this.dPrice = dPrice;
};

var Explosives = [
    {name:"Nuclear Fission Bomb", img: "Image var", price: 210000000, dPrice: 0, effect:true, tmp: 7*Math.pow(10,-11), fallout:8, altitude: -0.2 },
    {name:"Boosted Fission Bomb", img: "Image var", price: 260000000, dPrice: 0, effect:true, tmp: 9*Math.pow(10,-11), fallout:10, altitude: -0.4 },
    {name:"Hydrogen Bomb", img: "Image var", price: 400000000, dPrice: 0, effect:true, tmp: 14*Math.pow(10,-10), fallout:0, altitude: -0.8}
];
var Mirrors = [
    {name:"Construct: Space Station - Mirror Manufacturing", img: "Image var", price: 100000000000, dPrice: 0, effect:false, tmp: 0},
    {name:"Construct: Orbital Mirror", img: "Image var", price: 0, dPrice: 80000000000, effect:false, tmp: 0},
    {name:"Select Mirror Target", img: "Image var", price: 0, dPrice: 0, effect:true, tmp: 0}
];
var Meteors = [
    {name:"Construct: Space Station - Meteor Analysis", img: "Image var", price: 100000000000, dPrice: 0, effect:false, tmp: 0},
    {name:"Analyze Meteor", img: "Image var", price: 0, dPrice: 500000000, effect:false, tmp: 0},
    {name:"Send Ammonia Meteor to Mars", img: "Image var", price: 0, dPrice: 500000000, effect:true, tmp: 0}
];
var Pyrolysis = [
    {name:"Pyrolyze: Mars' earth", img: "Image var", price: 0, dPrice: 1000000000, effect:true, tmp: 0}
];
var Lives = [
    {name:"Moss", img: "Image var", price: 0, dPrice: 0, growth:5},
    {name:"Advanced Plants", img: "Image var", price: 0, dPrice: 0, growth:10}
];

var Items = [
    {name: "Explosives", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Orbital Mirror", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Meteor", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Pyrolysis", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Life", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]}
];

for (var i = 0; i< Explosives.length; i++) {
    Items[0].list.push(Explosives[i]);
}
Items[1].list.push(Mirrors[0]);
Items[2].list.push(Meteors[0]);
for (var i = 0; i< Pyrolysis.length; i++){
    Items[3].list.push(Pyrolysis[i]);
}
for (var i = 0; i< Lives.length; i++){
    Items[4].list.push(Lives[i]);
}

var marsStatusBox = {year: 2016, budget: 0, costperyear: 0, population: 0};

var tabSelected = -1; //Current active tab, on startup defaults to -1.

/**
 *  Default state of in-game screen
 */
function menuUI(){
    rectMode(CORNERS);
    fill(255);
    rect(0, 565, 975, 720); //Item box border
    rect(975, 515, 1280, 720); //Status box border
    fill(0);
    rect(5, 570, 975, 720); //Item box
    rect(980, 520, 1280, 720); //Status box

    textAlign(CENTER, CENTER);
    for (var i = 0; i < Items.length; i++) {
        fill(255); rect(20*(i+1) + 120*i - 5, 520, 20*(i+1) + 120*(i+1) + 5, 565);
        fill(0); rect(20*(i+1) + 120*i, 525, 20*(i+1) + 120*(i+1), 565);

        if (i===tabSelected){fill(255).strokeWeight(0).textSize(20);}
        else {fill(200).strokeWeight(0).textSize(18);}
        text(Items[i].name, 20 * (i + 1) + 120 * i + 60, 545);

    }

    if (tabSelected>-1) {
        fill(0);
        rect(20 * (tabSelected + 1) + 120 * tabSelected, 565, 20 * (tabSelected + 1) + 120 * (tabSelected + 1), 570);
    }

    //Status box text
    textAlign(LEFT, TOP);
    fill(255).strokeWeight(0).textSize(24);
    text("Year: " + marsStatusBox.year + "\nTotal Cost: " + marsStatusBox.budget +
        "\nCost per year: " + marsStatusBox.costperyear + "\nPopulation: " + marsStatusBox.population, 1000, 540);

} //menuUI()

/**
 *  Single category (tab) display
 */
function category(){
    if (tabSelected > -1){
        for (var i=0; i<Items[tabSelected].list.length; i++){
            rectMode(CORNERS);
            fill(150); rect(40 + 25*i + 140*i, 585, 50 + 25*i + 140*(i+1), 705); //Item border

            fill(0); rect(45 + 25*i + 140*i, 590, 45 + 25*i + 140*(i+1), 700); //Item

            rectMode(CENTER);
            textAlign(CENTER, CENTER);
            fill(255).strokeWeight(0).textSize(14);
            text(Items[tabSelected].list[i].itemName, 115 + 25*i + 140*i, 645, 120, 100);
        }
    }
}

/**
 *  Information box appears when mouse is hovered over an item, while a tab is active
 */
function infoBox() {
    rectMode(CORNER);
    if (tabSelected>-1){
        for (var i = 0; i < Items[tabSelected].mouseIsOverList.length; i++) {
            if (Items[tabSelected].mouseIsOverList[i]){
                fill(255);rect(mouseX + 5, mouseY -5, 150, -100);
                fill(0);rect(mouseX + 7, mouseY -7, 146, -96);

                textAlign(LEFT, BOTTOM);
                fill(255).strokeWeight(0).textSize(12);
                text("Description: " + "\nEffect: " + "\nCost: " + Items[tabSelected].list[i].price + "\nCost per year: " +
                    Items[tabSelected].list[i].dPrice, mouseX + 20, mouseY - 75);
            }
        }
    }
}

/**
 *  Function determining mouse appearance (mouse/hand)
 */
function mouseProperty(){
    var mouseIsHand;
    for (var i = 0; i < Items.length; i++){
        Items[i].mouseIsOver = (mouseX >= 20 * (i + 1) + 120 * i && mouseX <= 20 * (i + 1) + 120 * (i + 1)
        && mouseY >= 530 && mouseY <= 565);
    }

    if (tabSelected > -1){
        for(var i=0; i<Items[tabSelected].mouseIsOverList.length; i++) {
            Items[tabSelected].mouseIsOverList[i] = (mouseX >= 45 + 25*i + 140*i && mouseX <= 45 + 25*i + 140*(i+1)
            && mouseY >= 590 && mouseY <= 700);
        }
    }

    for (var i = 0; i < Items.length; i++){
        if (!mouseIsHand) {
            mouseIsHand = Items[i].mouseIsOver;
        }
    }

    if (tabSelected > -1) {
        for (var i = 0; i < Items[tabSelected].mouseIsOverList.length; i++) {
            if (!mouseIsHand) {
                mouseIsHand = Items[tabSelected].mouseIsOverList[i];
            }
        }
    }

    if (mouseIsHand) {
        cursor(HAND);
    }
    else {
        cursor(ARROW);
    }

}


/**
 * Functions mousePressed & mouseReleased direct mouse clicks on tab to select tab, on item boxes to respective item functions
 */

function mousePressed(){
    for (var i=0; i<Items.length; i++) {
        Items[i].mousePressedOver = Items[i].mouseIsOver;
    }

    if (tabSelected>-1){
        for (var i=0; i<Items[tabSelected].mouseIsOverList.length; i++){
            Items[tabSelected].mousePressedOverList[i] = Items[tabSelected].mouseIsOverList[i];
        }
    }
}

function mouseReleased() {
    for (var i=0; i<Items.length; i++) {
        if (Items[i].mousePressedOver && Items[i].mouseIsOver){
            if (tabSelected !== i) {tabSelected = i;}
            else {tabSelected = -1;}

        }
    }
    if (tabSelected>-1){
        for (var i=0; i<Items[tabSelected].mouseIsOverList.length; i++){
            if (Items[tabSelected].mousePressedOverList[i] && Items[tabSelected].mouseIsOverList[i]) {
                switch (tabSelected) {
                    case 0: {
                        console.log("Select target");
                        fExplosive(i, target);
                        break;
                    }
                    case 1: {
                        if (i===0) fMirror0();
                        if (i===1) fMirror1();
                        if (i===2) {
                            console.log("Select target");
                            fMirror2(target);
                        }
                        break;
                    }
                    case 2: {
                        if (i === 0) fMeteor0();
                        if (i === 1) fMeteor1();
                        if (i === 2) {
                            console.log("Select target");
                            fMeteor2(target);
                        }
                        break;
                    }
                    case 3: {
                        console.log("Select target");
                        fPyrolysis(target);
                        break;
                    }
                    case 4: {
                        console.log("Select target");
                        fLife(i, target);
                        break;
                    }
                }
            }
        }
    }
}

function setup() {
    createCanvas(1280, 720);
    noStroke();

    for (var i=0; i<Items.length; i++) {
        for (var j = 0; j < Items[i].list.length; j++) {
            Items[i].mouseIsOverList.push(false);
            Items[i].mousePressedOverList.push(false);
        }
    }
}

function draw(){
    background(40);
    menuUI();
    category();
    mouseProperty();
    infoBox();
}