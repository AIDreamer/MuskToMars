/**
 * Created by Son Pham on 7/9/2016.
 */

/**
 * This effect array manages all the weaponized effect of the game
 * @constructor
 */
var EffectsArray = function() {
    this.effectsList = [];
};

/**
 * Add another effect to the list
 * @param effect
 */
EffectsArray.prototype.addEffect = function(effect) {
    this.effectsList.push(effect);
};

/**
 * Remove any effects if it is the end of the animation
 */
EffectsArray.prototype.runEffects = function() {
    for (var i = this.effectsList.length -1; i >= 0; i--) {
        this.effectsList[i].nextFrame();
        if (this.effectsList[i].endAnimation()) {
            scene.remove(this.effectsList[i].mesh);
            this.effectsList.splice(i,1);
        }
    };
};