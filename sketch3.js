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
}

var explosive1 = new Item("Nuclear Fission Bomb", "Image var", 210000000, 0);
var explosive2 = new Item("Boosted Fission Bomb", "Image var", 260000000, 0);
var explosive3 = new Item("Hydrogen Bomb", "Image var", 400000000, 0);
var mirror1 = new Item("Construct: Space Station - Mirror Manufacturing", "Image var", 100000000000, 0); //100B
var mirror2 = new Item("Orbital Mirror", "Image var", 0, 80000000000); //80B
var meteor1 = new Item("Construct: Space Station - Meteor Analysis", "Image var", 100000000000, 0); //100B
var meteor2 = new Item("Send Meteor back to Mars", "Image var", 0, 500000000); //500M
var pyrolysis = new Item("Pyrolyze: Mars' earth", "Image var", 0, 500000000); //500M
var life1 = new Item("Moss", "Image Var", 0, 0);
var life2 = new Item("Advanced plants", "Image var", 0, 0);

var items = [
    {name: "Explosives", list: [explosive1, explosive2, explosive3], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Orbital Mirror", list: [mirror1], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Meteor", list: [meteor1], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Pyrolysis", list: [pyrolysis], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Life", list: [life1, life2], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]}
];
// Item bar => tab.name => list[i]

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
    for (var i = 0; i < items.length; i++) {
        fill(255); rect(20*(i+1) + 120*i - 5, 520, 20*(i+1) + 120*(i+1) + 5, 565);
        fill(0); rect(20*(i+1) + 120*i, 525, 20*(i+1) + 120*(i+1), 565);

        if (i===tabSelected){fill(255).strokeWeight(0).textSize(20);}
        else {fill(200).strokeWeight(0).textSize(18);}
        text(items[i].name, 20 * (i + 1) + 120 * i + 60, 545);

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
        for (var i=0; i<items[tabSelected].list.length; i++){
            rectMode(CORNERS);
            fill(150); rect(40 + 25*i + 140*i, 585, 50 + 25*i + 140*(i+1), 705); //Item border

            fill(0); rect(45 + 25*i + 140*i, 590, 45 + 25*i + 140*(i+1), 700); //Item

            rectMode(CENTER);
            textAlign(CENTER, CENTER);
            fill(255).strokeWeight(0).textSize(14);
            text(items[tabSelected].list[i].itemName, 115 + 25*i + 140*i, 645, 120, 100);
        }
    }
}

/**
 *  Information box appears when hovering mouse over an item when a tab is active
 */
function infoBox() {
    rectMode(CORNER);
    if (tabSelected>-1){
        for (var i = 0; i < items[tabSelected].mouseIsOverList.length; i++) {
            if (items[tabSelected].mouseIsOverList[i]){
                fill(255);rect(mouseX + 5, mouseY -5, 150, -100);
                fill(0);rect(mouseX + 7, mouseY -7, 146, -96);

                textAlign(LEFT, BOTTOM);
                fill(255).strokeWeight(0).textSize(12);
                text("Description: " + "\nEffect: " + "\nCost: " + items[tabSelected].list[i].price + "\nCost per year: " +
                    items[tabSelected].list[i].dPrice, mouseX + 20, mouseY - 75);
            }
        }
    }
}

/**
 *  Function governing mouse properties
 */
function mouseProperty(){
    var mouseIsHand;
    for (var i = 0; i < items.length; i++){
        items[i].mouseIsOver = (mouseX >= 20 * (i + 1) + 120 * i && mouseX <= 20 * (i + 1) + 120 * (i + 1)
        && mouseY >= 530 && mouseY <= 565);
    }

    if (tabSelected > -1){
        for(var i=0; i<items[tabSelected].mouseIsOverList.length; i++) {
            items[tabSelected].mouseIsOverList[i] = (mouseX >= 45 + 25*i + 140*i && mouseX <= 45 + 25*i + 140*(i+1)
            && mouseY >= 590 && mouseY <= 700);
        }
    }

    for (var i = 0; i < items.length; i++){
        if (!mouseIsHand) {
            mouseIsHand = items[i].mouseIsOver;
        }
    }

    if (tabSelected > -1) {
        for (var i = 0; i < items[tabSelected].mouseIsOverList.length; i++) {
            if (!mouseIsHand) {
                mouseIsHand = items[tabSelected].mouseIsOverList[i];
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

function mousePressed(){
    for (var i=0; i<items.length; i++) {
        items[i].mousePressedOver = items[i].mouseIsOver;
    }

    if (tabSelected>-1){
        for (var i=0; i<items[tabSelected].mouseIsOverList.length; i++){
            items[tabSelected].mousePressedOverList[i] = items[tabSelected].mouseIsOverList[i];
        }
    }
}

function mouseReleased() {
    for (var i=0; i<items.length; i++) {
        if (items[i].mousePressedOver && items[i].mouseIsOver){
            if (tabSelected !== i) {tabSelected = i;}
            else {tabSelected = -1;}

        }
    }
    if (tabSelected>-1){
        for (var i=0; i<items[tabSelected].mouseIsOverList.length; i++){
            if (items[tabSelected].mousePressedOverList[i] && items[tabSelected].mouseIsOverList[i]){
                console.log(items[tabSelected].list[i]);
            }
        }
    }
}

function setup() {
    createCanvas(1280, 720);
    noStroke();

    for (var i=0; i<items.length; i++) {
        for (var j = 0; j < items[i].list.length; j++) {
            items[i].mouseIsOverList.push(false);
            items[i].mousePressedOverList.push(false);
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