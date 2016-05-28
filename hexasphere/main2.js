var camera, controls, scene, renderer;
var img, projectionContext, projectionCanvas;
var pixelData;

////////////////////
// Utility functions
////////////////////

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
    var hexasphere = new Hexasphere(30, 15, 0.9);

    // Parsing color for each tile
    var color, material; /* Temp  variables*/
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
        color = getPixelAround(latLon.lat, latLon.lon, 5);
        material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: color});

        // Create the tile and add it to the scene.
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

    }

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

