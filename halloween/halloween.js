var generate_pumpkin = function(e) {
    var canvas = document.getElementById('canvas');
    if (!canvas.getContext){
        alert('Your browser does not support canvas.');
        return;
    }
    console.log('generating!');
    var ctx = canvas.getContext('2d');
    var cw = canvas.width;
    var ch = canvas.height;
    ctx.clearRect(-1, -1, cw+1, ch+1);

    var seed = (new Date()).getTime();
    if (window.location.hash !== '') {
        console.log(window.location.hash.substr(1));
        var seed = parseInt(window.location.hash.substr(1));
    }
    //window.location.hash = seed.toString();
    var rng = CustomRandom(seed);

    var p = {}; // pumpkin object
    // Generating basic body measurements
    p.start = {};
    p.start.x = cw/2;
    p.start.y = ch/8;
    p.height = ch / rng.nextInt(2, 4);
    p.width_modifier = cw * rng.nextInt(15, 30)/p.height;
    p.height_modifier1 = cw/ rng.nextInt(6, 12);
    p.height_modifier2 = rng.nextInt(0, p.start.y - (p.start.y/8));
    p.stop = {};
    p.stop.x = p.start.x;
    p.stop.y = p.start.y + p.height;

    p.rotation_angle = rng.nextInt(0, 7);
    ctx.rotate((Math.PI/180)*p.rotation_angle);
    ctx.translate(0,-5*p.rotation_angle);

    generate_body(ctx, cw, ch, rng, p);
    generate_stripes(ctx, cw, ch, rng, p);
    generate_stump(ctx, cw, ch, rng, p);

    ctx.translate(0, 5*p.rotation_angle);
    ctx.rotate((Math.PI/180)*-p.rotation_angle);
    return false;
};

generate_stump = function(ctx, cw, ch, rng, p) {
    console.log('Generating stump of pumpkin...');
    if (rng.next() < 0.1) {
        console.log('No stump for this one.');
        return;
    }

    var stump_length = rng.nextInt(10, 40),
        stump_upper_width = rng.nextInt(0, 15),
        stump_lower_width = rng.nextInt(3, 15);

    var gradient = ctx.createLinearGradient(
        p.start.x - 10, p.stop.y,
        p.start.x, p.stop.y
    );
    var red = rng.nextInt(130, 170),
        green = rng.nextInt(50, 80),
        blue = rng.nextInt(10, 30);
    var color1 = 'rgb(' + red + ', ' + green + ', ' + blue +')';
    var darken_factor = rng.next();
    red *= darken_factor;
    green *= darken_factor;
    blue *= darken_factor;
    var color2 = 'rgb(' + Math.round(red) + ', ' + Math.round(green) + ', ' + Math.round(blue) + ')';
    gradient.addColorStop(0, color2);
    gradient.addColorStop(1, color1);

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(p.start.x - stump_lower_width / 2, p.start.y);
    ctx.quadraticCurveTo(
        p.start.x - stump_upper_width / 2, p.start.y - stump_length,
        p.start.x - stump_upper_width / 2, p.start.y - stump_length
    );
    ctx.lineTo(p.start.x + stump_upper_width / 2, p.start.y - stump_length);
    ctx.quadraticCurveTo(
        p.start.x + stump_lower_width / 2, p.start.y,
        p.start.x + stump_lower_width / 2, p.start.y
    );
    ctx.fill();
    ctx.closePath();

    if (rng.next() < 0.3) {
        console.log('No stump cut for this one.');
        return;
    }
    ctx.beginPath();
    if (rng.next() < 0.6) {
        // otherwise reuse gradient of stump, cut is facing away
        red = rng.nextInt(200, 250);
        green = rng.nextInt(120, 150);
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', 50)';
    }
    ctx.ellipse(
        p.start.x, // center x
        p.start.y - stump_length, // center y
        stump_upper_width / 2, // radius x
        rng.nextInt(1, stump_upper_width / 3), // radius y
        rng.nextInt(0, 30) * Math.PI/180, // rotation
        0, // start angle
        2 * Math.PI // end angle
    );
    ctx.fill();
    ctx.closePath();
}

var generate_stripes = function(ctx, cw, ch, rng, p) {
    console.log('Generating vertical stripes of pumpkin...');
    if (rng.next() < 0.1) {
        console.log('No stripes for this one.');
        return;
    }

    var gradient = ctx.createLinearGradient(
        p.start.x, p.start.y,
        p.start.x, p.stop.y
    );
    var color1 = 'rgba(0, 0, 0, 1)',
        color2 = 'rgba(0, 0, 0, 0)';
        transparent_area = rng.next(0.1, 0.5);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(transparent_area, color2);
    gradient.addColorStop(1 - transparent_area, color2);
    gradient.addColorStop(1, color1);
    ctx.strokeStyle = gradient;

    var end_reached = false;

    for (var x=0;!end_reached;x++) {
        ctx.beginPath();
        ctx.moveTo(p.start.x, p.start.y);
        ctx.bezierCurveTo(
            p.width_modifier + p.width_modifier * x, p.height_modifier2,
            p.width_modifier + p.width_modifier * x, p.stop.y + p.height_modifier1,
            p.stop.x, p.stop.y
        );
        ctx.stroke();
        /* check whether we would draw outside of right pumpkin border
         * in the next iteration
         */
        end_reached = p.width_modifier + p.width_modifier * (x + 1) > cw - p.width_modifier;
    }
}

var generate_body = function(ctx, cw, ch, rng, p) {
    console.log('Generating body and color of pumpkin...');

    // x1 and x2 for gradient
    var angle = rng.nextInt(0, 20);
    var angle2 = rng.nextInt(0, 20);
    var gradient = ctx.createLinearGradient(
        p.start.x - angle, p.start.y,
        p.start.x - angle2, p.stop.y
    );
    var color1 = 'rgb(' + rng.nextInt(200, 255) + ', ' + rng.nextInt(80, 110) + ', 0)';
    var color2 = 'rgb(' + rng.nextInt(120, 150) + ', ' + rng.nextInt(30, 80) + ', 0)';
    var color3 = 'rgb(' + rng.nextInt(0, 20) + ', ' + rng.nextInt(1, 20) + ', 0)';
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color3);

    ctx.fillStyle=gradient;

    ctx.beginPath();
    ctx.moveTo(p.start.x, p.start.y);
    ctx.bezierCurveTo(
        p.width_modifier, p.height_modifier2, // control point 1
        p.width_modifier, p.stop.y + p.height_modifier1, // control point 2
        p.stop.x, p.stop.y // end point
    );
    ctx.bezierCurveTo(
        cw - p.width_modifier, p.stop.y + p.height_modifier1,
        cw - p.width_modifier, p.height_modifier2,
        p.start.x, p.start.y
    );
    ctx.fill();
};

var initialize_everything = function(e) {
    document.getElementById('btn_generate').onclick = generate_pumpkin;
    generate_pumpkin(e);
}

window.onload = initialize_everything;
