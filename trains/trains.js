var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SeededRandomSource = /** @class */ (function () {
    function SeededRandomSource(seed) {
        this.seed = seed;
    }
    SeededRandomSource.prototype.r = function () {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    };
    SeededRandomSource.prototype.rint = function (min, max) {
        return Math.floor((this.r() * max) + min);
    };
    SeededRandomSource.prototype.rfloat = function (min, max) {
        return this.r() * (max - min) + min;
    };
    return SeededRandomSource;
}());
var Color = /** @class */ (function () {
    function Color(red, green, blue, opacity) {
        if (opacity === void 0) { opacity = 1; }
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.opacity = opacity;
    }
    Color.prototype.rgb = function () {
        return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.opacity + ")";
    };
    return Color;
}());
var rColor = /** @class */ (function () {
    function rColor(rand, red, green, blue, opacity) {
        if (red === void 0) { red = null; }
        if (green === void 0) { green = null; }
        if (blue === void 0) { blue = null; }
        if (opacity === void 0) { opacity = 1; }
        _this = _super.call(this, seed) || this;
        this.rand = rand;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.opacity = opacity;
        if (this.red === null && this.red === null && this.blue === null)
            this.random();
    }
    rColor.prototype.random = function (r, g, b, a) {
        if (r === void 0) { r = [0, 255]; }
        if (g === void 0) { g = [0, 255]; }
        if (b === void 0) { b = [0, 255]; }
        if (a === void 0) { a = [1, 1]; }
        this.red = this.rint(r[0], r[1]);
        this.green = this.rint(g[0], g[1]);
        this.blue = this.rint(b[0], b[1]);
        this.opacity = this.rfloat(a[0], a[1]);
    };
    rColor.prototype.rgb = function () {
        return new Color(this.red, this.green, this.blue, this.opacity).rgb();
    };
    return rColor;
}());
var Landscape = /** @class */ (function (_super) {
    __extends(Landscape, _super);
    function Landscape(project, seed) {
        var _this = _super.call(this, seed) || this;
        _this.project = project;
        console.log('Randomized generation of landscape');
        _this.randomize();
        return _this;
    }
    Landscape.prototype.randomize = function () {
        // track level in the lower 2/3 of the canvas
        var height = this.project.ch - this.project.ch * this.rfloat(0.1, 0.66);
        this.start_pos = new rPos(this.project, this.seed, 0, height);
        this.end_pos = new rPos(this.project, this.seed, this.project.cw, height);
        // randomize ground
        this.color = new rColor(this.seed);
        this.color.random([0, 150], [150, 255], [0, 150], [0.8, 1]);
        this.bezier1 = new rPos(this.project, this.seed++);
        this.bezier1.random([0, this.project.cw / 2], [height, this.project.ch]);
        this.bezier2 = new rPos(this.project, this.seed++);
        this.bezier2.random([this.project.cw / 2, this.project.cw * 0.9], [height, this.project.ch]);
        console.log(this.color.rgb());
    };
    Landscape.prototype.draw = function (ctx, debug) {
        if (debug === void 0) { debug = false; }
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
    };
    return Landscape;
}(Randomized));
var BridgeProject = /** @class */ (function () {
    function BridgeProject(canvas, landscape_seed, bridge_seed) {
        this.canvas = canvas;
        this.landscape_seed = landscape_seed;
        this.bridge_seed = bridge_seed;
        this.ctx = this.canvas.getContext('2d');
        this.cw = canvas.width;
        this.ch = canvas.height;
    }
    BridgeProject.prototype.randomize = function () {
        this.landscape = new Landscape(this, this.landscape_seed);
    };
    BridgeProject.prototype.draw = function () {
        // clear entire Canvas
        this.ctx.clearRect(-1, -1, this.cw + 1, this.ch + 1);
        this.landscape.draw(this.ctx, true);
    };
    return BridgeProject;
}());
var Pos = /** @class */ (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    Pos.prototype.draw = function (ctx) {
        ctx.fillStyle = new Color(255, 0, 0).rgb();
        ctx.fillRect(this.x - 1, this.y - 1, 3, 3);
    };
    return Pos;
}());
var rPos = /** @class */ (function (_super) {
    __extends(rPos, _super);
    function rPos(project, seed, x, y) {
        if (x === void 0) { x = null; }
        if (y === void 0) { y = null; }
        var _this = _super.call(this, seed) || this;
        _this.project = project;
        _this.x = x;
        _this.y = y;
        if (_this.x === null && _this.y === null) {
            _this.random([_this.project.ch, _this.project.ch], [_this.project.cw, _this.project.cw]);
        }
        return _this;
    }
    rPos.prototype.random = function (x, y) {
        this.x = this.rint(x[0], x[1]);
        this.y = this.rint(y[0], y[1]);
    };
    rPos.prototype.draw = function (ctx) {
        return new Pos(this.x, this.y).draw(ctx);
    };
    return rPos;
}(Randomized));
window.onload = function () {
    var canvas = document.getElementById('canvas');
    var landscape_rand = new SeededRandomSource(new Date().getTime());
    var bridge_rand = new SeededRandomSource(new Date().getTime());
    console.log("Generating Brige Project.");
    var project = new BridgeProject(canvas, landscape_rand, bridge_rand);
    project.randomize();
    project.draw();
};
