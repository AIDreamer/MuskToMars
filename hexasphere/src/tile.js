var Tile = function(centerPoint, hexSize){

    if(hexSize == undefined){
        hexSize = 1;
    }

    hexSize = Math.max(.01, Math.min(1.0, hexSize));

    // Graphic properties
    this.centerPoint = centerPoint;
    this.faces = centerPoint.getOrderedFaces();
    this.boundary = [];
    this.neighbors = new Set();
    this.pointWiseNeighbors = [];
    this.height = 0;
    this.color = 0;
    this.baseColor = 0;
    this.triangles = [];
    for(var f=0; f< this.faces.length; f++){
        this.boundary.push(this.faces[f].getCentroid().segment(this.centerPoint, hexSize));
    }
    this.mesh;

    // Game property
    this.water = false;
    this.altitude = 100;
    this.earthDensity = 0;
    this.temperature = BASE_MEAN_TEMPERATURE;
    this.atmP = 0;
    this.oxygenP = 0;
    this.fallout = 0;
};

Tile.prototype.getLatLon = function(radius, boundaryNum){
    var point = this.centerPoint;
    if(typeof boundaryNum == "number" && boundaryNum < this.boundary.length){
        point = this.boundary[boundaryNum];
    }
    var phi = Math.acos(point.y / radius); //lat
    var theta = (Math.atan2(point.x, point.z) + Math.PI + Math.PI / 2) % (Math.PI * 2) - Math.PI; // lon

    // theta is a hack, since I want to rotate by Math.PI/2 to start.  sorryyyyyyyyyyy
    return {
        lat: 180 * phi / Math.PI - 90,
        lon: 180 * theta / Math.PI
    };
};

Tile.prototype.scaledBoundary = function(scale){

    scale = Math.max(0, Math.min(1, scale));

    var ret = [];
    for(var i = 0; i < this.boundary.length; i++){
        ret.push(this.centerPoint.segment(this.boundary[i], 1 - scale));
    }

    return ret;
};

/**
 * Calculate the color based on the existing property.
 */
Tile.prototype.calculateColor = function() {
    var fallOutRatio = Math.min(.8, this.fallout / MAX_FALLOUT);
    var baseColorRatio = 1 - fallOutRatio;
    this.color = calculateColorByRatio([FALL_OUT_COLOR, this.baseColor], [fallOutRatio,baseColorRatio]);
};

/**
 * Generates a string to represent the Tile
 * @returns {string}
 */
Tile.prototype.toString = function(){
    return this.centerPoint.toString();
};

///////////////////////////
// TILE UTILITY FUNCTIONS
///////////////////////////

/**
 * Calculate color by ratio
 * @param colors
 * @param ratios
 * @returns {THREE.Color}
 */
function calculateColorByRatio(colors, ratios) {
    var r = 0, g = 0, b = 0;
    for (var i = 0; i < colors.length; i++) {
        r += colors[i].r * ratios[i];
        g += colors[i].g * ratios[i];
        b += colors[i].b * ratios[i];
    }
    //console.log(colors);
    return new THREE.Color(r,g,b);
}