import {BridgeProject, Drawable, SeededRandomSource, Color, Pos} from './trains.js';
import {Landscape} from './landscape.js';
import { BridgeSupportTypes } from './bridge_support.js';

export class BridgeBracedFrames implements Drawable {
    public area: string[][];
    public area_width: number;
    public area_height: number;
    public outer_color: Color;
    public inner_color: Color;
    public middle_line_vertical: boolean;
    public middle_line_horizontal: boolean;
    public main_brace_type: string;

    constructor(readonly project: BridgeProject, readonly rand: SeededRandomSource) {
        if (this.project.landscape !== null) {
            this.randomize(this.project.landscape);
        }
    }

    private randomize(landscape: Landscape) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.BracedFrames) {
            return;
        }
        console.log('Randomized generation of braced frames');
        this.area = new Array<Array<string>>();
        this.area_width = this.rand.rint(1, 20);
        if (this.area_width % 2 == 0) {
            // ensure uneven numbers for easy centering
            this.area_width += 1;
        }
        let grid_width = this.project.bridge_support.spacing;
        let grid_size = grid_width / this.area_width;
        this.area_height = Math.ceil(this.project.ch - this.project.bridge_support.pier_top_pos[0].y / grid_size);
        let greyness_lvl = this.rand.rint(0, 200);
        this.outer_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        greyness_lvl = this.rand.rint(0, 200);
        this.inner_color = new Color(greyness_lvl, greyness_lvl, greyness_lvl);
        this.middle_line_vertical = this.rand.rbool(0.3);
        this.middle_line_horizontal = this.rand.rbool(0.3);
        let main_brace_type_option = ['^', 'v', '^v', '/', '\\', '/\\'];
        this.main_brace_type = main_brace_type_option[
            this.rand.rint(0, main_brace_type_option.length)
        ]
        for (let x=0; x < this.area_width; x++) {
            this.area[x] = [];
            for (let y=0; y < this.area_height; y++) {
                this.area[x][y] = ' ';
            }
        }
        for (let y=0; y < this.area_height; y++) {
            this.area[Math.floor(this.area_width / 2)][y] = this.main_brace_type;
        }
        if (this.rand.rbool(0.3) && this.project.bridge_support.height_over_span === 0) {
            for (let x=0; x < this.area_width; x++) {
                this.area[x][0] = 'x';
            }
        }
        let num_elements = this.area_height * this.area_width;
        if (this.rand.rbool(0.8) && this.project.bridge_support.height_over_span === 0 && num_elements < 2000) {
            for (let x=0; x < this.area_width; x++) {
                for (let y=0; y < this.area_height; y++) {
                    this.area[x][y] = this.main_brace_type;
                }
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, debug: boolean = false) {
        if (this.project.bridge_support.support_type != BridgeSupportTypes.BracedFrames) {
            return;
        }
        this.project.bridge_support.pier_top_pos.forEach(top_pos => {
            let grid_width = this.project.bridge_support.spacing;
            let grid_size = grid_width / this.area_width;
            for (let x=0; x < this.area_width; x++) {
                for (let y=0; y < this.area_height; y++) {
                    let pos = new Pos(
                        top_pos.x - (grid_width / 2) + (grid_size * x),
                        top_pos.y + (grid_size * y),
                    )
                    if (this.area[x][y].includes('x')) {
                        this.draw_x_brace(ctx, pos, grid_size);
                    } else if (this.area[x][y].includes('v')) {
                        this.draw_v_brace(ctx, pos, grid_size);
                    } else if (this.area[x][y].includes('^')) {
                        this.draw_upsidedown_v_brace(ctx, pos, grid_size);
                    } else if (this.area[x][y].includes('/')) {
                        this.draw_frontslash_brace(ctx, pos, grid_size);
                    } else if (this.area[x][y].includes('\\')) {
                        this.draw_backslash_brace(ctx, pos, grid_size);
                    }
                    if (this.area[x][y] != ' ') {
                        ctx.beginPath();
                        ctx.setLineDash([]);
                        ctx.strokeStyle = this.outer_color.rgb();
                        ctx.rect(
                            pos.x,
                            pos.y,
                            grid_size,
                            grid_size,
                        );
                        ctx.stroke();
                        if (this.middle_line_vertical) {
                            // fix "no fixpoint" issue with star cable design
                            ctx.beginPath();
                            ctx.setLineDash([]);
                            ctx.moveTo(pos.x  + grid_size / 2, pos.y);
                            ctx.lineTo(pos.x + grid_size / 2, pos.y + grid_size);
                            ctx.stroke();
                        }
                        if (this.middle_line_horizontal) {
                            // fix "no fixpoint" issue with star cable design
                            ctx.beginPath();
                            ctx.setLineDash([]);
                            ctx.moveTo(pos.x, pos.y + grid_size / 2);
                            ctx.lineTo(pos.x + grid_size, pos.y + grid_size / 2);
                            ctx.stroke();
                        }
                    }
                }
            }
        });
    }

    private draw_x_brace(ctx: CanvasRenderingContext2D, pos: Pos, grid_size: number) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = this.inner_color.rgb();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + grid_size, pos.y + grid_size);
        ctx.moveTo(pos.x, pos.y + grid_size);
        ctx.lineTo(pos.x + grid_size, pos.y);
        ctx.stroke();
    }

    private draw_v_brace(ctx: CanvasRenderingContext2D, pos: Pos, grid_size: number) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = this.inner_color.rgb();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + grid_size / 2, pos.y + grid_size);
        ctx.lineTo(pos.x + grid_size, pos.y);
        ctx.stroke();
    }

    private draw_upsidedown_v_brace(ctx: CanvasRenderingContext2D, pos: Pos, grid_size: number) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = this.inner_color.rgb();
        ctx.moveTo(pos.x, pos.y + grid_size);
        ctx.lineTo(pos.x + grid_size / 2, pos.y);
        ctx.lineTo(pos.x + grid_size, pos.y  + grid_size);
        ctx.stroke();
    }

    private draw_frontslash_brace(ctx: CanvasRenderingContext2D, pos: Pos, grid_size: number) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = this.inner_color.rgb();
        ctx.moveTo(pos.x, pos.y + grid_size);
        ctx.lineTo(pos.x + grid_size, pos.y);
        ctx.stroke();
    }

    private draw_backslash_brace(ctx: CanvasRenderingContext2D, pos: Pos, grid_size: number) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = this.inner_color.rgb();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + grid_size, pos.y + grid_size);
        ctx.stroke();
    }
}
