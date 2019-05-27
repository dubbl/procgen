import {BridgeProject, Drawable, SeededRandomSource, Color, Pos} from './trains.js';
import {Landscape} from './landscape.js';
import { BridgeSupportTypes } from './bridge_support.js';

export class BridgeBracedFrames implements Drawable {
    public area: [][];
    public area_size: number;
    public num_elements: number;
    public outer_color: Color;
    public inner_color: Color;

    constructor(readonly project: BridgeProject, readonly rand: SeededRandomSource) {
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }

    private randomize(landscape: Landscape) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.BracedFrames) {
            return;
        }
        console.log('Randomized generation of braced frames');
        this.area_size = this.rand.rint(1, 200);
        if (this.rand.rbool()) {
            this.num_elements = this.rand.rint(this.area_size, this.area_size * this.area_size);
        } else if (this.rand.rbool()) {
            this.num_elements = this.area_size;
        } else {
            this.num_elements = this.area_size * this.area_size;
        }
        let greyness_lvl = this.rand.rint(0, 200);
        this.outer_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        greyness_lvl = this.rand.rint(0, 200);
        this.inner_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
    }

    public draw(ctx: CanvasRenderingContext2D, debug: boolean = false) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.BracedFrames) {
            return;
        }
    }
}
