var DRAWING_MODE = 'DRAWING_MODE';
var ERASING_MODE = 'ERASING_MODE';
var EDITING_MODE = 'EDITING_MODE';

var status = DRAWING_MODE;
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var lastX = 0, lastY = 0;

function changeMode() {
    if (status == ERASING_MODE) status = DRAWING_MODE
    else if (status == DRAWING_MODE) status = ERASING_MODE
    console.log(status)
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
    ctx.clearRect(x, y, 30, 30); 
}
canvas.addEventListener('touchmove', function(e) {
    var point = e.targetTouches[0];
    console.log(status)
    switch(status) {
        case DRAWING_MODE:
            draw(ctx, point.clientX, point.clientY, 2);
            break;
        case ERASING_MODE:
            console.log('suh')
            erase(ctx, point.clientX, point.clientY, 2);
            break;
        case EDITING_MODE:
            window.navigator.vibrate(50);
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
