var DRAWING_MODE = 'DRAWING_MODE';
var ERASING_MODE = 'ERASING_MODE';
var EDITING_MODE = 'EDITING_MODE';

var PATTERNS = {
    DRAWING_MODE: [DOT, DOT, DOT],
    ERASING_MODE: [DOT, DASH, DOT],
    EDITING_MODE: [DASH, DASH, DASH]
};

var DOT = 50;
var DASH = 100;

var status = DRAWING_MODE;
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var lastX = 0, lastY = 0;
var eraserSize = 30, penSize = 2, editSize = 20;

function changeMode(mode) {
    status = mode;
    window.navigator.vibrate(PATTERNS[status]);
}

function draw(ctx,x,y,size) {
    if (lastX && lastY && (x !== lastX || y !== lastY)) {
        ctx.fillStyle = "#000000";
        ctx.lineWidth = 2 * size;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    lastX = x;
    lastY = y;
}

function erase(ctx,x, y, size) {
    ctx.clearRect(x - size/2, y - size/2, size, size);
}

canvas.addEventListener('touchmove', function(e) {
    var point = e.targetTouches[0];
    switch(status) {
        case DRAWING_MODE:
            draw(ctx, point.clientX, point.clientY, penSize);
            break;
        case ERASING_MODE:
            erase(ctx, point.clientX, point.clientY, eraserSize);
            break;
        case EDITING_MODE:
            for (var datum of ctx.getImageData(point.clientX - editSize/2, point.clientY - editSize/2, editSize, editSize).data) {
                if (datum !== 0) {
                    window.navigator.vibrate(DOT);
                    break;
                }
            }
            break;
    }
});

canvas.addEventListener('touchend', function() {
    lastX = 0;
    lastY = 0;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

var changeModeButtons = document.querySelectorAll('.change-mode');
for (var i = 0; i < changeModeButtons.length; i++) {
    changeModeButtons[i].addEventListener('click', function(e) {
        changeMode(e.target.id);
    });
}
