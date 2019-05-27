import { Pos } from './trains.js';
// import { BridgeBracedFrames } from './bridge_braced_frames.js';
export var BridgeSupportTypes;
(function (BridgeSupportTypes) {
    BridgeSupportTypes[BridgeSupportTypes["Piers"] = 0] = "Piers";
    BridgeSupportTypes[BridgeSupportTypes["BracedFrames"] = 1] = "BracedFrames";
})(BridgeSupportTypes || (BridgeSupportTypes = {}));
export class BridgeSupport {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        this.invisible_piers = 0;
        this.height_over_span = 0;
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        console.log('Randomized generation of bridge support');
        this.num_piers = this.rand.rint(0, 20);
        if (this.num_piers == 0)
            return;
        if (this.num_piers % 2 == 0 && this.rand.rbool(0.4)) {
            // add "invisible" piers in the middle if even number of piers
            this.invisible_piers = this.rand.rint(0, 40);
        }
        this.spacing = (this.project.cw - (landscape.side_buffer * 2)) / (this.num_piers + this.invisible_piers + 1);
        let space_over_span = this.project.landscape.start_pos.y;
        if (this.rand.rbool(0.7) && space_over_span > 90 && this.num_piers < 5) {
            this.height_over_span = this.rand.rint(80, space_over_span - 10);
        }
        this.pier_top_pos = new Array(this.num_piers);
        for (let i = 0; i < this.num_piers; i++) {
            if (i % 2 == 0) {
                // even piers on the right
                this.pier_top_pos[i] = new Pos((this.spacing * (i + 1)) + this.project.landscape.side_buffer, this.project.landscape.start_pos.y - this.height_over_span);
            }
            else {
                // uneven piers on the left
                this.pier_top_pos[i] = new Pos(this.project.cw - this.project.landscape.side_buffer - (this.spacing * i), this.project.landscape.start_pos.y - this.height_over_span);
            }
        }
        if (this.rand.rbool()) {
            this.support_type = BridgeSupportTypes.Piers;
        }
        else {
            this.support_type = BridgeSupportTypes.BracedFrames;
        }
    }
    draw(ctx, debug = false) {
    }
}
