import { Color } from './trains.js';
import { BridgeSupportTypes } from './bridge_support.js';
export class BridgeBracedFrames {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.BracedFrames) {
            return;
        }
        console.log('Randomized generation of braced frames');
        this.area_size = this.rand.rint(1, 200);
        if (this.rand.rbool()) {
            this.num_elements = this.rand.rint(this.area_size, this.area_size * this.area_size);
        }
        else if (this.rand.rbool()) {
            this.num_elements = this.area_size;
        }
        else {
            this.num_elements = this.area_size * this.area_size;
        }
        let greyness_lvl = this.rand.rint(0, 200);
        this.outer_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        greyness_lvl = this.rand.rint(0, 200);
        this.inner_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
    }
    draw(ctx, debug = false) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.BracedFrames) {
            return;
        }
    }
}
