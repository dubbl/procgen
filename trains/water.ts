import {BridgeProject, Drawable, Landscape, SeededRandomSource} from './trains.js';

export class Water implements Drawable {
    public level: number;

    constructor(readonly project: BridgeProject, readonly rand: SeededRandomSource) {
        console.log('Randomized generation of water');
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }

    private randomize(landscape: Landscape) {
        this.level = this.rand.rint(landscape.start_pos.y, this.project.ch);
        console.log(this.level);
    }

    public draw(ctx: CanvasRenderingContext2D, debug: boolean = false) {
        ctx.fillStyle = '#00F';
        ctx.rect(0, this.level, this.project.cw, this.project.ch - this.level);
        ctx.fill();
    }
}
