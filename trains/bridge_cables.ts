import {BridgeProject, Drawable, SeededRandomSource, Color, Pos} from './trains.js';
import {BridgeSupport} from './bridge_support';

export class BridgeCables implements Drawable {
    public num_cables: number;
    public width: number;
    public spacing: number;
    public vertical_spacing: number;
    public cable_color: Color;
    public pattern_color: Color;
    public cable_pattern: number;
    public star_design: boolean;

    constructor(readonly project: BridgeProject, readonly rand: SeededRandomSource) {
        if (this.project.landscape !== null) {
            this.randomize(this.project.bridge_support);
        }
    }

    private randomize(support: BridgeSupport) {
        console.log('Randomized generation of bridge cables');
        if (support.num_piers == 0 || support.height_over_span == 0) {
            console.log('No cables without support over span!');
            return;
        }
        this.width = this.rand.rint(1, 3);
        this.num_cables = this.rand.rint(1, 15 - (this.width / 2));
        this.spacing = this.rand.rint(
            this.width * 10,
            Math.max(
                (this.project.cw - this.project.landscape.side_buffer * 2) / (support.num_piers + support.invisible_piers) / (this.num_cables + 1),
                this.width * 10,
            )
        );
        if (this.num_cables == 0) return;
        let greyness_lvl = this.rand.rint(5, 200);
        this.cable_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        greyness_lvl = this.rand.rint(0, 200);
        this.pattern_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        this.cable_pattern = this.rand.rint(0, 5);
        this.vertical_spacing = 0;
        let vertical_spacing_bias = 0.5;
        if (this.project.bridge_braced_frames.middle_line_vertical === false) {
            // no v spacing if no middle line in braces frames as fixpoint
            vertical_spacing_bias = 0;
        }
        if (this.rand.rbool(vertical_spacing_bias) && this.num_cables > 1) {
            this.vertical_spacing = support.height_over_span / (this.num_cables);
        }
        this.star_design = (
            this.rand.rbool()
            && this.vertical_spacing > 0
            && this.num_cables > 2
        );
    }

    public draw(ctx: CanvasRenderingContext2D, debug: boolean = false) {
        for (let p: number = 0; p < this.project.bridge_support.num_piers; p++) {
            let pier_pos = this.project.bridge_support.pier_top_pos[p];
            for (let i: number = 0; i < this.num_cables; i++) {
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

    private draw_cable(ctx: CanvasRenderingContext2D, i: number, pier_pos: Pos) {
        let horizontal_i = i + 1;
        if (this.star_design) {
            horizontal_i = this.num_cables;
        }
        ctx.moveTo(pier_pos.x, pier_pos.y + this.vertical_spacing * (this.num_cables - i - 1));
        ctx.lineTo(
            pier_pos.x + this.spacing * (horizontal_i + 1),
            this.project.landscape.start_pos.y,
        );
        ctx.moveTo(pier_pos.x, pier_pos.y  + this.vertical_spacing * (this.num_cables - i - 1));
        ctx.lineTo(
            pier_pos.x - this.spacing * (horizontal_i + 1),
            this.project.landscape.start_pos.y,
        );
    }
}
