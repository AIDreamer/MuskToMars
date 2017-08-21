/**
 * Created by Son Pham on 6/8/2016.
 */

/////////////////////
// Demo Tile Function
/////////////////////

function burn(tileID) {
    var t = hexasphere.tiles[tileID];
    t.fallout += 10;

    for (var i = 0; i < t.neighbors.length; i++) {
        hexasphere.tiles[t.neighbors[i]].fallout += 8;
    }
}

function updateTiles() {
    for (var i = 0; i < hexasphere.tiles.length; i++) {
        var t = hexasphere.tiles[i];

        // Update status
        t.fallout *= Math.pow((1/2), (1/30));

        // Change mesh if needed
        if (t.meshChange == true) {
            //var id = t.mesh.index;
            t.meshChange = false;
            if (t.grass == true) {
                scaleTile(t, 1 + GRASS_RISE / BASE_HEIGHT);
            } else if (t.ice == true) {
                scaleTile(t, 1 + ICE_RISE / BASE_HEIGHT);
            } else if (t.water == true) {
                if (t.landAround()) scaleTile(t, 1 + SAND_RANGE / BASE_HEIGHT);
                else if (t.height - WATER_BASE + SAND_RANGE > 0)  scaleTile(t, 1 + (t.height - WATER_BASE + SAND_RANGE) / BASE_HEIGHT);
                else scaleTile(t, 1 + WATER_RISE / BASE_HEIGHT);
            } else {
                scaleTile(t, 1 + BASE_RISE / BASE_HEIGHT);
            }
        }
        t.mesh.geometry.computeFaceNormals();

        // Calculate color
        t.mesh.material.color = t.color;
        t.calculateColor();
    }
}