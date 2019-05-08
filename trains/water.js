import { rColor, Color } from './trains.js';
export class Water {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        console.log('Randomized generation of water');
        this.level = this.rand.rint(landscape.start_pos.y, this.project.ch);
        this.water_surface_color = new rColor(this.rand);
        this.water_surface_color.random([0, 110], [0, 230], [244, 255], [0.6, 1]);
        this.water_bottom_color = new Color(this.water_surface_color.red, this.water_surface_color.green, this.water_surface_color.blue);
        let relative_depth = (this.project.ch - this.level) / this.project.ch;
        this.water_bottom_color.darken(relative_depth);
    }
    draw(ctx, debug = false) {
        ctx.beginPath();
        let grd = ctx.createLinearGradient(0, this.level, 0, this.project.ch);
        grd.addColorStop(0, this.water_surface_color.rgb());
        grd.addColorStop(1, this.water_bottom_color.rgb());
        ctx.fillStyle = grd;
        ctx.rect(0, this.level, this.project.cw, this.project.ch - this.level);
        ctx.fill();
    }
}
