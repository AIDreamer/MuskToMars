/**
 * Created by Cam on 5/29/2016.
 *
 * PROJECT: MARS TO MUSK
 * PRODUCED BY: CAMERON PHAN, SON PHAM
 */

//Check altitude vars & commands in final version


var meanTemp = 216.5;

var Tiles = [];

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

function explosive0(index){
    Tiles[index].temperature += 7; //*pow(10,-11);
    Tiles[index].fallout += 10;
    for (var i=0; i<Tiles[index].neighbors.length; i++){
        Tiles[index].neighbors[i].fallout += 8;
    }
    Tiles[index]. altitude -= 2;
}

function explosive1(index){
    Tiles[index].temperature += 9; //*pow(10,-11);
    Tiles[index].fallout += 12;
    for (var i=0; i<Tiles[index].neighbors.length; i++){
        Tiles[index].neighbors[i].fallout += 10;
    }
    Tiles[index]. altitude -= 3;
}

function explosive2(index){
    Tiles[index].temperature += 14; //*pow(10,-10);
    Tiles[index]. altitude -= 5;
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