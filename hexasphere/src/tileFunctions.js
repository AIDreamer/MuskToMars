/**
 * Created by Cam on 5/29/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

//Check altitude commands in final version

/**
 * ITEMS vars & lists
 */
var EXPLOSIVES = [
    {name:"Nuclear Fission Bomb", img: "Image var", price: 210000000, dPrice: 0, effect:true, tmp: 7*Math.pow(10,-11), fallout:8, height: -0.2 },
    {name:"Boosted Fission Bomb", img: "Image var", price: 260000000, dPrice: 0, effect:true, tmp: 9*Math.pow(10,-11), fallout:10, height: -0.4 },
    {name:"Hydrogen Bomb", img: "Image var", price: 400000000, dPrice: 0, effect:true, tmp: 14*Math.pow(10,-10), fallout:0, height: -0.8}
];
var MIRRORS = [
    {name:"Construct: Space Station - Mirror Manufacturing", img: "Image var", price: 100000000000, dPrice: 0, effect:false, tmp: 0},
    {name:"Construct: Orbital Mirror", img: "Image var", price: 0, dPrice: 80000000000, effect:false, tmp: 0},
    {name:"Select Mirror Target", img: "Image var", price: 0, dPrice: 0, effect:true, tmp: 0}
];
var METEORS = [
    {name:"Construct: Space Station - Meteor Analysis", img: "Image var", price: 100000000000, dPrice: 0, effect:false, tmp: 0},
    {name:"Analyze Meteor", img: "Image var", price: 0, dPrice: 500000000, effect:false, tmp: 0},
    {name:"Send Ammonia Meteor to Mars", img: "Image var", price: 0, dPrice: 500000000, effect:true, tmp: 0}
];
var PYROLYSIS = [
    {name:"Pyrolyze: Mars' earth", img: "Image var", price: 0, dPrice: 1000000000, effect:true, tmp: 0}
];
var LIVES = [
    {name:"Moss", img: "Image var", price: 0, dPrice: 0, growth:5},
    {name:"Advanced Plants", img: "Image var", price: 0, dPrice: 0, growth:10}
];

var ITEMS = [
    {name: "EXPLOSIVES", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Orbital Mirror", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Meteor", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "PYROLYSIS", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]},
    {name: "Life", list: [], mouseIsOver:false, mousePressedOver:false, mouseIsOverList:[], mousePressedOverList:[]}
];

for (var i = 0; i< EXPLOSIVES.length; i++) {
    ITEMS[0].list.push(EXPLOSIVES[i]);
}
ITEMS[1].list.push(MIRRORS[0]);
ITEMS[2].list.push(METEORS[0]);
for (var i = 0; i< PYROLYSIS.length; i++){
    ITEMS[3].list.push(PYROLYSIS[i]);
}
for (var i = 0; i< LIVES.length; i++){
    ITEMS[4].list.push(LIVES[i]);
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
 * Tiles_list, which will be assigned to actual tileList
 * Units: altitude: km,
 * lifeforce: arbitrary;
 * atmP: bar;
 * oxygen: mbar;
 * fallout: arbitrary, but decay remains true to half-life cycle and approximate time;
 * temperature: Kelvin.
 */

/**
 * Effects before each turn
 */
function updateTiles(){
    /**
     * Keep track of budget
     */
    budget += dBudget;

    /**
     * Keep track of tile variable
     */
    for (var i=0; i<tileList.length; i++){
        var t = tileList[i];

        //Nuclear fallout
        if (t.fallout>0) {t.fallout *= ( Math.pow(0.5, 1/300));} //1 frame = 1 month. Half life is 25 years.

        //Temperature spread (between 2 neighbors, warmer tile gives temperature to cooler tile)
        for (var j=0; j<t.neighbors.length; j++){
            if (t.temperature < t.neighbors[j].temperature){
                t.temperature += (Math.max(t.temperature, t.neighbors[j].temperature) - Math.min(t.temperature, t.neighbors[j].temperature))/4;
                t.neighbors[j].temperature -= (Math.max(t.temperature, t.neighbors[j].temperature) - Math.min(t.temperature, t.neighbors[j].temperature))/4;
            }
            else if (t.temperature > t.neighbors[j].temperature){
                t.temperature -= (Math.max(t.temperature, t.neighbors[j].temperature) - Math.min(t.temperature, t.neighbors[j].temperature))/4;
                t.neighbors[j].temperature += (Math.max(t.temperature, t.neighbors[j].temperature) - Math.min(t.temperature, t.neighbors[j].temperature))/4;
            }
        }

        //Water
        if (t.ice && t.temperature >= 240){
            t.ice = false;
            t.water = true;
        }

        //Water access
        //if (t.farNeighbors.water || t.neighbors.water) {t.waterAccess = true;}
        //if (Tile[i].hasWater(1) || Tile[i].hasWater(2){ t.waterAccess = true; }

        //Oxygen spread (between 2 neighbors, tile with higher O2 concentration gives to tile with lower)
        for (var j=0; j<t.neighbors.length; j++){
            if (t.oxygen < t.neighbors[j].oxygen){
                t.oxygen += (Math.max(t.oxygen, t.neighbors[j].oxygen) - Math.min(t.oxygen, t.neighbors[j].temperature))/3;
                t.neighbors[j].oxygen -= (Math.max(t.oxygen, t.neighbors[j].oxygen) - Math.min(t.oxygen, t.neighbors[j].temperature))/3;
            }
            else if (t.oxygen > t.neighbors[j].oxygen){
                t.oxygen -= (Math.max(t.oxygen, t.neighbors[j].oxygen) - Math.min(t.oxygen, t.neighbors[j].temperature))/3;
                t.neighbors[j].oxygen += (Math.max(t.oxygen, t.neighbors[j].oxygen) - Math.min(t.oxygen, t.neighbors[j].temperature))/3;
            }
        }

        //Habitability
        if (t.temperature >= 250 && t.oxygen >= 1 && t.waterAccess && t.fallout < 1) {
            t.habitable = 0; //Moss habitable
        }
        if (t.temperature >= 270 && t.oxygen >= 1.5 && t.waterAccess && t.fallout < 1) {
            t.habitable = 1; //Advanced plants habitable
        }
        if (t.temperature >= 285 && t.oxygen >= 120 && t.waterAccess && t.fallout < 1) {
            t.habitable = 2; //Human habitable
        }

        //Life force, increase if tile is habitable, capped at 50, and decreases if tile is inhabitable
        switch (t.habitable){
            case 0:{
                if (t.lifeForce < 50) {t.lifeForce += t.moss * LIVES[0].growth;}
                if (t.lifeForce > 50) {t.lifeForce = 50;}
                break;
            }
            case 1:{
                if (t.lifeForce < 50) {t.lifeForce += t.moss * LIVES[0].growth + t.plants * LIVES[1].growth;}
                if (t.lifeForce > 50) {t.lifeForce = 50;}
                break;
            }
            case 2:{
                if (t.lifeForce < 50) {t.lifeForce += t.moss * LIVES[0].growth + t.plants * LIVES[1].growth;}
                if (t.lifeForce > 50) {t.lifeForce = 50;}
                break;
            }
            default:{
                t.lifeForce -= 10;
                break;
            }
        }

        //Oxygen production by pyrolysis and plants
        if (t.pyrolyzing){
            t.oxygen += 0.1;
        }
        t.oxygen += (t.lifeForce/1000);

        // Change mesh if needed
        if (t.meshChange == true) {
            //var id = t.mesh.index;
            t.meshChange = false;

            // Reshape the tile first
            t.reshape();
            t.reshapeGeometry();

            // scale the tile
            if (t.grass == true) {
                scaleTile(t, 1 + GRASS_RISE / BASE_HEIGHT);
            } else if (t.ice == true) {
                scaleTile(t, 1 + ICE_RISE / BASE_HEIGHT);
            } else if (t.water == true) {
                if (t.landAround()) scaleTile(t, 1 + SAND_RANGE / BASE_HEIGHT);
                else if (t.height - WATER_BASE + SAND_RANGE > 0) scaleTile(t, 1 + (t.height - WATER_BASE + SAND_RANGE) / BASE_HEIGHT);
                else scaleTile(t, 1 + WATER_RISE / BASE_HEIGHT);
            } else {
                scaleTile(t, 1 + BASE_RISE / BASE_HEIGHT);
            }

            t.mesh.geometry.computeFaceNormals();
        };

        // Calculate color
        t.mesh.material.color = t.color;
        t.calculateColor();
    }

    //Mirror S.S. construction on/off
    if (mirrorSSBuilding && mirrorSSProgress<240) {mirrorSSProgress++;}
    if (mirrorSSProgress===240 && !mirrorSSCompleted){
        mirrorSSCompleted = true;
        mirrorSSBuilding = false;
        dBudget -= MIRRORS[0].dPrice;
        ITEMS[1].list.push(MIRRORS[1]);
    }

    ////Mirror construction on/off
    //if (mirrorBuilding && !mirrorCompleted){
    //    if (mirrorRadius===0) {
    //        mirrorRadius += Math.sqrt(35/Math.PI);
    //        tile0.temperature += 0.025 * Math.sqrt(35/Math.PI);
    //    }
    //    if (mirrorRadius+5.3/mirrorRadius <= 800) {
    //        tile0.temperature += 0.025 * 5.3/mirrorRadius;
    //        mirrorRadius += 5.3/mirrorRadius;
    //    }
    //    if (mirrorRadius+5.3/mirrorRadius > 800) {
    //        tile0.temperature += 0.025 * (800-mirrorRadius);
    //        mirrorRadius = 800;
    //        dBudget -= MIRRORS[1].dPrice;
    //        mirrorCompleted = true;
    //    }
    //}

    //Asteroid S.S. construction on/off
    if (meteorSSBuilding && meteorSSProgress<240) {meteorSSProgress++;}
    if (meteorSSProgress===240){
        meteorSSCompleted = true;
        meteorSSBuilding = false;
        dBudget -= MIRRORS[0].dPrice;
        ITEMS[2].list.push(METEORS[1]);
    }

    //Asteroid analysis on/off
    if (analyzingMeteor){
        meteorAnalysisProgress++;
        if (meteorAnalysisProgress===60){
            analyzingMeteor = false;
            dBudget -= METEORS[1].dPrice;
            meteorAnalysisProgress = 0;
            ITEMS[2].list.push(METEORS[2]);
        }
    }
}

/**
 *  Function controlling explosives
 *  Note: Mars radius is 3390 km
 */
function fExplosive(type, target){
    budget += EXPLOSIVES[type].price;
    dBudget += EXPLOSIVES[type].dPrice;

    tileList[target].temperature += EXPLOSIVES[type].tmp;
    tileList[target].fallout += 10;
    for (var i=0; i<tileList[target].neighbors.length; i++){
        tileList[tileList[target].neighbors[i]].fallout += EXPLOSIVES[type].fallout;
        tileList[tileList[target].neighbors[i]].meshChange = true;
    }
    tileList[target].height += EXPLOSIVES[type].height;
    tileList[target].meshChange = true;

    // Add an effect to the effect list
    effectsList.addEffect(new Explosion(tileList[target].centerPoint));
}


/**
 *  Control the construction of the S.S. that will be used to construct mirror
 */
function fMirror0(){
    if (mirrorSSProgress === -1){
        budget += MIRRORS[0].price;
    }
    if (mirrorSSBuilding === false){
        dBudget += MIRRORS[0].dPrice;
        mirrorSSBuilding = true;
    }
    else{
        dBudget -= MIRRORS[0].dPrice;
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
        budget += METEORS[0].price;
    }
    if (meteorSSBuilding === false){
        dBudget += METEORS[0].dPrice;
        meteorSSBuilding = true;
    }
    else{
        dBudget -= METEORS[0].dPrice;
        meteorSSBuilding = false;
    }
}

/**
 *  Control the analysis of asteroids
 */
function fMeteor1(){
    if (!analyzingMeteor){
        analyzingMeteor = true;
        dBudget += METEORS[1].dPrice;
    }
    else{
        analyzingMeteor = false;
        dBudget -= METEORS[1].dPrice;
    }
}

/**
 *  Control target of the meteor
 */
function fMeteor2(target){
    budget += meteor2.price;
    dBudget += meteor2.dPrice;

    tileList[target].temperature += 10;

    ITEMS[2].list.pop();
}

/**
 * Turn pyrolysis of a tile on or off
 */
function fPyrolysis(target) {
    if (!tileList[target].pyrolyzing){
        dBudget += PYROLYSIS[0].dPrice;
        tileList[target].pyrolyzing = true;
    }
    else{
        dBudget -= PYROLYSIS[0].dPrice;
        tileList[target].pyrolyzing = false;
    }
}

function fLife (type, target){
    switch (type){
        case 0:{
            tileList[target].moss = 1;
            break;
        }
        case 1:{
            tileList[target].plants = 1;
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

    for (var i=0; i<tileList.length; i++){
        console.log("Tile: " + i + "\nTemp: " + tileList[i].temperature.toFixed(2) + "\nAltitude: " + tileList[i].altitude + "\nFallout: " + tileList[i].fallout);
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