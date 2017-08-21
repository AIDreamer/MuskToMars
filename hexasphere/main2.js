//////////////////////
// Global variables
//////////////////////

// window variable
var width,height;

// Scene variables
var camera, controls, scene, renderer;

// Tree storing variables
var tree_loader;
var tree_mesh = [];

// Image projection variables
var img, projectionContext, projectionCanvas, pixelData;
var heightMap, heightContext, heightCanvas, heightData;
var iceMap, iceContext, iceCanvas, iceData;

// Hexasphere variable
var hexasphere;
var meshSphere = []; // Store all the mesh in the hexasphere
var tileList;

// Sky variables
var sun, sunLight;
var cinematic1, cinematic2;
var sunCount = 0;
var cineCount1 = SUN_CYCLE / 3;
var cineCount2 = SUN_CYCLE * 2 / 3;
var flare1, flare2, flare3;
var num_flares = 3;

// Events
var tileChange;

// Effects
var effectsList = new EffectsArray();

// Temporary storage variables
var selectedID, selectionMesh, selectedTile, lastID;

// Render variables
var ren_camera = 0;
var ren_tileChange = 0;

// Controler variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector3();

// Function variables
var functionSelected = 'fExplosive';

// Overwatch variables
var textbox;

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

    var x = parseInt(heightMap.width * (lon + 180) / 360);
    var y = parseInt(heightMap.height * (lat + 90) / 180);

    // Pixel data singleton
    if (heightData == null) {
        heightData = heightContext.getImageData(0, 0, heightMap.width, heightMap.height);
    }

    // Parse the color
    var B = 0;
    var totalPixel = Math.pow(around + around, 2);
    for (var img_i = x - around; img_i < x + around; img_i++) {
        for (var img_j = y - around; img_j < y + around; img_j++) {
            B += heightData.data[( ((img_j + heightData.height) % heightData.height) * heightData.width + (img_i % heightData.width)) * 4];
        }
    }

    B = (B / totalPixel) / 255;

    return B;
};

/**
 * Parse pixel of the icemap to get the ice data
 * @param lat
 * @param lon
 * @param around
 * @returns {number}
 */
var getIceScaleAround = function (lat, lon, around) {

    var x = parseInt(iceMap.width * (lon + 180) / 360);
    var y = parseInt(iceMap.height * (lat + 90) / 180);

    // Pixel data singleton
    if (iceData == null) {
        iceData = iceContext.getImageData(0, 0, iceMap.width, iceMap.height);
    }

    // Parse the color
    var B = 0;
    var totalPixel = Math.pow(around + around, 2);
    for (var img_i = x - around; img_i < x + around; img_i++) {
        for (var img_j = y - around; img_j < y + around; img_j++) {
            B += iceData.data[( ((img_j + iceData.height) % iceData.height) * iceData.width + (img_i % iceData.width)) * 4];
        }
    }
    B = (B / totalPixel) / 255;

    return B;
};

function scaleTileHeight(tile, height) {
    scaleTile(tile, height / BASE_HEIGHT);
}

/**
 * Average 3 points
 */
function avg3Points(point1, point2, point3) {
    var x = (point1.x + point2.x + point3.x) / 3.0;
    var y = (point1.y + point2.y + point3.y) / 3.0;
    var z = (point1.z + point2.z + point3.z) / 3.0;
    return new Point(x, y, z);
}

/**
 * Random among three points
 */
function ran3Points(point1, point2, point3) {
    var a = Math.random();
    var b = Math.random();
    if (a + b > 1) {
        a = 1 - a;
        b = 1 - b;
    }
    var x = point1.x + (point2.x - point1.x) * a + (point3.x - point1.x) * b;
    var y = point1.y + (point2.y - point1.y) * a + (point3.y - point1.y) * b;
    var z = point1.z + (point2.z - point1.z) * a + (point3.z - point1.z) * b;
    return new THREE.Vector3(x,y,z);
}

/**
 * Plant a tree at this point
 * @param point
 */
function makeTree(point, t) {
    var scaleX = TREE_BASE_SCALE + Math.random() * TREE_WIDTH_SCALE_RANGE;
    var scaleY = TREE_BASE_SCALE + Math.random() * TREE_HEIGHT_SCALE_RANGE;
    var scaleZ = TREE_BASE_SCALE + Math.random() * TREE_WIDTH_SCALE_RANGE;

    var object = tree_mesh[0].clone();
    object.translateX(point.x);
    object.translateY(point.y);
    object.translateZ(point.z);
    object.scale.set(scaleX, scaleY, scaleZ);
    object.receiveShadow = true;

    var axis = new THREE.Vector3(0, 1, 0);
    object.quaternion.setFromUnitVectors(axis, point.clone().normalize());

    scene.add(object);

    object = tree_mesh[1].clone();

    object.translateX(point.x);
    object.translateY(point.y);
    object.translateZ(point.z);
    object.scale.set(scaleX, scaleY, scaleZ);
    object.receiveShadow = true;

    var axis = new THREE.Vector3(0, 1, 0);
    object.rotateY(Math.random() * 2 * Math.PI);
    object.quaternion.setFromUnitVectors(axis, point.clone().normalize());

    scene.add(object);
}

/**
 * Make tree for all tiles
 */
function makeAllTrees(t) {
    var treeLocs = [];
    var centerPoint = new THREE.Vector3(t.centerPoint.x, t.centerPoint.y, t.centerPoint.z);
    treeLocs.push(ran3Points(centerPoint, t.boundary[0], t.boundary[1]));
    treeLocs.push(ran3Points(centerPoint, t.boundary[1], t.boundary[2]));
    treeLocs.push(ran3Points(centerPoint, t.boundary[2], t.boundary[3]));
    treeLocs.push(ran3Points(centerPoint, t.boundary[3], t.boundary[4]));

    if (t.boundary.length = 6) {
        treeLocs.push(ran3Points(centerPoint, t.boundary[4], t.boundary[5]));
        treeLocs.push(ran3Points(centerPoint, t.boundary[5], t.boundary[0]));
    } else {
        treeLocs.push(ran3Points(centerPoint, t.boundary[4], t.boundary[0]));
    }

    for (var i = 0; i < treeLocs.length; i++) {
        makeTree(treeLocs[i], t); // Center tree
    }
}

/**
 * Show the index of the tile
 */
function showTileIndex() {
    for (var i = 0; i < tileList.length; i++) {
        var t = tileList[i];

        // Create the sprite that shows
        var sprite = makeTextSprite(" " + i + " ", {fontsize: 32, backgroundColor: {r: 255, g: 100, b: 0, a: 1}});
        sprite.position = t.centerPoint;
        scene.add(sprite);
    }
}

/**
 * Add a new light using HSL color coding and XYZ position, along with intensity
 * @param h
 * @param s
 * @param l
 * @param x
 * @param y
 * @param z
 * @param intensity
 * @returns {THREE.PointLight}
 */
function addLight( h, s, l, x, y, z, intensity ) {

    var light = new THREE.PointLight( 0xffffff, intensity, 2000 );
    light.color.setHSL( h, s, l );
    light.position.set( x, y, z );
    //light.castShadow = true;
    scene.add( light );

    return light;
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

function onMouseUp(e) {
    ['fExplosive', 'fMirror0', 'fMirror1', 'fMirror2', 'fMeteor0', 'fMeteor1', 'fMeteor2', 'fPyrolysis','fLife']
    switch (functionSelected) {
        case 'fExplosive':
            fExplosive(0, selectedID);
            break;
        case 'fMirror0':
            fMirror0();
            break;
        case 'fMirror1':
            //fMirror1();
            break;
        case 'fMirror2':
            //fMirror2(selectedID);
            break;
        case 'fMeteor0':
            //fMeteor0(selectedID);
            break;
        case 'fMeteor1':
            //fMeteor1();
            break;
        case 'fMeteor2':
            //fMeteor2();
            break;
        case 'fPyrolysis':
            //fPyrolysis(selectedID);
            break;
        case 'fLife':
            break;
    }

    //burn(selectedID);
    console.log("Click ", selectedID);
    console.log(scene);
}

function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

};

document.addEventListener("DOMContentLoaded", function () {
////////////////////
// Three.js code
////////////////////

    loadTexture();

    function loadTexture() {
        // lens flares
        var textureLoader = new THREE.TextureLoader();

        flare1 = textureLoader.load( "../mars_texture/lensflare0.png", finishLoad );
        flare2 = textureLoader.load( "../mars_texture/lensflare2.png", finishLoad );
        flare3 = textureLoader.load( "../mars_texture/lensflare3.png", finishLoad );
    }

    function finishLoad() {
        num_flares -= 1;
        if (num_flares == 0) {
            init();
            animate();
        }
    }

    /** Initialize stuffs */
    function init() {

        /***************s
         * Renderer code
         ***************/
        width = window.innerWidth;
        height = window.innerHeight - 10;

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setSize(width, height);
        renderer.setClearColor(SKY_COLOR, 1);
        renderer.shadowMap.enabled = true;
        renderer.sortObjects = false;
        document.body.appendChild(renderer.domElement);

        /***************
         * Scene, camera and trackball code
         ***************/

        // Camera
        var cameraDistance = 65;
        camera = new THREE.PerspectiveCamera(cameraDistance, width / height, 1, 10000000);
        camera.position.z = -cameraDistance;

        // Scene and fog code
        scene = new THREE.Scene();
        scene.castShadow = true;
        //scene.fog = new THREE.Fog(SKY_COLOR, cameraDistance * .2, cameraDistance * 2);

        // Trackball
        controls = new THREE.TrackballControls(camera);
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

        // Tree code
        tree_loader = new THREE.JSONLoader();
        var model = tree_loader.parse(treechunk);
        var material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color: 0x7F4F2B});
        var mesh = new THREE.Mesh(model.geometry, material);
        tree_mesh.push(mesh);

        model = tree_loader.parse(treeleaves);
        material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color: LEAF_COLOR});
        var mesh = new THREE.Mesh(model.geometry, material);
        tree_mesh.push(mesh);

        flare1 = document.getElementById("flare1");
        flare2 = document.getElementById("flare2");
        flare3 = document.getElementById("flare3");

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

        // Ice map code

        iceMap = document.getElementById("ice_map");
        iceCanvas = document.createElement('canvas');
        iceContext = iceCanvas.getContext('2d');

        iceCanvas.width = iceMap.width;
        iceCanvas.height = iceMap.height;
        iceContext.drawImage(iceMap, 0, 0, iceMap.width, iceMap.height);

        // Create the hexasphere
        hexasphere = new Hexasphere(BASE_HEIGHT, RESOLUTION, HEX_SIZE);
        tileList = hexasphere.tiles;

        // Parsing color and height for each tile
        for (var i = 0; i < tileList.length; i++) {
            var t = tileList[i];
            var latLon = t.getLatLon(hexasphere.radius);

            // Parse the color and the height
            var color = new THREE.Color(getPixelAround(latLon.lat, latLon.lon, 5));
            var ratio = getGrayScaleAround(latLon.lat, latLon.lon, 5);
            t.baseColor = color;
            t.color = t.baseColor;
            t.height = MIN_HEIGHT + HEIGHT_RANGE * ratio;
        }

        // Reshape all tiles according to their height
        for (var i = 0; i < tileList.length; i++) {
            var t = tileList[i];

            t.reshape();
            if (t.height > ICE_BASE) t.ice = true;
            else if (t.height > TREE_BASE) {
                t.grass = true;
                t.plant = true;
            } else if (t.height < WATER_BASE) {
                t.water = true;
            }
        };

        for (var i = 0; i < tileList.length; i++) {

            var t = tileList[i];

            // Create the geometry for each tile
            var geometry = new THREE.Geometry();
            for (var j = 0; j < t.boundary.length; j++) {
                var bp = t.boundary[j];
                geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
            }

            for (var j = 0; j < t.boundary.length; j++) {
                var bp = t.boundary[j];
                geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
            }

            if (t.boundary.length == 5) {
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(0, 2, 3));
                geometry.faces.push(new THREE.Face3(0, 3, 4));

                geometry.faces.push(new THREE.Face3(0, 1, 6));
                geometry.faces.push(new THREE.Face3(0, 6, 5));

                geometry.faces.push(new THREE.Face3(1, 2, 7));
                geometry.faces.push(new THREE.Face3(1, 7, 6));

                geometry.faces.push(new THREE.Face3(2, 3, 8));
                geometry.faces.push(new THREE.Face3(2, 8, 7));

                geometry.faces.push(new THREE.Face3(3, 4, 9));
                geometry.faces.push(new THREE.Face3(3, 9, 8));

                geometry.faces.push(new THREE.Face3(4, 0, 5));
                geometry.faces.push(new THREE.Face3(4, 5, 9));

            } else {
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(0, 2, 3));
                geometry.faces.push(new THREE.Face3(0, 3, 4));
                geometry.faces.push(new THREE.Face3(0, 4, 5));

                geometry.faces.push(new THREE.Face3(0, 1, 7));
                geometry.faces.push(new THREE.Face3(0, 7, 6));

                geometry.faces.push(new THREE.Face3(1, 2, 8));
                geometry.faces.push(new THREE.Face3(1, 8, 7));

                geometry.faces.push(new THREE.Face3(2, 3, 9));
                geometry.faces.push(new THREE.Face3(2, 9, 8));

                geometry.faces.push(new THREE.Face3(3, 4, 10));
                geometry.faces.push(new THREE.Face3(3, 10, 9));

                geometry.faces.push(new THREE.Face3(4, 5, 11));
                geometry.faces.push(new THREE.Face3(4, 11, 10));

                geometry.faces.push(new THREE.Face3(5, 0, 6));
                geometry.faces.push(new THREE.Face3(5, 6, 11));
            }


            var material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color: t.color});

            // Create the tile and add it to the scene.
            geometry.computeFaceNormals();

            var tilemesh = new THREE.Mesh(geometry, material);
            tilemesh.receiveShadow = true;
            t.mesh = tilemesh;
            scene.add(tilemesh);
            meshSphere.push(tilemesh);

            // Determine the front
            var matrix = new THREE.Matrix4();
            matrix.extractRotation(tilemesh.matrix);

            var direction = new THREE.Vector3(0, 0, 1);
            direction = direction.applyMatrix4(matrix);

        };

        //Construct tree models
        //TODO: This code won't be official since tree grows
        for (var i = 0; i < tileList.length; i++) {
            var t = tileList[i];
            if (t.plant == true) {
                makeAllTrees(t);
            };
        }

        // Add the tree and water
        for (var i = 0; i < tileList.length; i++) {
            var t = tileList[i];
            t.meshChange = true;
        }

        // Set up temporaries variables
        lastID = 0;
        lastTile = tileList[0];
        lastMesh = meshSphere[0];

        /*********
         * SHADERS
         *********/

        cinematic1 = addLight( 0.55, 0.2, 0.5, 0, 33, 100, 2 );
        cinematic2 = addLight( 0.55, 0.2, 0.5, 0, -33, 100,1.1 );
        sunLight = addLight( 0.55, 0.2 , 0.5, 0, 0, -LIGHT_RADIUS,6 );

        var ambientLight = new THREE.AmbientLight( 0xffffff,.4 ); // soft white light
        scene.add( ambientLight );

        // Add a sun to look like it is shining in to the model
        var geometry = new THREE.SphereGeometry(SUN_SIZE, 50, 50);
        var material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        sun = new THREE.Mesh(geometry, material);
        sun.position.set(0, 0, SUN_RADIUS);
        scene.add(sun);

        /**********
         * HUD Code
         **********/

        d3.select("#menu").selectAll('button')
            .data(['fExplosive', 'fMirror0', 'fMirror1', 'fMirror2', 'fMeteor0', 'fMeteor1', 'fMeteor2', 'fPyrolysis','fLife']).enter()
            .append('button')
            .html(function (d) {
                return d; })
            .on('click', function (d) {
                //functionSelected = d;
            });

        /*****************
         * Some late setup
         *****************/

        textBox = document.getElementById("textDiv");
        textBox.textContent = "";

        // Render the first frame
        render();
    }

    /**
     * Changes the state of objects inside the program
     */
    function animate() {
        requestAnimationFrame(animate);

        // Reset all triggers
        resetTrigers();

        // Update changes from TrackingBalls
        controls.update();
        // TODO: Make sure only to render front faces of the tile (CREATE 2 SCENES)

        //update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        //calculate objects intersecting the picking ray
        intersects = raycaster.intersectObjects(meshSphere);

        if (intersects.length > 0) {
            // Take the id of the first intersected object
            selectedID = intersects[0].object.id - TILE_SELECTION_OFFSET;
            selectedTile = tileList[selectedID];

            // Change color if it's a different tile
            if (selectedID != lastID) {
            //    // Tile has changed, remove the old tile
            //    scene.remove(selectionMesh);
            //
            //    // Create the geometry for the selected tile
            //    var geometry = new THREE.Geometry();
            //    for (var j = 0; j < selectedTile.boundary.length; j++) {
            //        var bp = selectedTile.mesh.geometry.vertices[j];
            //        geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
            //    }
            //
            //    if (geometry.vertices.length == 6) {
            //        geometry.faces.push(new THREE.Face3(0, 1, 2));
            //        geometry.faces.push(new THREE.Face3(0, 2, 3));
            //        geometry.faces.push(new THREE.Face3(0, 3, 4));
            //        geometry.faces.push(new THREE.Face3(0, 4, 5));
            //    } else {
            //        geometry.faces.push(new THREE.Face3(0, 1, 2));
            //        geometry.faces.push(new THREE.Face3(0, 2, 3));
            //        geometry.faces.push(new THREE.Face3(0, 3, 4));
            //    }
            //
            //
            //    // Create the material
            //    var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0xFFDF00});
            //
            //    // Create the tile and add it to the scene.
            //    selectionMesh = new THREE.Mesh(geometry, material);
            //    scene.add(selectionMesh);
            //
            //    // Render the scene and then remove the tile
            //    //document.body.dispatchEvent(tileChange);
                lastID = selectedID;
            //
            }
        } else {
            lastID = -1;
        }

        var t = hexasphere.tiles[lastID];
        //Update the text to point to the new tile content
        if (lastID == -1) {
            textBox.textContent = "";
        } else {
            //textBox.textContent = t.centerPoint.x + " " + t.centerPoint.y + " " + t.centerPoint.z +
            //    " --- water: " + t.water +
            //    " --- plant: " + t.plant +
            //    " --- altitude: " + t.height +
            //    " --- earthDensity: " + t.earthDensity  +
            //    " --- temperature: " + t.temperature +
            //    " --- atmosphere: " + t.atmP +
            //    " --- oxygen: " + t.oxygenP +
            //    " --- fallout: " + t.fallout;
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
        updateEffects();
        renderer.render(scene, camera);

    }

    //window.addEventListener('mousemove', onMouseMove, false);
    //window.addEventListener('mouseup', onMouseUp, true);
});

////////////////////
// UPDATING FUNCTION
////////////////////

function updateEffects() {
    sunCount += 1;
    cineCount1 += 1;
    cineCount2 += 1;

    var x = Math.sin(Math.PI * 2 * sunCount / SUN_CYCLE) * SUN_RADIUS;
    var z = Math.cos(Math.PI * 2 * sunCount / SUN_CYCLE) * SUN_RADIUS;
    sun.position.set(x, 0 ,z );

    var x = Math.sin(Math.PI * 2 * sunCount / SUN_CYCLE) * LIGHT_RADIUS;
    var z = Math.cos(Math.PI * 2 * sunCount / SUN_CYCLE) * LIGHT_RADIUS;
    sunLight.position.set(x, 0, z);

    var cineX1 = Math.sin(Math.PI * 2 * cineCount1 / SUN_CYCLE) * CINE_RADIUS;
    var cineZ1 = Math.cos(Math.PI * 2 * cineCount1 / SUN_CYCLE) * CINE_RADIUS;
    cinematic1.position.set(cineX1, 0, cineZ1);

    var cineX2 = Math.sin(Math.PI * 2 * cineCount2 / SUN_CYCLE) * CINE_RADIUS;
    var cineZ2 = Math.cos(Math.PI * 2 * cineCount2 / SUN_CYCLE) * CINE_RADIUS;
    cinematic2.position.set(cineX2, 0, cineZ2);

    if (sunCount > SUN_CYCLE) sunCount = 0;
    if (cineCount1 > SUN_CYCLE) cineCount1 = 0;
    if (cineCount2 > SUN_CYCLE) cineCount2 = 0;

    // Keep the explosion going
    effectsList.runEffects();
}