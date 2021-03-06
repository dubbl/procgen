import { Water } from "./water.js";
import { Landscape } from "./landscape.js";
import { BridgeSpan } from "./bridge_span.js";
import { BridgePiers } from "./bridge_piers.js";
import { BridgeCables } from "./bridge_cables.js";
import { BridgeSupport } from "./bridge_support.js";
import { BridgeBracedFrames } from "./bridge_braced_frames.js";
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
    rbool(bias = 0.5) {
        return this.r() < bias;
    }
}
export class Color {
    constructor(red, green, blue, opacity = 1) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.opacity = opacity;
    }
    darken(percentage = 50) {
        this.red = this.red * percentage / 100;
        this.green = this.green * percentage / 100;
        this.blue = this.blue * percentage / 100;
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
        this.bridge_span = new BridgeSpan(this, this.bridge_rand);
        this.bridge_support = new BridgeSupport(this, this.bridge_rand);
        this.bridge_piers = new BridgePiers(this, this.bridge_rand);
        this.bridge_braced_frames = new BridgeBracedFrames(this, this.bridge_rand);
        this.bridge_cables = new BridgeCables(this, this.bridge_rand);
    }
    draw() {
        // clear entire Canvas
        this.ctx.clearRect(-1, -1, this.cw + 1, this.ch + 1);
        this.bridge_span.draw(this.ctx, true);
        this.bridge_cables.draw(this.ctx, true);
        this.bridge_support.draw(this.ctx, true);
        this.bridge_piers.draw(this.ctx, true);
        this.bridge_braced_frames.draw(this.ctx, true);
        this.water.draw(this.ctx, true);
        this.landscape.draw(this.ctx);
    }
}
function new_seeds(landscape = true, bridge = true) {
    let landscape_seed = new Date().getTime();
    let bridge_seed = new Date().getTime() + 1337;
    let given_seeds = window.location.hash.substr(1).split(',');
    if (given_seeds.length == 2) {
        if (!landscape) {
            landscape_seed = parseInt(given_seeds[0], 10);
        }
        if (!bridge) {
            bridge_seed = parseInt(given_seeds[1], 10);
        }
    }
    window.location.hash = landscape_seed + ',' + bridge_seed;
    init();
}
function init() {
    const canvas = document.getElementById('canvas');
    let landscape_seed = new Date().getTime();
    let bridge_seed = new Date().getTime() + 1337;
    let given_seeds = window.location.hash.substr(1).split(',');
    if (given_seeds.length == 2) {
        landscape_seed = parseInt(given_seeds[0], 10);
        bridge_seed = parseInt(given_seeds[1], 10);
    }
    let landscape_rand = new SeededRandomSource(landscape_seed);
    let bridge_rand = new SeededRandomSource(bridge_seed);
    window.location.hash = landscape_seed + ',' + bridge_seed;
    console.log(`Generating Brige Project with seeds ${landscape_seed} and ${bridge_seed}`);
    let project = new BridgeProject(canvas, landscape_rand, bridge_rand);
    project.randomize();
    project.draw();
}
var new_everything = document.getElementById('btn_all');
var new_bridge = document.getElementById('btn_bridge');
var new_landscape = document.getElementById('btn_landscape');
new_everything.onclick = () => new_seeds();
new_bridge.onclick = () => new_seeds(false, true);
new_landscape.onclick = () => new_seeds(true, false);
window.onload = () => init();
window.onhashchange = () => init();
