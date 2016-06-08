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
        t.fallout *= Math.pow((1/2), (1/30));
        t.calculateColor();
        t.mesh.material.color = t.color;
    }
}