/**
 * Created by Cam on 5/29/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

//Check altitude commands in final version

/**
 * Items vars & lists
 */
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

/**
 * Vars necessary for tiles functions
 */
var budget = 0;
var dBudget = 0;

var mirrorSSBuilding = false;
var mirrorSSProgress = -1;
var mirrorSSCompleted = false;
var mirrorBuilding = false;
var mirrorRadius = 0;
var mirrorCompleted = false;

var meteorSSBuilding = false;
var meteorSSProgress = -1;
var meteorSSCompleted = false;
var analyzingMeteor = false;
var meteorAnalysisProgress = 0;

/**
 * Tiles_list, which will be assigned to actual tiles_list
 * Units: altitude: km,
 * lifeforce: arbitrary;
 * atmP: bar;
 * oxygen: mbar;
 * fallout: arbitrary, but decay remains true to half-life cycle and approximate time;
 * temperature: Kelvin.
 */
var tiles_list;

/**
 * Effects before each turn
 */
function perpetualChange(){
    /**
     * Keep track of budget
     */
    budget += dBudget;

    /**
     * Keep track of tile variable
     */
    for (var i=0; i<tiles_list.length; i++){
        //Nuclear fallout
        if (tiles_list[i].fallout>0) {tiles_list[i].fallout *= ( Math.pow(0.5, 1/300));} //1 frame = 1 month. Half life is 25 years.

        //Temperature spread (between 2 neighbors, warmer tile gives temperature to cooler tile)
        for (var j=0; j<tiles_list[i].neighbors.length; j++){
            if (tiles_list[i].temperature < tiles_list[i].neighbors[j].temperature){
                tiles_list[i].temperature += (Math.max(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature) - Math.min(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature))/4;
                tiles_list[i].neighbors[j].temperature -= (Math.max(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature) - Math.min(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature))/4;
            }
            else if (tiles_list[i].temperature > tiles_list[i].neighbors[j].temperature){
                tiles_list[i].temperature -= (Math.max(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature) - Math.min(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature))/4;
                tiles_list[i].neighbors[j].temperature += (Math.max(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature) - Math.min(tiles_list[i].temperature, tiles_list[i].neighbors[j].temperature))/4;
            }
        }

        //Water
        if (tiles_list[i].ice && tiles_list[i].temperature >= 240){
            tiles_list[i].ice = false;
            tiles_list[i].water = true;
        }

        //Water access
        if (tiles_list[i].farNeighbors.water || tiles_list[i].neighbors.water) {tiles_list[i].waterAccess = true;}
        //if (Tile[i].hasWater(1) || Tile[i].hasWater(2){ tiles_list[i].waterAccess = true; }

        //Oxygen spread (between 2 neighbors, tile with higher O2 concentration gives to tile with lower)
        for (var j=0; j<tiles_list[i].neighbors.length; j++){
            if (tiles_list[i].oxygen < tiles_list[i].neighbors[j].oxygen){
                tiles_list[i].oxygen += (Math.max(tiles_list[i].oxygen, tiles_list[i].neighbors[j].oxygen) - Math.min(tiles_list[i].oxygen, tiles_list[i].neighbors[j].temperature))/3;
                tiles_list[i].neighbors[j].oxygen -= (Math.max(tiles_list[i].oxygen, tiles_list[i].neighbors[j].oxygen) - Math.min(tiles_list[i].oxygen, tiles_list[i].neighbors[j].temperature))/3;
            }
            else if (tiles_list[i].oxygen > tiles_list[i].neighbors[j].oxygen){
                tiles_list[i].oxygen -= (Math.max(tiles_list[i].oxygen, tiles_list[i].neighbors[j].oxygen) - Math.min(tiles_list[i].oxygen, tiles_list[i].neighbors[j].temperature))/3;
                tiles_list[i].neighbors[j].oxygen += (Math.max(tiles_list[i].oxygen, tiles_list[i].neighbors[j].oxygen) - Math.min(tiles_list[i].oxygen, tiles_list[i].neighbors[j].temperature))/3;
            }
        }

        //Habitability
        if (tiles_list[i].temperature >= 250 && tiles_list[i].oxygen >= 1 && tiles_list[i].waterAccess && tiles_list[i].fallout < 1) {
            tiles_list[i].habitable = 0; //Moss habitable
        }
        if (tiles_list[i].temperature >= 270 && tiles_list[i].oxygen >= 1.5 && tiles_list[i].waterAccess && tiles_list[i].fallout < 1) {
            tiles_list[i].habitable = 1; //Advanced plants habitable
        }
        if (tiles_list[i].temperature >= 285 && tiles_list[i].oxygen >= 120 && tiles_list[i].waterAccess && tiles_list[i].fallout < 1) {
            tiles_list[i].habitable = 2; //Human habitable
        }

        //Life force, increase if tile is habitable, capped at 50, and decreases if tile is inhabitable
        switch (tiles_list[i].habitable){
            case 0:{
                if (tiles_list[i].lifeForce < 50) {tiles_list[i].lifeForce += tiles_list[i].moss * Lives[0].growth;}
                if (tiles_list[i].lifeForce > 50) {tiles_list[i].lifeForce = 50;}
                break;
            }
            case 1:{
                if (tiles_list[i].lifeForce < 50) {tiles_list[i].lifeForce += tiles_list[i].moss * Lives[0].growth + tiles_list[i].plants * Lives[1].growth;}
                if (tiles_list[i].lifeForce > 50) {tiles_list[i].lifeForce = 50;}
                break;
            }
            case 2:{
                if (tiles_list[i].lifeForce < 50) {tiles_list[i].lifeForce += tiles_list[i].moss * Lives[0].growth + tiles_list[i].plants * Lives[1].growth;}
                if (tiles_list[i].lifeForce > 50) {tiles_list[i].lifeForce = 50;}
                break;
            }
            default:{
                tiles_list[i].lifeForce -= 10;
                break;
            }
        }




        //Oxygen production by pyrolysis and plants
        if (tiles_list[i].pyrolyzing){
            tiles_list[i].oxygen += 0.1;
        }
        tiles_list[i].oxygen += (tiles_list[i].lifeForce/1000);
    }

    //Mirror S.S. construction on/off
    if (mirrorSSBuilding && mirrorSSProgress<240) {mirrorSSProgress++;}
    if (mirrorSSProgress===240 && !mirrorSSCompleted){
        mirrorSSCompleted = true;
        mirrorSSBuilding = false;
        dBudget -= Mirrors[0].dPrice;
        Items[1].list.push(Mirrors[1]);
    }

    //Mirror construction on/off
    if (mirrorBuilding && !mirrorCompleted){
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
            dBudget -= Mirrors[1].dPrice;
            mirrorCompleted = true;
        }
    }

    //Asteroid S.S. construction on/off
    if (meteorSSBuilding && meteorSSProgress<240) {meteorSSProgress++;}
    if (meteorSSProgress===240){
        meteorSSCompleted = true;
        meteorSSBuilding = false;
        dBudget -= Mirrors[0].dPrice;
        Items[2].list.push(Meteors[1]);
    }

    //Asteroid analysis on/off
    if (analyzingMeteor){
        meteorAnalysisProgress++;
        if (meteorAnalysisProgress===60){
            analyzingMeteor = false;
            dBudget -= Meteors[1].dPrice;
            meteorAnalysisProgress = 0;
            Items[2].list.push(Meteors[2]);
        }
    }
}


/**
 *  Function controlling explosives
 *  Note: Mars radius is 3390 km
 */
function fExplosive(type, target){
    budget += Explosives[type].price;
    dBudget += Explosives[type].dPrice;

    tiles_list[target].temperature += Explosives[type].tmp;
    tiles_list[target].fallout += 10;
    for (var i=0; i<tiles_list[target].neighbors.length; i++){
        tiles_list[target].neighbors[i].fallout += Explosives[type].fallout;
    }
    tiles_list[target]. altitude += Explosives[type].altitude;
}


/**
 *  Control the construction of the S.S. that will be used to construct mirror
 */
function fMirror0(){
    if (mirrorSSProgress === -1){
        budget += Mirrors[0].price;
    }
    if (mirrorSSBuilding === false){
        dBudget += Mirrors[0].dPrice;
        mirrorSSBuilding = true;
    }
    else{
        dBudget -= Mirrors[0].dPrice;
        mirrorSSBuilding = false;
    }
}

/**
 *  Control the construction of the mirror
 */
function fMirror1(){
    if (!mirrorBuilding){
        mirrorBuilding = true;
        dBudget += mirror1.dPrice;
    }
    else{
        mirrorBuilding = false;
        dBudget -= mirror1.dPrice;
    }
}

/**
 *  Control the target of the mirror
 */
function fMirror2(target){

}


/**
 *  Control the construction of the S.S. that will be used to analyze asteroids
 */
function fMeteor0(){
    if (meteorSSProgress === -1){
        budget += Meteors[0].price;
    }
    if (meteorSSBuilding === false){
        dBudget += Meteors[0].dPrice;
        meteorSSBuilding = true;
    }
    else{
        dBudget -= Meteors[0].dPrice;
        meteorSSBuilding = false;
    }
}

/**
 *  Control the analysis of asteroids
 */
function fMeteor1(){
    if (!analyzingMeteor){
        analyzingMeteor = true;
        dBudget += Meteors[1].dPrice;
    }
    else{
        analyzingMeteor = false;
        dBudget -= Meteors[1].dPrice;
    }
}

/**
 *  Control target of the meteor
 */
function fMeteor2(target){
    budget += meteor2.price;
    dBudget += meteor2.dPrice;

    tiles_list[target].temperature += 10;

    Items[2].list.pop();
}

/**
 * Turn pyrolysis of a tile on or off
 */
function fPyrolysis(target) {
    if (!tiles_list[target].pyrolyzing){
        dBudget += Pyrolysis[0].dPrice;
        tiles_list[target].pyrolyzing = true;
    }
    else{
        dBudget -= Pyrolysis[0].dPrice;
        tiles_list[target].pyrolyzing = false;
    }
}

function fLife (type, target){
    switch (type){
        case 0:{
            tiles_list[target].moss = 1;
            break;
        }
        case 1:{
            tiles_list[target].plants = 1;
            break;
        }
    }

}

/**
 * Test functions
 */
function mouseClicked(){
    perpetualChange();
    if (mouseOverExplosive0){explosive0(0);}
    if (mouseOverExplosive1){explosive1(0);}
    if (mouseOverExplosive2){explosive2(0);}

    for (var i=0; i<tiles_list.length; i++){
        console.log("Tile: " + i + "\nTemp: " + tiles_list[i].temperature.toFixed(2) + "\nAltitude: " + tiles_list[i].altitude + "\nFallout: " + tiles_list[i].fallout);
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