import { Color } from './trains.js';
import { BridgeSupportTypes } from './bridge_support.js';
export class BridgePiers {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        this.start_of_arc = null;
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.Piers) {
            return;
        }
        console.log('Randomized generation of bridge piers');
        this.lower_width = this.rand.rint(5, 30);
        this.upper_width = this.rand.rint(3, 20);
        if (this.project.bridge_support.height_over_span == 0 && this.rand.rbool()) {
            this.start_of_arc = this.rand.rint(landscape.start_pos.y + 20, Math.min(this.project.ch, landscape.start_pos.y + 20));
        }
        let greyness_lvl = this.rand.rint(0, 200);
        this.pier_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
    }
    draw(ctx, debug = false) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.Piers) {
            return;
        }
        for (let i = 0; i < this.project.bridge_support.num_piers; i++) {
            ctx.beginPath();
            ctx.fillStyle = this.pier_color.rgb();
            let top_pos = this.project.bridge_support.pier_top_pos[i];
            ctx.moveTo(top_pos.x - this.upper_width / 2, top_pos.y);
            ctx.lineTo(top_pos.x + this.upper_width / 2, top_pos.y);
            ctx.lineTo(top_pos.x + this.lower_width / 2, this.project.ch);
            ctx.lineTo(top_pos.x - this.lower_width / 2, this.project.ch);
            ctx.moveTo(top_pos.x - this.upper_width / 2, top_pos.y);
            ctx.fill();
            if (this.start_of_arc != null) {
                this.draw_arc(ctx, top_pos, this.project.bridge_support.spacing / 2);
                this.draw_arc(ctx, top_pos, -this.project.bridge_support.spacing / 2);
            }
        }
    }
    draw_arc(ctx, pier, direction) {
        ctx.beginPath();
        ctx.fillStyle = this.pier_color.rgb();
        ctx.moveTo(pier.x, this.start_of_arc);
        ctx.arcTo(pier.x, pier.y, pier.x + direction, pier.y, Math.abs(direction));
        ctx.lineTo(pier.x, pier.y);
        ctx.fill();
    }
}
