var Hexasphere = function(radius, numDivisions, hexSize){

    this.radius = radius;
    var tao = 1.61803399;
    var corners = [
        new Point(1000, tao * 1000, 0),
        new Point(-1000, tao * 1000, 0),
        new Point(1000,-tao * 1000,0),
        new Point(-1000,-tao * 1000,0),
        new Point(0,1000,tao * 1000),
        new Point(0,-1000,tao * 1000),
        new Point(0,1000,-tao * 1000),
        new Point(0,-1000,-tao * 1000),
        new Point(tao * 1000,0,1000),
        new Point(-tao * 1000,0,1000),
        new Point(tao * 1000,0,-1000),
        new Point(-tao * 1000,0,-1000)
    ];

    var points = {};

    for(var i = 0; i< corners.length; i++){
        points[corners[i]] = corners[i];
    }

    var faces = [
        new Face(corners[0], corners[1], corners[4], false),
        new Face(corners[1], corners[9], corners[4], false),
        new Face(corners[4], corners[9], corners[5], false),
        new Face(corners[5], corners[9], corners[3], false),
        new Face(corners[2], corners[3], corners[7], false),
        new Face(corners[3], corners[2], corners[5], false),
        new Face(corners[7], corners[10], corners[2], false),
        new Face(corners[0], corners[8], corners[10], false),
        new Face(corners[0], corners[4], corners[8], false),
        new Face(corners[8], corners[2], corners[10], false),
        new Face(corners[8], corners[4], corners[5], false),
        new Face(corners[8], corners[5], corners[2], false),
        new Face(corners[1], corners[0], corners[6], false),
        new Face(corners[11], corners[1], corners[6], false),
        new Face(corners[3], corners[9], corners[11], false),
        new Face(corners[6], corners[10], corners[7], false),
        new Face(corners[3], corners[11], corners[7], false),
        new Face(corners[11], corners[6], corners[7], false),
        new Face(corners[6], corners[0], corners[10], false),
        new Face(corners[9], corners[1], corners[11], false)
    ];

    var getPointIfExists = function(point){
        if(points[point]){
            // console.log("EXISTING!");
            return points[point];
        } else {
            // console.log("NOT EXISTING!");
            points[point] = point;
            return point;
        }
    };


    var newFaces = [];

    for(var f = 0; f< faces.length; f++){
        // console.log("-0---");
        var prev = null;
        var bottom = [faces[f].points[0]];
        var left = faces[f].points[0].subdivide(faces[f].points[1], numDivisions, getPointIfExists);
        var right = faces[f].points[0].subdivide(faces[f].points[2], numDivisions, getPointIfExists);
        for(var i = 1; i<= numDivisions; i++){
            prev = bottom;
            bottom = left[i].subdivide(right[i], i, getPointIfExists);
            for(var j = 0; j< i; j++){
                var nf = new Face(prev[j], bottom[j], bottom[j+1]);
                newFaces.push(nf);

                if(j > 0){
                    nf = new Face(prev[j-1], prev[j], bottom[j]);
                    newFaces.push(nf);
                }
            }
        }
    }

    this.faces = newFaces;

    var newPoints = {};
    for(var p in points){
        var np = points[p].project(radius);
        newPoints[np] = np;
    }

    this.points = newPoints;

    // Tile
    this.tiles = [];

    for(var p in points){
        this.tiles.push(new Tile(points[p], hexSize));
    }

    // Cleanup the ID of all faces
    this.faces.forEach(function(f) {
        f.id -= 20; // First 20 faces no longer valuable
    });

    // Calculate neighbor matrix
    var faceMatrix = new Array(this.faces.length).fill(0);
    for (var i = 0; i < this.tiles.length; i++) {
        this.tiles[i].faces.forEach(function(f){
            if (faceMatrix[f.id] == 0) {
                faceMatrix[f.id] = [];
            }
            faceMatrix[f.id].push(i);
        });
    }

    var faceWithTwo = 0;
    // Figure out adjacent tiles using the created matrix
    for (var i = 0; i < faceMatrix.length; i++) {
        var f = faceMatrix[i];
        if (f.length == 2) {
            f.push(0)
        }
        this.tiles[f[0]].neighbors.add(f[1]);
        this.tiles[f[0]].neighbors.add(f[2]);
        this.tiles[f[1]].neighbors.add(f[0]);
        this.tiles[f[1]].neighbors.add(f[2]);
        this.tiles[f[2]].neighbors.add(f[0]);
        this.tiles[f[2]].neighbors.add(f[1]);
    }

    // Convert sets back to array
    for (var i = 0; i < this.tiles.length; i++) {
        this.tiles[i].neighbors = Array.from(this.tiles[i].neighbors);
    }

    // Calculate pointWiseNeighbors (Only possible if hexSize = 1
    if (hexSize == 1) {
        for (var i = 0; i < this.tiles.length; i++) {
            var t = this.tiles[i];

            for (var j = 0; j < t.boundary.length; j++) {
                t.pointWiseNeighbors.push([]);
                var p = t.boundary[j]

                for (var k = 0; k < t.neighbors.length; k++) {
                    var nb_t = this.tiles[t.neighbors[k]];

                    for (var l = 0; l < nb_t.boundary.length; l++) {
                        var nb_p = nb_t.boundary[l];

                        if ((p.x == nb_p.x) && (p.y == nb_p.y) && (p.z == nb_p.z)) {
                            t.pointWiseNeighbors[j].push(t.neighbors[k]);
                        }
                    }
                }
            }
        }
    }
};