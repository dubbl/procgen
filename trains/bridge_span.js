import { Color, rColor } from './trains.js';
export class BridgeSpan {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        console.log('Randomized generation of bridge span');
        this.thickness = this.rand.rint(1, 5);
        let greyness_level = this.rand.rint(0, 200);
        this.span_color = new Color(greyness_level, greyness_level, greyness_level);
        this.has_tracks = this.rand.rbool(0.8);
        this.tracks_color = new rColor(this.rand);
        this.tracks_color.random([90, 100], [30, 90], [2, 100]);
        this.tracks_width = this.rand.rint(1, 5);
        this.tracks_pattern = this.rand.rint(0, 5);
    }
    draw(ctx, debug = false) {
        ctx.beginPath();
        ctx.fillStyle = this.span_color.rgb();
        ctx.rect(0, this.project.landscape.start_pos.y - this.thickness, this.project.cw, this.thickness);
        ctx.fill();
        if (this.has_tracks) {
            this.draw_tracks(ctx);
        }
    }
    draw_tracks(ctx, debug = false) {
        ctx.beginPath();
        ctx.strokeStyle = this.tracks_color.rgb();
        ctx.lineWidth = this.tracks_width;
        ctx.setLineDash([this.tracks_pattern]);
        ctx.moveTo(0, this.project.landscape.start_pos.y - this.tracks_width);
        ctx.lineTo(this.project.cw, this.project.landscape.start_pos.y - this.tracks_width);
        ctx.stroke();
    }
}
