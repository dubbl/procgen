import { Color } from './trains.js';
export class BridgeCables {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        if (this.project.landscape !== null) {
            this.randomize(this.project.bridge_piers);
        }
    }
    randomize(piers) {
        console.log('Randomized generation of bridge cables');
        if (piers.num_piers == 0 || piers.height_over_span == 0) {
            console.log('No cables without piers over span!');
            return;
        }
        this.width = this.rand.rint(1, 3);
        this.num_cables = this.rand.rint(1, 15 - (this.width / 2));
        console.log(piers.width * 2 + this.width * 5);
        console.log((this.project.cw - this.project.landscape.side_buffer * 2) / (piers.num_piers + piers.invisible_piers) / (this.num_cables + 1));
        this.spacing = this.rand.rint(piers.width * 2 + this.width * 5, Math.max((this.project.cw - this.project.landscape.side_buffer * 2) / (piers.num_piers + piers.invisible_piers) / (this.num_cables + 1), piers.width * 2 + this.width * 5));
        if (this.num_cables == 0)
            return;
        let greyness_lvl = this.rand.rint(5, 200);
        this.cable_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        greyness_lvl = this.rand.rint(0, 200);
        this.pattern_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        this.cable_pattern = this.rand.rint(0, 5);
        this.vertical_spacing = 0;
        if (this.rand.rbool() && this.num_cables > 1) {
            this.vertical_spacing = piers.height_over_span / (this.num_cables);
        }
        this.star_design = (this.rand.rbool()
            && this.vertical_spacing > 0
            && this.num_cables > 2);
    }
    draw(ctx, debug = false) {
        for (let p = 0; p < this.project.bridge_piers.num_piers; p++) {
            let pier_pos = this.project.bridge_piers.pier_top_pos[p];
            for (let i = 0; i < this.num_cables; i++) {
                ctx.beginPath();
                ctx.strokeStyle = this.cable_color.rgb();
                ctx.setLineDash([]);
                ctx.lineWidth = this.width;
                this.draw_cable(ctx, i, pier_pos);
                ctx.stroke();
                ctx.setLineDash([this.cable_pattern]);
                ctx.strokeStyle = this.pattern_color.rgb();
                this.draw_cable(ctx, i, pier_pos);
                ctx.stroke();
            }
        }
    }
    draw_cable(ctx, i, pier_pos) {
        let horizontal_i = i + 1;
        if (this.star_design) {
            horizontal_i = this.num_cables;
            console.log('STAR DESIGN!');
        }
        ctx.moveTo(pier_pos.x, pier_pos.y + this.vertical_spacing * (this.num_cables - i - 1));
        ctx.lineTo(pier_pos.x + this.spacing * (horizontal_i + 1), this.project.landscape.start_pos.y);
        ctx.moveTo(pier_pos.x, pier_pos.y + this.vertical_spacing * (this.num_cables - i - 1));
        ctx.lineTo(pier_pos.x - this.spacing * (horizontal_i + 1), this.project.landscape.start_pos.y);
    }
}
