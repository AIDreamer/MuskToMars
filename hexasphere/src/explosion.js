/**
 * Created by Son Pham on 7/9/2016.
 */

/**
 * Initiate an explosion effect
  * @constructor
 */
var Explosion = function(point) {
    this.timecount = 0;
    this.position = point;
    this.mesh = this.createMesh();
};

/**
 * Create an explosion mesh
 */
Explosion.prototype.createMesh = function() {
    // Create the ball
    var geometry = new THREE.SphereGeometry( EXPL_SMALL_SIZE, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff, transparent: true, opacity: 1} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh = sphere;
    scene.add( sphere );
    return sphere;
};

/**
 * Render the next frame
 */
Explosion.prototype.nextFrame = function() {
    this.timecount += 1;
    this.mesh.scale.x += (EXPL_BIG_SIZE - EXPL_SMALL_SIZE) / EXPL_TIME;
    this.mesh.scale.y += (EXPL_BIG_SIZE - EXPL_SMALL_SIZE) / EXPL_TIME;
    this.mesh.scale.z += (EXPL_BIG_SIZE - EXPL_SMALL_SIZE) / EXPL_TIME;
    this.mesh.material.opacity -= 1.0 / EXPL_TIME
    console.log(this.mesh.material.opacity);
}

/**
 * Check if it is the end of the animation
 * @returns {boolean}
 */
Explosion.prototype.endAnimation = function() {
    return this.timecount >= EXPL_TIME;
}