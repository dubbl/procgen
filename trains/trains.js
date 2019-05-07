import { Water } from "./water.js";
export class SeededRandomSource {
    constructor(seed) {
        this.seed = seed;
    }
    r() {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
    rint(min, max) {
        return Math.floor((this.r() * (max - min)) + min);
    }
    rfloat(min, max) {
        return this.r() * (max - min) + min;
    }
}
export class Color {
    constructor(red, green, blue, opacity = 1) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.opacity = opacity;
    }
    rgb() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    }
}
export class rColor extends Color {
    constructor(rand, red = null, green = null, blue = null, opacity = 1) {
        super(red, green, blue, opacity);
        this.rand = rand;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.opacity = opacity;
        if (this.red === null && this.red === null && this.blue === null) {
            this.random();
        }
    }
    random(r = [0, 255], g = [0, 255], b = [0, 255], a = [1, 1]) {
        this.red = this.rand.rint(r[0], r[1]);
        this.green = this.rand.rint(g[0], g[1]);
        this.blue = this.rand.rint(b[0], b[1]);
        this.opacity = this.rand.rfloat(a[0], a[1]);
    }
}
export class Landscape {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        console.log('Randomized generation of landscape');
        this.randomize();
    }
    randomize() {
        // track level in the lower 2/3 of the canvas
        let height = this.project.ch - this.project.ch * this.rand.rfloat(0.2, 0.66);
        this.start_pos = new rPos(this.project, this.rand, 0, height);
        this.end_pos = new rPos(this.project, this.rand, this.project.cw, height);
        // randomize ground
        this.color = new rColor(this.rand);
        this.color.random([0, 150], [150, 255], [0, 150], [0.8, 1]);
        console.log(this.color.rgb());
        // generate valley
        this.num_terrain_points = this.rand.rint(1, 8);
        this.terrain_tension = this.rand.rfloat(0, 1);
        this.terrain = new Array(this.num_terrain_points + 2);
        let side_buffer = 20;
        this.terrain[0] = this.start_pos;
        this.terrain[1] = this.end_pos;
        for (let i = 2; i < this.num_terrain_points + 2; i++) {
            this.terrain[i] = new rPos(this.project, this.rand);
            this.terrain[i].random([side_buffer, this.project.cw - side_buffer], [height + 10, this.project.ch]);
        }
        this.terrain = this.terrain.sort((a, b) => a.x - b.x);
        console.log(this.terrain);
    }
    draw(ctx, debug = false) {
        ctx.beginPath();
        ctx.fillStyle = this.color.rgb();
        ctx.moveTo(this.start_pos.x, this.start_pos.y);
        this.drawCurve(ctx, this.terrain, this.terrain_tension);
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
    drawCurve(ctx, points, tension = 1) {
        ctx.beginPath();
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
export class BridgeProject {
    constructor(canvas, landscape_rand, bridge_rand) {
        this.canvas = canvas;
        this.landscape_rand = landscape_rand;
        this.bridge_rand = bridge_rand;
        this.ctx = this.canvas.getContext('2d');
        this.cw = canvas.width;
        this.ch = canvas.height;
    }
    randomize() {
        this.landscape = new Landscape(this, this.landscape_rand);
        this.water = new Water(this, this.landscape_rand);
    }
    draw() {
        // clear entire Canvas
        this.ctx.clearRect(-1, -1, this.cw + 1, this.ch + 1);
        this.water.draw(this.ctx, true);
        this.landscape.draw(this.ctx, true);
    }
}
export class Pos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    draw(ctx) {
        ctx.fillStyle = new Color(255, 0, 0).rgb();
        ctx.fillRect(this.x - 3, this.y - 3, 5, 5);
    }
}
export class rPos extends Pos {
    constructor(project, rand, x = null, y = null) {
        super(x, y);
        this.project = project;
        this.rand = rand;
        this.x = x;
        this.y = y;
        if (this.x === null && this.y === null) {
            this.random([this.project.ch, this.project.ch], [this.project.cw, this.project.cw]);
        }
    }
    random(x, y) {
        this.x = this.rand.rint(x[0], x[1]);
        this.y = this.rand.rint(y[0], y[1]);
    }
}
window.onload = () => {
    const canvas = document.getElementById('canvas');
    let landscape_rand = new SeededRandomSource(new Date().getTime());
    let bridge_rand = new SeededRandomSource(new Date().getTime());
    console.log(`Generating Brige Project.`);
    let project = new BridgeProject(canvas, landscape_rand, bridge_rand);
    project.randomize();
    project.draw();
};
