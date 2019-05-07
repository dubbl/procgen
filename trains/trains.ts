class SeededRandomSource {
    constructor(private seed: number) {
    }

    public r(): number {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    public rint(min: number, max: number): number {
        return  Math.floor((this.r() * max) + min);
    }

    public rfloat(min: number, max: number): number {
        return this.r() * (max - min) + min;
    }

}

class Color {

    constructor(
        private red: number,
        private green: number,
        private blue: number,
        private opacity: number = 1,
    ) {}

    public rgb() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    }
}

class rColor {

    constructor(
        private rand: SeededRandomSource,
        private red: number = null,
        private green: number = null,
        private blue: number = null,
        private opacity: number = 1,
    ) {
        super(seed);
        if (this.red === null && this.red === null && this.blue === null)
            this.random();
    }

    public random(
        r: [number, number] = [0, 255],
        g: [number, number] = [0, 255],
        b: [number, number] = [0, 255],
        a: [number, number] = [1, 1],
    ) {
        this.red = this.rint(r[0], r[1]);
        this.green = this.rint(g[0], g[1]);
        this.blue = this.rint(b[0], b[1]);
        this.opacity = this.rfloat(a[0], a[1]);
    }

    public rgb() {
        return new Color(this.red, this.green, this.blue, this.opacity).rgb();
    }
}

class Landscape extends Randomized implements Drawable {
    public start_pos: rPos;
    public end_pos: rPos;
    private color: rColor;
    private bezier1: rPos;
    private bezier2: rPos;

    constructor(readonly project: BridgeProject, seed: number) {
        super(seed);
        console.log('Randomized generation of landscape');
        this.randomize();
    }

    private randomize() {
        // track level in the lower 2/3 of the canvas
        let height = this.project.ch - this.project.ch * this.rfloat(0.1, 0.66);
        this.start_pos = new rPos(this.project, this.seed, 0, height)
        this.end_pos = new rPos(this.project, this.seed, this.project.cw, height);
        // randomize ground
        this.color = new rColor(this.seed);
        this.color.random([0, 150], [150, 255], [0, 150], [0.8, 1]);
        this.bezier1 = new rPos(this.project, this.seed++);
        this.bezier1.random([0, this.project.cw / 2], [height, this.project.ch]);
        this.bezier2 = new rPos(this.project, this.seed++);
        this.bezier2.random([this.project.cw / 2, this.project.cw * 0.9], [height, this.project.ch]);
        console.log(this.color.rgb());
    }

    public draw(ctx: CanvasRenderingContext2D, debug: boolean = false) {
        ctx.beginPath();
        ctx.fillStyle = this.color.rgb();
        ctx.moveTo(this.start_pos.x, this.start_pos.y);
        ctx.bezierCurveTo(this.bezier1.x, this.bezier1.y, this.bezier2.x, this.bezier2.y, this.end_pos.x, this.end_pos.y);
        ctx.lineTo(this.project.cw, this.project.ch);
        ctx.lineTo(0, this.project.ch);
        ctx.lineTo(this.start_pos.x, this.start_pos.y);
        ctx.closePath();
        ctx.fill();

        if (debug) {
            this.bezier1.draw(ctx);
            this.bezier2.draw(ctx);
        }
    }
}

class BridgeProject {
    private readonly ctx: CanvasRenderingContext2D;
    public readonly cw: number;
    public readonly ch: number;

    public landscape: Landscape;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private landscape_seed: number,
        private bridge_seed: number,
    ) {
        this.ctx = this.canvas.getContext('2d');
        this.cw = canvas.width;
        this.ch = canvas.height;
    }

    public randomize() {
        this.landscape = new Landscape(this, this.landscape_seed);
    }

    public draw() {
        // clear entire Canvas
        this.ctx.clearRect(-1, -1, this.cw + 1, this.ch + 1);
        this.landscape.draw(this.ctx, true);
    }

}


class Pos implements Drawable {
    constructor(public x: number, public y: number) {}

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = new Color(255, 0, 0).rgb();
        ctx.fillRect(this.x - 1, this.y - 1, 3 , 3);
    }
}

class rPos extends Randomized implements Pos {

    constructor(private project: BridgeProject, seed: number, public x: number = null, public y: number = null) {
        super(seed);
        if (this.x === null && this.y === null) {
            this.random(
                [this.project.ch, this.project.ch],
                [this.project.cw, this.project.cw],
            );
        }
    }

    public random(x: [number, number], y: [number, number]) {
        this.x = this.rint(x[0], x[1]);
        this.y = this.rint(y[0], y[1]);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        return new Pos(this.x, this.y).draw(ctx);
    }
}

interface Drawable {
    draw(ctx: CanvasRenderingContext2D, debug: boolean): void,
}

window.onload = () => {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let landscape_rand = new SeededRandomSource(new Date().getTime());
    let bridge_rand = new SeededRandomSource(new Date().getTime());
    console.log(`Generating Brige Project.`);
    let project = new BridgeProject(canvas, landscape_rand, bridge_rand);
    project.randomize();
    project.draw();
};
