var Tile = function(centerPoint, hexSize){

    if(hexSize == undefined){
        hexSize = 1;
    }

    hexSize = Math.max(.01, Math.min(1.0, hexSize));

    // Graphic properties
    this.centerPoint = centerPoint;
    this.originalCenterPoint = centerPoint.clone();
    this.faces = centerPoint.getOrderedFaces();
    this.boundary = [];
    this.originalBoundary = [];
    this.neighbors = new Set();
    this.pointWiseNeighbors = [];
    this.height = 0;
    this.color = 0;
    this.baseColor = 0;
    this.triangles = [];
    for(var f=0; f< this.faces.length; f++){
        var p = this.faces[f].getCentroid().segment(this.centerPoint, hexSize);
        this.boundary.push(p);
        this.originalBoundary.push(p.clone());
    }
    this.mesh = null;

    // Game property
    this.meshChange = false;
    this.water = false;
    this.waterAccess = false;
    this.plant = false;
    this.grass = false;
    this.ice = false;
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
 * Reshape the tile according to the height of adjacent tile
 */
Tile.prototype.reshape = function() {
    var height1, height2, index1, index2, averageHeight;
    for (var i = 0; i < this.boundary.length; i++) {
        index1 = this.pointWiseNeighbors[i][0];
        index2 = this.pointWiseNeighbors[i][1];
        height1 = tileList[index1].height;
        height2 = tileList[index2].height;
        averageHeight = (this.height + height1 + height2) / 3;
        scalePoint(this.originalBoundary[i], this.boundary[i], Math.pow(averageHeight / BASE_HEIGHT, EXPERIENTIAL_SCALE));
    }
    scalePoint(this.originalCenterPoint, this.centerPoint, Math.pow(this.height / BASE_HEIGHT, EXPERIENTIAL_SCALE));
};

/**
 * Reshape Geometry
 */
Tile.prototype.reshapeGeometry = function() {

    // Create the geometry for each tile
    var geometry = this.mesh.geometry;
    geometry.dynamic = true;
    for (var j = 0; j < this.boundary.length; j++) {
        var bp = this.boundary[j];
        geometry.vertices[j].set(bp.x, bp.y, bp.z);
        geometry.vertices[j + this.boundary.length].set(bp.x, bp.y, bp.z);
    }
    geometry.verticesNeedUpdate = true;
};

/**
 * Calculate the color based on the existing property.
 */
Tile.prototype.calculateColor = function() {
    var fallOutInfluence = this.fallout / MAX_FALLOUT * FALL_OUT_COEFFICIENT;
    var waterInfluence;
    var sandInfluence;
    var grassInfluence;
    var iceInfluence;

    if (this.grass == true) {
        grassInfluence = GRASS_COEFFICIENT;
        waterInfluence = 0;
        sandInfluence = 0;
        iceInfluence = 0;
    } else if (this.water == true) {
        if (this.landAround()) {
            sandInfluence = CLOSE_SAND_COEFFICIENT;
            waterInfluence =  Math.max((WATER_BASE - this.height) / WATER_RANGE, 0) * WATER_COEFFICIENT * 1/3;
        } else {
            sandInfluence = Math.max((this.height - WATER_BASE + SAND_RANGE ) / WATER_RANGE, 0) * SAND_COEFFICIENT;
            waterInfluence = Math.max((WATER_BASE - this.height) / WATER_RANGE, 0) * WATER_COEFFICIENT;
        }

        grassInfluence = 0;
        iceInfluence = 0;
    } else if (this.ice == true) {
        grassInfluence = 0;
        waterInfluence = 0;
        sandInfluence = 0;
        iceInfluence = ICE_COEFFICIENT;
    } else {
        grassInfluence = 0;
        waterInfluence = 0;
        sandInfluence = 0;
        iceInfluence = 0;
    }

    var baseColorInfluence = BASE_COEFFICIENT;
    var baseTintInfluence = BASE_TINT_COEFFICIENT;
    this.color = calculateColorByRatio([FALL_OUT_COLOR, WATER_COLOR, GRASS_COLOR, SAND_COLOR, ICE_COLOR, this.baseColor, TINT_COLOR], [fallOutInfluence, waterInfluence, grassInfluence, sandInfluence, iceInfluence, baseColorInfluence, baseTintInfluence]);
};

/**
 * Generates a string to represent the Tile
 * @returns {string}
 */
Tile.prototype.toString = function(){
    return this.centerPoint.toString();
};

/**
 * Check if there is land around the tile
 */
Tile.prototype.landAround = function() {
    for (var i = 0; i < this.neighbors.length; i++) {
        if (hexasphere.tiles[this.neighbors[i]].water == false) return true;
    }
    return false;
}

///////////////////////////
// TILE UTILITY FUNCTIONS
///////////////////////////

/**
 * Calculate color by ratio
 * @param colors
 * @param ratios
 * @returns {THREE.Color}
 */
function calculateColorByRatio(colors, influences) {
    var sum = influences.reduce(add, 0);
    for (var i = 0; i < influences.length; i++) {
        influences[i] /= sum;
    }

    var r = 0, g = 0, b = 0;
    for (var i = 0; i < colors.length; i++) {
        r += colors[i].r * influences[i];
        g += colors[i].g * influences[i];
        b += colors[i].b * influences[i];
    }
    //console.log(colors);
    return new THREE.Color(r,g,b);
}

/**
 * Add utility functions
 * @param a
 * @param b
 * @returns {*}
 */
function add(a, b) {
    return a + b;
}

/**
 * Scale one point of the tile
 * @param point
 * @param c
 */
function scalePoint(basePoint, point, c) {
    point.x = basePoint.x * c;
    point.y = basePoint.y * c;
    point.z = basePoint.z * c;
}

/** Scale a tile
 * @param tile
 * @param c
 */
function scaleTile(tile, c) {
    for (var i = 0; i < tile.boundary.length; i++) {
        scalePoint(tile.boundary[i], tile.mesh.geometry.vertices[i], c);
    }
    scalePoint(tile.centerPoint, tile.centerPoint, c);
}