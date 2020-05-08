let points = [];

let font;

let audio;
let previousAudio;

let playButton;
let pauseButton;
let clearButton;
let textInput;

const WAVConfig = {
    subchunk1Size: 16,
    audioFormat: 1,
    numChannels: 2,
    sampleRate: 22050,
    bitsPerSample: 8,
};

function preload() {
    font = loadFont("assets/Inconsolata.otf");
}

function setup() {
    createCanvas(1000, 800);

    playButton = createButton("Play");
    playButton.mousePressed(play);

    pauseButton = createButton("Pause");
    pauseButton.mousePressed(pause);

    clearButton = createButton("Clear");
    clearButton.mousePressed(clearScreen);

    textInput = createInput();
    textInput.input(handleTextChange);

    audio = new Audio();

    audio.loop = true;
}

function clearScreen() {
    points = [];
}

function handleTextChange() {
    let text = this.value();
    clearScreen();
    if (text.length == 0) {
        pause();
        return;
    }
    points.push(...font.textToPoints(this.value(), 50, 400, 300));
    play();
}

function play() {
    audio.pause();

    updateAudio();

    audio.play();
}

function pause() {
    audio.pause();
}

function draw() {
    background(61, 97, 121);
    stroke(255);
    strokeWeight(1);
    fill(255);
    text("points.length: " + points.length, 20, 20);

    drawGrid();

    if (points.length < 2) return;

    drawLine(points);
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

        beginShape();

        vertex(p.x, p.y);
        vertex(nextPoint.x, nextPoint.y);
        endShape();
    }
}

function mousePressed() {
    addPoints();
}

function mouseDragged() {
    addPoints();
}

function addPoints() {
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        points.push(createVector(mouseX, mouseY));
    }
}

function repeatArray(array, n) {
    // Return an array of length n,
    // made of repeated copies of the input array.
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
    if (points.length < 2) return;

    // Generate about 10 seconds worth of data.
    let length = 200000;

    let data = mapValues(points, 0, 256);
    data = repeatArray(data, length);

    let wav = makeWAV(WAVConfig, data);

    src = "data:audio/x-wav;base64," + btoa(wav);

    audio.src = src;
}

function addPentagram() {
    let r = 100;

    for (let a = 0; a <= 4 * PI; a += TWO_PI / 2.5) {
        let x = width / 2 + r * cos(a);
        let y = height / 2 + r * sin(a);
        let newPoint = createVector(x, y);
        points.push(newPoint);
    }
}
