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
    for (img_i = x - around; img_i < x + around; img_i++) {
        for (img_j = y - around; img_j < y + around; img_j++) {
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

//////////////////////
// Global variables
//////////////////////

var camera, controls, scene, renderer;
var img, projectionContext, projectionCanvas;
var pixelData;

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

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
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
    scene.fog = new THREE.Fog(0x000000, cameraDistance * .4, cameraDistance * 1.2);

    // Trackball
    controls = new THREE.TrackballControls( camera );
    controls.addEventListener('change', render);

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

    // Create the hexasphere
    var hexasphere = new Hexasphere(30, 2, 1);
    console.log(hexasphere);
    for (var i = 0; i < hexasphere.tiles.length; i++) {
        console.log(i, hexasphere.tiles[i].neighbors);
    }

    // Parsing color for each tile
    for (var i = 0; i < hexasphere.tiles.length; i++) {
        var t = hexasphere.tiles[i];
        var latLon = t.getLatLon(hexasphere.radius);

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

        // Parse color and add it to the material.
        var color = getPixelAround(latLon.lat, latLon.lon, 5);
        var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: color});

        // Create the tile and add it to the scene.
        var tilemesh = new THREE.Mesh(geometry, material);
        scene.add(tilemesh);

        // Create the sprite that shows
        var sprite = makeTextSprite( " " + i + " ", { fontsize: 32, backgroundColor: {r:255, g:100, b:100, a:1} } );
        sprite.position = t.centerPoint;
        scene.add(sprite);
    }

    // Create the sprite that shows
    var sprite = makeTextSprite( " " + "special 1" + " ", { fontsize: 32, backgroundColor: {r:255, g:100, b:100, a:1} } );
    sprite.position = hexasphere.tiles[0].faces[0].centroid;
    scene.add(sprite);

    var mesh = new THREE.Mesh( geometry, material);
    scene.add(mesh);

    // Render the first frame
    render();

}

function animate(){
    requestAnimationFrame( animate );
    controls.update();
}

function render() {
    renderer.render( scene, camera );
}

