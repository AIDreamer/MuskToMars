/**
 * Created by Cam on 5/29/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

//Check altitude commands in final version

//This stuff is from sketch3
var Item = function(itemName, img, price, dPrice) {
    this.itemName = itemName;
    this.img = img;
    this.price = price;
    this.dPrice = dPrice;
}

var explosive0 = new Item("Nuclear Fission Bomb", "Image var", 210000000, 0);
var explosive1 = new Item("Boosted Fission Bomb", "Image var", 260000000, 0);
var explosive2 = new Item("Hydrogen Bomb", "Image var", 400000000, 0);
var mirror0 = new Item("Construct: Space Station - Mirror Manufacturing", "Image var", 100000000000, 0); //100B
var mirror1 = new Item("Fund Construction of Orbital Mirror", "Image var", 0, 80000000000); //80B
var meteor0 = new Item("Construct: Space Station - Meteor Analysis", "Image var", 100000000000, 0); //100B
var meteor1 = new Item("Analyze Meteor", "Image var", 0, 500000000); //500M
var meteor2 = new Item("Deliver Ammonia Meteor to Mars", 800000000, 0); //800M
var pyrolysis0 = new Item("Pyrolyze: Mars' earth", "Image var", 0, 500000000); //500M
var life0 = new Item("Moss", "Image Var", 0, 0);
var life1 = new Item("Advanced plants", "Image var", 0, 0);

var items = [
    {name: "Explosives", list: [explosive0, explosive1, explosive2], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Orbital Mirror", list: [mirror0], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Meteor", list: [meteor0], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Pyrolysis", list: [pyrolysis0], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Life", list: [life0, life1], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]}
];


//Vars necessary for tiles functions begin here
var budget = 0;
var dBudget = 0;
var meanTemp = 216.5;

var mirrorStationBuilding = false;
var mirrorStationProgress = -1;
var mirrorStationCompleted = false;
var mirrorBuilding = false;
var mirrorRadius = 0;

var meteorStationBuilding = false;
var meteorStationProgress = -1;
var meteorStationCompleted = false;
var analyzingMeteor = false;
var meteorAnalysisProgress = 0;

var turn = 0;

var tile0 = {water: false, altitude:100, earthDensity:0, temperature:meanTemp, atmP:0, oxygenP:0, fallout:0, neighbors:[]};
var tile1 = {water: false, altitude:100, earthDensity:0, temperature:meanTemp, atmP:0, oxygenP:0, fallout:0, neighbors:[]};
var tile2 = {water: false, altitude:100, earthDensity:0, temperature:meanTemp, atmP:0, oxygenP:0, fallout:0, neighbors:[]};
var tile3 = {water: false, altitude:100, earthDensity:0, temperature:meanTemp, atmP:0, oxygenP:0, fallout:0, neighbors:[]};
tile0.neighbors.push(tile1, tile2);
tile1.neighbors.push(tile0, tile2, tile3);
tile2.neighbors.push(tile0, tile1, tile3);
tile3.neighbors.push(tile1, tile2);
Tiles.push(tile0, tile1, tile2, tile3);




function perpetualChange(){
    budget += dBudget;

    //Control starting and halting of mirror S.S./mirror construction
    if (mirrorStationBuilding && mirrorStationProgress>-1 && mirrorStationProgress<240) {mirrorStationProgress++;}
    if (mirrorStationProgress===240){
        mirrorStationCompleted = true;
    }
    if (mirrorBuilding){
        if (mirrorRadius===0) {
            mirrorRadius += Math.sqrt(35/Math.PI);
            tile0.temperature += 0.025 * Math.sqrt(35/Math.PI);
        }
        if (mirrorRadius+5.3/mirrorRadius <= 800) {
            tile0.temperature += 0.025 * 5.3/mirrorRadius;
            mirrorRadius += 5.3/mirrorRadius;
        }
        if (mirrorRadius+5.3/mirrorRadius > 800) {
            tile0.temperature += 0.025 * (800-mirrorRadius);
            mirrorRadius = 800;
        }
    }

    //Control starting and halting of meteor S.S. construction & meteor delivery
    if (meteorStationBuilding && meteorStationBuilding>-1 && meteorStationBuilding<240) {meteorStationBuilding++;}
    if (meteorStationBuilding===240){
        meteorStationCompleted = true;
    }
    if (analyzingMeteor){
        meteorAnalysisProgress++;
        if (meteorAnalysisProgress===60){
            analyzingMeteor = false;
            meteorAnalysisProgress = 0;
            items[2].list.push(meteor2);
        }
    }

    //Nuclear fallout
    for (var i=0; i<Tiles.length; i++){
        if (Tiles[i].fallout>0) {Tiles[i].fallout--;}

        for (var j=0; j<Tiles[i].neighbors.length; j++){
            if (Tiles[i].temperature < Tiles[i].neighbors[j].temperature){
                Tiles[i].temperature += (Math.max(Tiles[i].temperature, Tiles[i].neighbors[j].temperature) - Math.min(Tiles[i].temperature, Tiles[i].neighbors[j].temperature))/4;
            }
            if (Tiles[i].temperature > Tiles[i].neighbors[j].temperature){
                Tiles[i].neighbors[j].temperature += (Math.max(Tiles[i].temperature, Tiles[i].neighbors[j].temperature) - Math.min(Tiles[i].temperature, Tiles[i].neighbors[j].temperature))/4;
            }
        }
    }
}

function fExplosive0(explosiveTileTarget){

    budget += explosive0.price;
    dBudget += explosive0.dPrice;

    Tiles[explosiveTileTarget].temperature += 7; //*pow(10,-11);
    Tiles[explosiveTileTarget].fallout += 10;
    for (var i=0; i<Tiles[explosiveTileTarget].neighbors.length; i++){
        Tiles[explosiveTileTarget].neighbors[i].fallout += 8;
    }
    Tiles[explosiveTileTarget]. altitude -= 2;
}

function fExplosive1(explosiveTileTarget){
    budget += explosive1.price;
    dBudget += explosive1.dPrice;

    Tiles[explosiveTileTarget].temperature += 9; //*pow(10,-11);
    Tiles[explosiveTileTarget].fallout += 12;
    for (var i=0; i<Tiles[explosiveTileTarget].neighbors.length; i++){
        Tiles[explosiveTileTarget].neighbors[i].fallout += 10;
    }
    Tiles[explosiveTileTarget]. altitude -= 3;
}

function fExplosive2(explosiveTileTarget){
    budget += explosive2.price;
    dBudget += explosive2.dPrice;

    Tiles[explosiveTileTarget].temperature += 14; //*pow(10,-10);
    Tiles[explosiveTileTarget]. altitude -= 5;
}

function fMirror0(){
    budget += mirror0.price;

    if (mirrorStationBuilding === false){
        dBudget += mirror0.dPrice;
        mirrorStationBuilding = true;
        if (mirrorStationProgress === -1){
            mirrorStationProgress = 0;
        }
    }
    else{
        dBudget -= mirror0.dPrice;
        mirrorStationBuilding = false;
    }

    if (mirrorStationCompleted){
        items[1].list.push(mirror1);
    }
}

function fMirror1(){
    budget += mirror1.price;

    if (!mirrorBuilding){
        mirrorBuilding = true;
        dBudget += mirror1.dPrice;
    }
    else{
        mirrorBuilding = false;
        dBudget -= mirror1.dPrice;
    }
}

function fMeteor0(){
    budget += meteor0.price; //just 0, put it here in case we change the price later

    if (meteorStationBuilding === false){
        dBudget += meteor0.dPrice;
        meteorStationBuilding = true;
        if (meteorStationProgress === -1){
            meteorStationProgress = 0;
        }
    }
    else{
        dBudget -= meteor0.dPrice;
        meteorStationBuilding = false;
    }

    if (meteorStationCompleted){
        items[2].list.push(meteor1);
    }
}

function fMeteor1(){
    budget += meteor1.price; //just 0, put it here in case we change the price later

    if (!analyzingMeteor){
        analyzingMeteor = true;
        dBudget += mirror1.dPrice;
    }
    else{
        analyzingMeteor = false;
        dBudget -= mirror1.dPrice;
    }
}

function fMeteor2(meteorTileTarget){
    budget += meteor2.price;
    dBudget += meteor2.dPrice;

    Tiles[meteorTileTarget].temperature += 10;
    
    var index = items[2].list.indexOf(meteor2);
    if (index >-1) {items[2].list.splice(index,1);}
}


/**
 * Test functions
 */

function mouseClicked(){
    perpetualChange();
    if (mouseOverExplosive0){explosive0(0);}
    if (mouseOverExplosive1){explosive1(0);}
    if (mouseOverExplosive2){explosive2(0);}

    for (var i=0; i<Tiles.length; i++){
        console.log("Tile: " + i + "\nTemp: " + Tiles[i].temperature.toFixed(2) + "\nAltitude: " + Tiles[i].altitude + "\nFallout: " + Tiles[i].fallout);
    }
}

function setup() {
    createCanvas(1280, 720);
    noStroke();
}

function draw(){
    fill(0);
    rect(0,0,100,100);
    fill(40);
    rect(100,0,100,100);
    fill(80);
    rect(200,0,100,100);
    mouseOverExplosive0 = (mouseX>=0 && mouseX<=100 && mouseY>=0 && mouseY <=100);
    mouseOverExplosive1 = (mouseX>=100 && mouseX<=200 && mouseY>=0 && mouseY <=100);
    mouseOverExplosive2 = (mouseX>=200 && mouseX<=400 && mouseY>=0 && mouseY <=100);
}