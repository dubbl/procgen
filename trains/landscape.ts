import {BridgeProject, Drawable, SeededRandomSource, Pos, rPos, rColor} from './trains.js';

export class Landscape implements Drawable {
    public start_pos: rPos;
    public end_pos: rPos;
    private color: rColor;
    private num_terrain_points: number;
    private terrain_tension: number;
    private terrain: rPos[];

    constructor(readonly project: BridgeProject, readonly rand: SeededRandomSource) {
        this.randomize();
    }

    private randomize() {
        console.log('Randomized generation of landscape');
        // track level in the lower 2/3 of the canvas
        let height = this.project.ch - this.project.ch * this.rand.rfloat(0.2, 0.66);
        this.start_pos = new rPos(this.project, this.rand, 0, height);
        this.end_pos = new rPos(this.project, this.rand, this.project.cw, height);
        // randomize ground
        this.color = new rColor(this.rand);
        this.color.random([0, 150], [150, 255], [0, 150], [0.8, 1]);
        // generate valley
        this.num_terrain_points = this.rand.rint(1, 8);
        this.terrain_tension = this.rand.rfloat(0, 1);
        let predefined_points = 2;
        this.terrain = new Array(this.num_terrain_points + predefined_points);
        let side_buffer = this.rand.rint(20, 50);
        this.terrain[0] = new rPos(
            this.project,
            this.rand,
            this.start_pos.x + side_buffer,
            this.start_pos.y,
        );
        this.terrain[1] = new rPos(
            this.project,
            this.rand,
            this.end_pos.x - side_buffer,
            this.end_pos.y,
        );
        for (let i: number = 0; i < this.num_terrain_points; i++) {
            this.terrain[i + predefined_points] = new rPos(this.project, this.rand);
            this.terrain[i + predefined_points].random(
                [side_buffer, this.project.cw - side_buffer],
                [height + 10, this.project.ch],
            );
        }
        this.terrain = this.terrain.sort((a, b) => a.x - b.x);
    }

    public draw(ctx: CanvasRenderingContext2D, debug: boolean = false) {
        ctx.beginPath();
        ctx.fillStyle = this.color.rgb();
        ctx.moveTo(this.start_pos.x, this.start_pos.y);
        ctx.lineTo(this.terrain[0].x, this.terrain[0].y);
        this.drawCurve(ctx, this.terrain, this.terrain_tension);
        ctx.lineTo(this.terrain[this.terrain.length - 1].x, this.terrain[this.terrain.length - 1].y);
        ctx.lineTo(this.end_pos.x, this.end_pos.y);
        ctx.lineTo(this.project.cw, this.project.ch);
        ctx.lineTo(0, this.project.ch);
        ctx.lineTo(this.start_pos.x, this.start_pos.y);
        ctx.closePath();
        ctx.fill();

        if (debug) {
            this.terrain.forEach(point => {
                point.draw(ctx);
            });
        }
    }

    public drawCurve(ctx: CanvasRenderingContext2D, points: rPos[], tension: number = 1) {
        let t = tension;
        for (var i = 0; i < points.length - 1; i++) {
            var p0 = (i > 0) ? points[i - 1] : points[0];
            var p1 = points[i];
            var p2 = points[i + 1];
            var p3 = (i != points.length - 2) ? points[i + 2] : p2;

            var cp1x = p1.x + (p2.x - p0.x) / 6 * t;
            var cp1y = p1.y + (p2.y - p0.y) / 6 * t;

            var cp2x = p2.x - (p3.x - p1.x) / 6 * t;
            var cp2y = p2.y - (p3.y - p1.y) / 6 * t;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
    }
}
