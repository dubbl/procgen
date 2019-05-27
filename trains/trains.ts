import { Water } from "./water.js";
import { Landscape } from "./landscape.js";
import { BridgeSpan } from "./bridge_span.js";
import { BridgePiers } from "./bridge_piers.js";
import { BridgeCables } from "./bridge_cables.js";
import { BridgeSupport } from "./bridge_support.js";
import { BridgeBracedFrames } from "./bridge_braced_frames.js";

export class SeededRandomSource {
    constructor(private seed: number) {
    }

    public r(): number {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    public rint(min: number, max: number): number {
        return  Math.floor((this.r() * (max - min)) + min);
    }

    public rfloat(min: number, max: number): number {
        return this.r() * (max - min) + min;
    }

    public rbool(bias: number = 0.5): boolean {
        return this.r() < bias;
    }

}

export class Color {

    constructor(
        public red: number,
        public green: number,
        public blue: number,
        public opacity: number = 1,
    ) {}

    public darken(percentage: number = 50) {
        this.red = this.red * percentage / 100;
        this.green = this.green * percentage / 100;
        this.blue = this.blue * percentage / 100;
    }

    public rgb() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    }
}

export class rColor extends Color {

    constructor(
        private rand: SeededRandomSource,
        public red: number = null,
        public  green: number = null,
        public blue: number = null,
        public opacity: number = 1,
    ) {
        super(red, green, blue, opacity);
        if (this.red === null && this.red === null && this.blue === null) {
            this.random();
        }
    }

    public random(
        r: [number, number] = [0, 255],
        g: [number, number] = [0, 255],
        b: [number, number] = [0, 255],
        a: [number, number] = [1, 1],
    ) {
        this.red = this.rand.rint(r[0], r[1]);
        this.green = this.rand.rint(g[0], g[1]);
        this.blue = this.rand.rint(b[0], b[1]);
        this.opacity = this.rand.rfloat(a[0], a[1]);
    }
}

export class Pos implements Drawable {
    constructor(public x: number, public y: number) {}

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = new Color(255, 0, 0).rgb();
        ctx.fillRect(this.x - 3, this.y - 3, 5 , 5);
    }
}

export class rPos extends Pos {

    constructor(private project: BridgeProject, readonly rand: SeededRandomSource, public x: number = null, public y: number = null) {
        super(x, y);
        if (this.x === null && this.y === null) {
            this.random(
                [this.project.ch, this.project.ch],
                [this.project.cw, this.project.cw],
            );
        }
    }

    public random(x: [number, number], y: [number, number]) {
        this.x = this.rand.rint(x[0], x[1]);
        this.y = this.rand.rint(y[0], y[1]);
    }
}

export class BridgeProject {
    private readonly ctx: CanvasRenderingContext2D;
    public readonly cw: number;
    public readonly ch: number;

    public landscape: Landscape;
    public water: Water;
    public bridge_span: BridgeSpan;
    public bridge_support: BridgeSupport;
    public bridge_cables: BridgeCables;
    public bridge_piers: BridgePiers;
    public bridge_braced_frames: BridgeBracedFrames;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private landscape_rand: SeededRandomSource,
        private bridge_rand: SeededRandomSource,
    ) {
        this.ctx = this.canvas.getContext('2d');
        this.cw = canvas.width;
        this.ch = canvas.height;
    }

    public randomize() {
        this.landscape = new Landscape(this, this.landscape_rand);
        this.water = new Water(this, this.landscape_rand);
        this.bridge_span = new BridgeSpan(this, this.bridge_rand);
        this.bridge_support = new BridgeSupport(this, this.bridge_rand);
        this.bridge_piers = new BridgePiers(this, this.bridge_rand);
        this.bridge_braced_frames = new BridgeBracedFrames(this, this.bridge_rand);
        this.bridge_cables = new BridgeCables(this, this.bridge_rand);
    }

    public draw() {
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

export interface Drawable {
    // TODO: implement "instance" to draw certain instance of Drawable?
    draw(ctx: CanvasRenderingContext2D, debug: boolean): void,
}

function new_seeds(landscape: boolean = true, bridge: boolean = true) {
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
    const canvas = <HTMLCanvasElement> document.getElementById('canvas');
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
