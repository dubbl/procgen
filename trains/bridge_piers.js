import { Color, Pos } from './trains.js';
export class BridgePiers {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        this.invisible_piers = 0;
        this.height_over_span = 0;
        this.start_of_arc = null;
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        console.log('Randomized generation of bridge piers');
        this.width = this.rand.rint(5, 20);
        this.num_piers = this.rand.rint(0, 20 - (this.width / 2));
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
        else if (this.rand.rbool()) {
            this.start_of_arc = this.rand.rint(landscape.start_pos.y + 20, Math.min(this.project.ch, landscape.start_pos.y + 20));
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
        let greyness_lvl = this.rand.rint(0, 200);
        this.pier_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
    }
    draw(ctx, debug = false) {
        for (let i = 0; i < this.num_piers; i++) {
            ctx.beginPath();
            ctx.fillStyle = this.pier_color.rgb();
            ctx.rect(this.pier_top_pos[i].x - this.width / 2, this.pier_top_pos[i].y, this.width, this.project.ch);
            ctx.fill();
            if (this.start_of_arc != null) {
                this.draw_arc(ctx, this.pier_top_pos[i], this.spacing / 2);
                this.draw_arc(ctx, this.pier_top_pos[i], -this.spacing / 2);
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
