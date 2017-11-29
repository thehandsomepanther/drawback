var DRAWING_MODE = 'DRAWING_MODE';
var ERASING_MODE = 'ERASING_MODE';
var EDITING_MODE = 'EDITING_MODE';
var EXPORT = 'EXPORT';

var timeout;
var lastTap = 0;
var listening = false;

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
var synth = window.speechSynthesis;


speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
//recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.onresult = function(event) {
    var last = event.results.length - 1;
    var word = event.results[last][0].transcript;
    var utterThis = new SpeechSynthesisUtterance(word);
    
    switch (word) {
        case "draw":
            changeMode(DRAWING_MODE);
            synth.speak(utterThis);
            break;
        case "feel":
            changeMode(EDITING_MODE);
            synth.speak(utterThis);
            break;
        case "erase":
            changeMode(ERASING_MODE);
            synth.speak(utterThis);
            break;
    }
    console.log('Confidence: ' + event.results[0][0].confidence);
}
recognition.onspeechend = function() {
    recognition.stop();
    listening = false;
}

var colors = ['draw', 'erase', 'edit'];
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

var DOT = 50;
var DASH = 200;

var PATTERNS = {
    DRAWING_MODE: [DOT, DOT, DOT],
    ERASING_MODE: [DOT, DASH, DOT],
    EDITING_MODE: [DASH, DASH, DASH]
};

var status = DRAWING_MODE;
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var svgctx = new C2S(canvas.width, canvas.height);
var lastX = 0, lastY = 0;
var eraserSize = 30, penSize = 2, editSize = 20;


function handleClick(id) {
    switch (id) {
        case DRAWING_MODE:
        case ERASING_MODE:
        case EDITING_MODE:
            changeMode(id);
            break;
        case EXPORT:
            exportToSVG();
            break;
    }
}

function exportToSVG() {
    var drawing = svgctx.getSerializedSvg(true);
    var a = window.document.createElement('a');    
    a.href = window.URL.createObjectURL(new Blob([drawing], {type: 'image/svg+xml'}));
    a.download = 'drawing.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

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

        svgctx.fillStyle = "#000000";
        svgctx.lineWidth = 2 * size;
        svgctx.beginPath();
        svgctx.moveTo(lastX, lastY);
        svgctx.lineTo(x, y);
        svgctx.stroke();
    }
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();

    svgctx.fillStyle = "#000000";
    svgctx.beginPath();
    svgctx.arc(x, y, size, 0, Math.PI*2, true);
    svgctx.closePath();
    svgctx.fill();
    lastX = x;
    lastY = y;
}

function erase(ctx,x, y, size) {
    ctx.clearRect(x - size/2, y - size/2, size, size);
}

canvas.addEventListener('touchend', function(e) {
    var currentTime = new Date().getTime();
    var tapLength = currentTime - lastTap;        

    e.preventDefault();
    clearTimeout(timeout);

    if(tapLength < 500 && tapLength > 0){
        if (!listening) {
            recognition.start();
            listening = true;
        }

        //Double Tap/Click

    }else{
        timeout = setTimeout(function(){
            //Single Tap/Click code here
            clearTimeout(timeout); 
        }, 500);
    }
    lastTap = currentTime;
    setTimeout(function() {
        lastX = 0;
        lastY = 0;
    }, 30)
});

canvas.addEventListener('touchmove', _.throttle(function(e) {
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
                    window.navigator.vibrate(20);
                    break;
                }
            }
            break;
    }
}, 75, {
    'trailing': true
}));

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

var changeModeButtons = document.querySelectorAll('.change-mode');
for (var i = 0; i < changeModeButtons.length; i++) {
    changeModeButtons[i].addEventListener('click', function(e) {
        handleClick(e.target.id);
    });
}

