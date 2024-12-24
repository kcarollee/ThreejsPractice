let fontFile;
let font;
let testString = "VARIABLE TYPE ";
let fontPath;
let fontData;
let defaultSize = 130;
let textCanvas;
let testLinePairs;

let linePairsArr = [];
class LinePairs {
    constructor() {
        this.lineArr1 = [];
        this.lineArr2 = [];

        this.lineArrCopy1 = [];
        this.lineArrCopy2 = [];
        this.mouseDraggedCount = 0;
        this.drawModel = false;

        this.model;

        console.log(this.mouseDraggedCount);
    }

    premadeLines() {
        let numSeg = 100;
        let radius1 = 500;
        let radius2 = 400;
        let degInc = PI / numSeg;
        for (let i = 0; i < numSeg; i++) {
            let x = radius1 * cos(PI + degInc * i);
            let y = radius1 * sin(PI + degInc * i);
            this.lineArr1.push(createVector(x, y));
        }

        for (let i = 0; i < numSeg; i++) {
            let x = radius2 * cos(PI + degInc * i);
            let y = radius2 * sin(PI + degInc * i);
            this.lineArr2.push(createVector(x, y));
        }
    }

    // https://www.paulwheeler.us/articles/custom-3d-geometry-in-p5js/
    createModelFromLines() {
        let lineArr1 = this.lineArr1;
        let lineArr2 = this.lineArr2;
        let stripPointsNum = min(lineArr1.length, lineArr2.length);
        let uvxDiv = 1.0 / stripPointsNum;

        this.model = new p5.Geometry(1, 1, function createGeometry() {
            for (let i = 0; i < stripPointsNum - 1; i++) {
                this.vertices.push(lineArr1[i]);
                this.vertices.push(lineArr2[i]);

                this.uvs.push([uvxDiv * i, 0]);
                this.uvs.push([uvxDiv * i, 1]);
            }

            this.computeFaces();
        });
    }

    distort() {
        let lineArrCopy1 = this.lineArrCopy1;
        let lineArrCopy2 = this.lineArrCopy2;

        let timeCoef = 0.005;
        let noisePeriod = 0.01;
        let noiseAmp = 50.0;
        //console.log(this.lineArr1[0])
        this.lineArr1.forEach(function (p, i) {
            let initX = lineArrCopy1[i].x;
            let initY = lineArrCopy1[i].y;

            let noiseX = map(noise(frameCount * timeCoef + initX * noisePeriod), 0, 1, -1, 1) * noiseAmp;
            let noiseY = map(noise(frameCount * timeCoef + initY * noisePeriod), 0, 1, -1, 1) * noiseAmp;

            p.x = initX + noiseX;
            p.y = initY + noiseY;
        });

        this.lineArr2.forEach(function (p, i) {
            let initX = lineArrCopy2[i].x;
            let initY = lineArrCopy2[i].y;

            let noiseX = map(noise(frameCount * timeCoef + initX * noisePeriod), 0, 1, -1, 1) * noiseAmp;
            let noiseY = map(noise(frameCount * timeCoef + initY * noisePeriod), 0, 1, -1, 1) * noiseAmp;

            p.x = initX + noiseX;
            p.y = initY + noiseY;
        });
    }

    display(img) {
        //this.distort();
        if (!this.drawModel) {
            stroke(0);
            beginShape(LINES);
            this.lineArr1.forEach(function (p) {
                vertex(p.x, p.y);
            });
            endShape();

            beginShape(LINES);
            this.lineArr2.forEach(function (p) {
                vertex(p.x, p.y);
            });
            endShape();

            beginShape(LINES);
            for (let i = 0; i < min(this.lineArr1.length, this.lineArr2.length); i++) {
                vertex(this.lineArr1[i].x, this.lineArr1[i].y);
                vertex(this.lineArr2[i].x, this.lineArr2[i].y);
            }
            endShape();
        } else {
            //console.log("HUH");
            /*
			texture(img);
			model(this.model);
			*/
            noStroke();
            let stripPointsNum = min(this.lineArr1.length, this.lineArr2.length);
            let uvxDiv = 1.0 / stripPointsNum;

            push();
            texture(img);
            textureMode(NORMAL);
            beginShape(TRIANGLE_STRIP);
            for (let i = 0; i < stripPointsNum - 1; i++) {
                vertex(this.lineArr1[i].x, this.lineArr1[i].y, uvxDiv * i, 0);
                vertex(this.lineArr2[i].x, this.lineArr2[i].y, uvxDiv * i, 1);
            }
            endShape();
            pop();
        }
    }

    onMousePressed() {
        if (!this.drawModel) this.mouseDraggedCount++;
    }

    onMouseReleased() {
        if (this.mouseDraggedCount == 1 && !this.drawModel) {
            //this.lineArrCopy1 = Array.from(this.lineArr1);
        }

        if (this.mouseDraggedCount == 2 && !this.drawModel) {
            //console.log("CREATE SHAPE");
            //this.createModelFromLines();
            //this.lineArrCopy2 = Array.from(this.lineArr2);
            this.drawModel = true;

            linePairsArr.push(new LinePairs());
        }
    }

    onMouseDragged() {
        //console.log(this.mouseDraggedCount);
        if (!this.drawModel) {
            switch (this.mouseDraggedCount) {
                case 1:
                    this.lineArr1.push(createVector(mouseX - width * 0.5, mouseY - height * 0.5));
                    this.lineArrCopy1.push(createVector(mouseX - width * 0.5, mouseY - height * 0.5));
                    break;
                case 2:
                    this.lineArr2.push(createVector(mouseX - width * 0.5, mouseY - height * 0.5));
                    this.lineArrCopy2.push(createVector(mouseX - width * 0.5, mouseY - height * 0.5));
                    break;
            }
        }
    }
}

function preload() {
    fontFile = loadFont("Silk Serif Bold.otf");

    fontData = loadBytes("helvetica.ttf");
}
let bbox;
function setup() {
    bbox = fontFile.textBounds(testString, 0, defaultSize * 0.725, defaultSize);

    textCanvas = createGraphics(bbox.w, bbox.h);
    textCanvas.textFont(fontFile);
    textCanvas.textSize(defaultSize);
    textCanvas.smooth();

    console.log(textCanvas.width, textCanvas.height);

    //textCanvas.pixelDensity(1)
    createCanvas(windowWidth, windowHeight, WEBGL);
    textFont(fontFile);
    textSize(defaultSize);

    smooth();

    testLinePairs = new LinePairs();
    linePairsArr.push(testLinePairs);

    //font = opentype.parse(fontData.bytes.buffer);
    //fontPath = font.getPath("EXAMPLE", 0, 0, 72);

    //testLinePairs.createModelFromLines();
}

function draw() {
    textCanvas.background(0, 0);
    textCanvas.text(testString, 0, defaultSize * 0.725);
    background(255);

    noFill();
    linePairsArr.forEach(function (linePair) {
        linePair.display(textCanvas);
        linePair.distort();
    });

    ellipse(mouseX - width * 0.5, mouseY - height * 0.5, 50, 50);
    //rect(bbox.x, bbox.y, bbox.w, bbox.h);
    image(textCanvas, bbox.x - width * 0.5 + bbox.x * 0.5, bbox.y - height * 0.5 + bbox.y * 0.5);
}

function mousePressed() {
    linePairsArr.forEach(function (linePair) {
        linePair.onMousePressed();
    });
}

function mouseReleased() {
    linePairsArr.forEach(function (linePair) {
        linePair.onMouseReleased();
    });
}

function mouseDragged() {
    linePairsArr.forEach(function (linePair) {
        linePair.onMouseDragged();
    });
}

function keyTyped() {
    testString += key;
    bbox = fontFile.textBounds(testString, 0, defaultSize * 0.725, defaultSize);
    textCanvas.width = bbox.w;
    textCanvas.height = bbox.h;
    textCanvas.clear();
    textCanvas.textFont(fontFile);
    textCanvas.textSize(defaultSize);
}

function keyPressed() {
    if (keyCode == BACKSPACE) {
        testString = testString.substring(0, testString.length - 1);
        textCanvas.clear();
        console.log(testString);

        bbox = fontFile.textBounds(testString, 0, defaultSize * 0.725, defaultSize);
        textCanvas.width = bbox.w;
        textCanvas.height = bbox.h;
        textCanvas.textFont(fontFile);
        textCanvas.textSize(defaultSize);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
