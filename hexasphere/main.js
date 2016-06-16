$(window).load(function() {

    var camera, controls, scene, renderer;

    // Hex variable
    var hexasphere = new Hexasphere(30, 5,.4);
    var width = $(window).innerWidth();
    var height = $(window).innerHeight() - 10;

    // Renderer code
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor( 0xffffff, 1 );
    renderer.setSize(width, height);

    // Camera code
    var cameraDistance = 65;
    var camera = new THREE.PerspectiveCamera(cameraDistance, width / height, 1, 100);
    camera.position.z = -cameraDistance;

    // Scene and fog code
    var scene = new THREE.Scene();

    //scene.fog = new THREE.Fog(0x000000, cameraDistance * .4, cameraDistance * 1.2);

    // Projection code
    var img = document.getElementById("projection");
    var projectionCanvas = document.createElement('canvas');
    var projectionContext = projectionCanvas.getContext('2d');

    projectionCanvas.width = img.width;
    projectionCanvas.height = img.height;
    projectionContext.drawImage(img, 0, 0, img.width, img.height);

    var pixelData = null;

    var maxLat = -100;
    var maxLon = 0;
    var minLat = 0;
    var minLon = 0;

    var isLand = function (lat, lon) {

        var x = parseInt(img.width * (lon + 180) / 360);
        var y = parseInt(img.height * (lat + 90) / 180);

        if (pixelData == null) {
            pixelData = projectionContext.getImageData(0, 0, img.width, img.height);
        }
        return pixelData.data[(y * pixelData.width + x) * 4] === 0;
    };

    var getPixelAround = function (lat, lon, around) {

        var x = parseInt(img.width * (lon + 180) / 360);
        var y = parseInt(img.height * (lat + 90) / 180);

        if (pixelData == null) {
            pixelData = projectionContext.getImageData(0, 0, img.width, img.height);
        }

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

    var getPixelColor = function (lat, lon) {

        var x = parseInt(img.width * (lon + 180) / 360);
        var y = parseInt(img.height * (lat + 90) / 180);

        if (pixelData == null) {
            pixelData = projectionContext.getImageData(0, 0, img.width, img.height);
        }
        return pixelData.data[(y * pixelData.width + x) * 4] * 256 * 256 + pixelData.data[(y * pixelData.width + x) * 4 + 1] * 256 + pixelData.data[(y * pixelData.width + x) * 4 + 2];

    };

    var meshMaterials = [];
    meshMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0xFF6E39}));
    meshMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0xFF6E39}));
    meshMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0xE56333}));
    meshMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0xBF532B}));
    meshMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0x7F371C}));

    var seaMaterials = [];
    seaMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0x4298EB}));
    seaMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0x4298EB}));
    seaMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0x3B87D1}));
    seaMaterials.push(new THREE.MeshBasicMaterial({side: THREE.CullFaceFront, color: 0x306EAB}));

    var color;
    var material;

    var lineMaterial = new THREE.LineBasicMaterial({color: 0x00eeee, linewidth: 1, opacity: 1});

    for (var i = 0; i < hexasphere.tiles.length; i++) {
        var t = hexasphere.tiles[i];
        var latLon = t.getLatLon(hexasphere.radius);

        var geometry = new THREE.Geometry();

        for (var j = 0; j < t.boundary.length; j++) {
            var bp = t.boundary[j];
            geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
        }
        geometry.vertices.push(new THREE.Vector3(t.boundary[0].x, t.boundary[0].y, t.boundary[0].z));

        color = getPixelAround(latLon.lat, latLon.lon, 5);
        material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: color});

        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.faces.push(new THREE.Face3(0, 2, 3));
        geometry.faces.push(new THREE.Face3(0, 3, 4));
        geometry.faces.push(new THREE.Face3(0, 4, 5));

        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

    }

    // Add the tree
    // instantiate a loader
    // instantiate a loader
    // Make treeMesh looking at Tile 1
    var tile1 = hexasphere.tiles[3];
    var loader = new THREE.JSONLoader();
    var treeMesh = [];
    var object;
    var focalPoint = new THREE.Vector3(tile1.centerPoint.x, tile1.centerPoint.y, tile1.centerPoint.z);

    // load the tree trunk
    loader.load(
        // resource URL
        '../assets/treetrunk.json',
        // Function when resource is loaded
        function ( geometry, materials ) {
            var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x7F4F2B});
            object = new THREE.Mesh( geometry, material );
            object.lookAt(focalPoint);
            //object.up = new THREE.Vector3(0,0,1);
            object.translateX(tile1.centerPoint.x);
            object.translateY(tile1.centerPoint.Y);
            object.translateZ(tile1.centerPoint.Z);
            treeMesh.push(object);
            scene.add( object );
        }
    );

    // load the tree trunk
    loader.load(
        // resource URL
        '../assets/treeleaves.json',
        // Function when resource is loaded
        function ( geometry, materials ) {
            var material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x277F4B});
            object = new THREE.Mesh( geometry, material );
            object.up = new THREE.Vector3(0,0,1);
            object.lookAt(focalPoint);
            object.translateX(tile1.centerPoint.x);
            object.translateY(tile1.centerPoint.Y);
            object.translateZ(tile1.centerPoint.Z);
            treeMesh.push(object);
            scene.add( object );
        }
    );

    console.log(treeMesh);

    // Rotate the thing
    var startTime = Date.now();
    var lastTime = Date.now();
    var cameraAngle = 0;

    var tick = function(){
        var dt = Date.now() - lastTime;

        var rotateCameraBy = (2 * Math.PI)/(100000/dt);
        cameraAngle += rotateCameraBy;

        lastTime = Date.now();

        camera.position.x = cameraDistance * Math.cos(cameraAngle);
        camera.position.y = Math.sin(cameraAngle)* 10;
        camera.position.z = cameraDistance * Math.sin(cameraAngle);
        camera.lookAt( scene.position );

        renderer.render( scene, camera );

        requestAnimationFrame(tick);
    };

    // Resize

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    $("#container").append(renderer.domElement);
    requestAnimationFrame(tick);
    window.hexasphere = hexasphere;

});
