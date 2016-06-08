//////////////////////
// Global variables
//////////////////////

// Scene variables
var camera, controls, scene, renderer;

// Image projection variables
var img, projectionContext, projectionCanvas;
var heightMap,heightContext, heightCanvas;
var pixelData, heightData;

// Hexasphere variable
var hexasphere;
var meshSphere = []; // Store all the mesh in the hexasphere

// Events
var tileChange;

// Temporary storage variables
var selectedID;
var selectedMesh;
var selectedTile;
var lastID;

// Render variables
var ren_camera = 0;
var ren_tileChange = 0;

// Controler variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector3();

////////////////////
// Utility functions
////////////////////

/**
 * Parses pixels around particular position in the map to get the best color representation
 * @param lat
 * @param lon
 * @param around
 * @returns {number}
 */
var getPixelAround = function (lat, lon, around) {

    var x = parseInt(img.width * (lon + 180) / 360);
    var y = parseInt(img.height * (lat + 90) / 180);

    // Pixel data singleton
    if (pixelData == null) {
        pixelData = projectionContext.getImageData(0, 0, img.width, img.height);
    }

    // Parse the color
    var R = 0;
    var G = 0;
    var B = 0;
    var totalPixel = Math.pow(around + around, 2);
    for (var img_i = x - around; img_i < x + around; img_i++) {
        for (var img_j = y - around; img_j < y + around; img_j++) {
            R += pixelData.data[( (img_j % pixelData.height) * pixelData.width + (img_i % pixelData.width)) * 4];
            G += pixelData.data[( (img_j % pixelData.height) * pixelData.width + (img_i % pixelData.width)) * 4 + 1];
            B += pixelData.data[( (img_j % pixelData.height) * pixelData.width + (img_i % pixelData.width)) * 4 + 2];
        }
    }

    R = Math.floor(R / totalPixel);
    G = Math.floor(G / totalPixel);
    B = Math.floor(B / totalPixel);

    return R * 256 * 256 + G * 256 + B;
};

/**
 * Parses pixels around particular position in the map to get the best height scale
 * @param lat
 * @param lon
 * @param around
 * @returns {number}
 */
var getGrayScaleAround = function (lat, lon, around) {

    var x = parseInt(img.width * (lon + 180) / 360);
    var y = parseInt(img.height * (lat + 90) / 180);

    // Pixel data singleton
    if (heightData == null) {
        heightData = heightContext.getImageData(0, 0, heightMap.width, heightMap.height);
    }

    // Parse the color
    var B = 0;
    var totalPixel = Math.pow(around + around, 2);
    for (var img_i = x - around; img_i < x + around; img_i++) {
        for (var img_j = y - around; img_j < y + around; img_j++) {
            B += heightData.data[( ((img_j+heightData.height) % heightData.height) * heightData.width + (img_i % heightData.width)) * 4];
        }
    }

    B = (B / totalPixel) / 255;

    return B;
};
/**
 * Make the rectangle round
 * @param ctx
 * @param x
 * @param y
 * @param w
 * @param h
 * @param r
 */
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

/**
 * Make a text sprite
 * @param message
 * @param parameters
 * @returns {THREE.Sprite}
 */
function makeTextSprite( message, parameters )
{
    // Pass in the parameter
    if ( parameters === undefined ) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
    var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

    // Create the context
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // Context properties
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);
    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
    context.fillText( message, borderThickness, fontsize + borderThickness);

    // Create texture based on canvas
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    // Create the sprite based on the texture
    var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
}

/**
 * Scale one point of the tile
 * @param point
 * @param c
 */
function scalePoint(point, c) {
    point.x *= c;
    point.y *= c;
    point.z *= c;
}

/** Scale a tile
 * @param tile
 * @param c
 */
function scaleTile(tile, c) {
    for (var i = 0; i < tile.boundary.length; i++) {
        scalePoint(tile.boundary[i], c*c*c*c*c);
    }
}

//////////////////////
// Event Handlers
//////////////////////

/**
 * Render if there is a camera change
 */
function triggerCameraChange() {
    ren_camera = true;
}

/**
 * Render if there is a tile change
 */
function triggerTileChange() {
    ren_tileChange = true;
}

/**
 * Reset all triggers to 0
 */
function resetTrigers() {
    ren_camera = false;
    ren_tileChange = false;
}

/**
 * Determine if the scene should be newly rendered
 */
function determineRender() {
    return ren_camera && ren_tileChange;
}

/**
 * Reshape tile according to average height
 * @param tile
 */
function reshapeTile(tile) {
    var height1, height2, index1, index2, averageHeight;
    for (var i = 0; i < tile.boundary.length; i++) {
        index1 = tile.pointWiseNeighbors[i][0];
        index2 = tile.pointWiseNeighbors[i][1];
        height1 = hexasphere.tiles[index1].height;
        height2 = hexasphere.tiles[index2].height;
        averageHeight = (tile.height + height1 + height2) / 3;
        scalePoint(tile.boundary[i], Math.pow(averageHeight / BASE_HEIGHT, 5));
    }
}

/**
 * Print out valuable informations about a tile of index i
 * @param i
 */
function examineTile(i) {
    var t = hexasphere.tiles[i];

    var R = Math.floor(255 * Math.random(1));
    var G = Math.floor(255 * Math.random(1));
    var B = Math.floor(255 * Math.random(1));

    var color = {r: R, g: G, b: B, a: 1}

    console.log(t.neighbors);
    console.log(t.boundary);
    console.log(t.faces);
    console.log(t.pointWiseNeighbors);

    for (var j = 0; j < t.boundary.length; j ++) {
        // Create the sprite that shows
        var sprite = makeTextSprite("Point" + j, {fontsize: 32, backgroundColor: color});
        sprite.position = t.boundary[j];
        scene.add(sprite);
    }
}

function onMouseUp(e) {
    burn(selectedID);
    console.log("Click");
}

function onMouseMove( event ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

/**
 * Show the index of the tile
 */
function showTileIndex() {
    for (var i = 0; i < hexasphere.tiles.length; i++) {
        var t = hexasphere.tiles[i];

        // Create the sprite that shows
        var sprite = makeTextSprite(" " + i + " ", {fontsize: 32, backgroundColor: {r: 255, g: 100, b: 0, a: 1}});
        sprite.position = t.centerPoint;
        scene.add(sprite);
    }
}

////////////////////
// Three.js code
////////////////////

init();
animate();

function init(){

    /***************
     * Renderer code
     ***************/

    var width = window.innerWidth;
    var height = window.innerHeight - 10;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setClearColor( 0xffffff, 1 );
    document.body.appendChild(renderer.domElement);

    /***************
     * Scene, camera and trackball code
     ***************/

    // Camera
    var cameraDistance = 65;
    camera = new THREE.PerspectiveCamera(cameraDistance, width / height, 1, 100);
    camera.position.z = -cameraDistance;

    // Scene and fog code
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, cameraDistance * .4, cameraDistance * 1.2);

    // Trackball
    controls = new THREE.TrackballControls( camera );
    controls.addEventListener('change', render);

    /****************
     * Mouse events
     ****************/

    // Create the event for tile change
    tileChange = new CustomEvent("tilechange");
    document.body.addEventListener('tilechange', render);

    /***************
     * Object code
     ***************/

    // Projection code
    img = document.getElementById("projection");
    projectionCanvas = document.createElement('canvas');
    projectionContext = projectionCanvas.getContext('2d');

    projectionCanvas.width = img.width;
    projectionCanvas.height = img.height;
    projectionContext.drawImage(img, 0, 0, img.width, img.height);

    // Height_map code
    heightMap = document.getElementById("height_map");
    heightCanvas = document.createElement('canvas');
    heightContext = heightCanvas.getContext('2d');

    heightCanvas.width = heightMap.width;
    heightCanvas.height = heightMap.height;
    heightContext.drawImage(heightMap, 0, 0, heightMap.width, heightMap.height);

    // Create the hexasphere
    hexasphere = new Hexasphere(BASE_HEIGHT, RESOLUTION, HEX_SIZE);

    // Parsing color and height for each tile
    for (var i = 0; i < hexasphere.tiles.length; i++) {
        var t = hexasphere.tiles[i];
        var latLon = t.getLatLon(hexasphere.radius);

        // Parse the color and the height
        var color = new THREE.Color(getPixelAround(latLon.lat, latLon.lon, 5));
        var ratio = getGrayScaleAround(latLon.lat, latLon.lon, 5);
        t.baseColor = color;
        t.color = color;
        t.height = MIN_HEIGHT + HEIGHT_RANGE * ratio;
    }

    for (var i = 0; i < hexasphere.tiles.length; i++) {
        var t = hexasphere.tiles[i];
        reshapeTile(t);
    };

    for (var i = 0; i < hexasphere.tiles.length; i++) {

        var t = hexasphere.tiles[i];

        // Create the geometry for each tile
        var geometry = new THREE.Geometry();
        for (var j = 0; j < t.boundary.length; j++) {
            var bp = t.boundary[j];
            geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
        }
        geometry.vertices.push(new THREE.Vector3(t.boundary[0].x, t.boundary[0].y, t.boundary[0].z));

        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.faces.push(new THREE.Face3(0, 2, 3));
        geometry.faces.push(new THREE.Face3(0, 3, 4));
        geometry.faces.push(new THREE.Face3(0, 4, 5));

        // Create the material
        var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: t.color});

        // Create the tile and add it to the scene.
        var tilemesh = new THREE.Mesh(geometry, material);
        tilemesh.id = i;
        t.mesh = tilemesh;
        scene.add(tilemesh);

        // Also add it to meshsphere
        meshSphere.push(tilemesh);

    };

    console.log(meshSphere);

    // Set up temporaries variables
    lastID = 0;
    lastTile = hexasphere.tiles[0];
    lastMesh = meshSphere[0];

    //update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    //calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );

    console.log(intersects);

    // Render the first frame
    render();


}

/**
 * Changes the state of objects inside the program
 */
function animate(){
    requestAnimationFrame( animate );

    // Reset all triggers
    resetTrigers();

    // Update changes from TrackingBalls
    controls.update();

    //update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    //calculate objects intersecting the picking ray
    intersects = raycaster.intersectObjects( scene.children );

    if (intersects.length > 0) {
        // Take the id of the first intersected object
        selectedID = intersects[0].object.id-3;
        selectedTile = hexasphere.tiles[selectedID];

        // Change color if it's a different tile
        if (selectedID != lastID) {

            // Tile has changed, remove the old tile
            scene.remove(selectedMesh);

            // Create the geometry for the selected tile
            var geometry = new THREE.Geometry();
            for (var j = 0; j < selectedTile.boundary.length; j++) {
                var bp = selectedTile.boundary[j];
                geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
            }
            geometry.vertices.push(new THREE.Vector3(selectedTile.boundary[0].x, selectedTile.boundary[0].y, selectedTile.boundary[0].z));

            geometry.faces.push(new THREE.Face3(0, 1, 2));
            geometry.faces.push(new THREE.Face3(0, 2, 3));
            geometry.faces.push(new THREE.Face3(0, 3, 4));
            geometry.faces.push(new THREE.Face3(0, 4, 5));

            // Create the material
            var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0xFFDF00});

            // Create the tile and add it to the scene.
            selectedMesh = new THREE.Mesh(geometry, material);
            scene.add(selectedMesh);

            // Render the scene and then remove the tile
            //document.body.dispatchEvent(tileChange);
            lastID = selectedID;

            // Render the scene and then remove the tile

        }
    }

    if (determineRender()) {
        render();
    }
}

/**
 * Render the Scene
 */
function render() {
    updateTiles();
    renderer.render( scene, camera );
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mouseup', onMouseUp, true );
window.requestAnimationFrame(render);