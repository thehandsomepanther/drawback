var DRAWING_MODE = 'DRAWING_MODE';
var ERASING_MODE = 'ERASING_MODE';
var EDITING_MODE = 'EDITING_MODE';

var status = DRAWING_MODE;
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var lastX = 0, lastY = 0;

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

canvas.addEventListener('touchmove', function(e) {
    var point = e.targetTouches[0];
    draw(ctx, point.clientX, point.clientY, 2);
    window.navigator.vibrate(50);
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
