export class Water {
    constructor(project, rand) {
        this.project = project;
        this.rand = rand;
        console.log('Randomized generation of water');
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }
    randomize(landscape) {
        this.level = this.rand.rint(landscape.start_pos.y, this.project.ch);
        console.log(this.level);
    }
    draw(ctx, debug = false) {
        ctx.fillStyle = '#00F';
        ctx.rect(0, this.level, this.project.cw, this.project.ch - this.level);
        ctx.fill();
    }
}
