let points = [];
let textPoints = [];

let wavHandler;

let font;

let audio;

let mute = false;

let muteCheckbox;
let clearButton;
let textInput;
let starButton;

const WAVConfig = {
    numChannels: 2,
    sampleRate: 22050,
    bitsPerSample: 8,
};

function preload() {
    font = loadFont("assets/Inconsolata.otf");
}

function setup() {
    wavHandler = new WAVHandler(WAVConfig);

    createCanvas(1000, 800);

    setupHTMLElements();

    audio = new Audio();

    audio.loop = true;
}

function setupHTMLElements() {
    muteCheckbox = createCheckbox("Mute");
    muteCheckbox.changed(handleMute);

    clearButton = createButton("Clear");
    clearButton.mousePressed(clearScreen);

    textInput = createInput();
    textInput.input(handleTextChange);

    starButton = createButton("⛧");
    starButton.mousePressed(addPentagram);
}

function handleMute() {
    if (this.checked()) {
        mute = true;
        audio.pause();
    } else {
        mute = false;
        audio.play();
    }
}

function clearScreen() {
    points = [];
}

function handleTextChange() {
    let text = this.value();

    textPoints = font.textToPoints(text, 50, 400, 300);
    play();
}

function play() {
    if (mute || noPoints()) {
        audio.pause();
        return;
    }

    audio.pause();

    updateAudio();

    audio.play();
}

function noPoints() {
    return points.length < 1 && textPoints.length < 1;
}

function draw() {
    background(61, 97, 121);

    fill(255);
    noStroke();
    const totalPoints = points.length + textPoints.length;
    text("total points: " + totalPoints, 20, 20);

    drawGrid();

    if (noPoints()) return;

    drawLine(points);
    drawLine(textPoints);
}

function drawGrid() {
    let cols = 10;
    let rows = 8;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let w = width / cols;
            let h = height / rows;

            let x = i * w;
            let y = j * h;

            stroke(0);
            noFill();
            strokeWeight(0.2);

            rect(x, y, w, h);
        }
    }
}

function drawLine(points) {
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let nextPoint;

        if (i === points.length - 1) nextPoint = points[0];
        else nextPoint = points[i + 1];

        d = dist(p.x, p.y, nextPoint.x, nextPoint.y);
        d = constrain(d, 1, 200);

        let alpha = map(d, 200, 1, 50, 250);

        strokeWeight(4);
        stroke(150, 255, 200, alpha);

        line(p.x, p.y, nextPoint.x, nextPoint.y);
    }
}

function mousePressed() {
    addPoints();
}

function mouseDragged() {
    addPoints();
}

function mouseReleased() {
    if (mouseAboveCanvas()) play();
}

function mouseAboveCanvas() {
    return mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height;
}

function addPoints() {
    if (mouseAboveCanvas()) {
        points.push(createVector(mouseX, mouseY));
    }
}

function repeatArray(array, n) {
    let repeated = array.slice();
    while (repeated.length < n) {
        repeated = repeated.concat(repeated);
    }
    return repeated.slice(0, n);
}

function mapValues(array, min, max) {
    let newArray = [];

    for (let point of array) {
        let x = map(point.x, 0, width, min, max);
        let y = map(point.y, height, 0, min, max);
        newArray.push(createVector(x, y));
    }

    return newArray;
}

function updateAudio() {
    const length = 20000;

    let data = points.concat(textPoints);

    data = mapValues(data, 0, 256);
    data = repeatArray(data, length);

    wavHandler.setData(data);
    const wavString = wavHandler.getFileString();

    const src = "data:audio/x-wav;base64," + btoa(wavString);

    audio.src = src;
}

function addPentagram() {
    let r = width / 3;

    let vertices = [];

    for (let a = PI / 2; a <= 5 * PI; a += TWO_PI / 2.5) {
        let x = width / 2 + r * cos(a);
        let y = height / 2 + r * sin(a);
        let newPoint = createVector(x, y);
        vertices.push(newPoint);
    }

    let pentagramInterpolated = lerpArray(vertices, 0.01);

    points.push(...pentagramInterpolated);

    play();
}

function lerpArray(vertices, step) {
    const returnArr = [];

    for (let i = 0; i < vertices.length - 1; i++) {
        let amount = 0;

        const v1 = vertices[i];
        const v2 = vertices[i + 1];

        while (amount < 1) {
            amount += step;
            let p = p5.Vector.lerp(v1, v2, amount);
            returnArr.push(p);
        }
    }

    return returnArr;
}
