class Node {
    constructor(posX, posY, w, h) {
        this.posX = posX;
        this.posY = posY;

        this.nextPosX = null;
        this.nextPosY = null;

        this.w = w;
        this.h = h;

        this.drawMode = Math.floor(Math.random() * 2);

        switch (this.drawMode) {
            case 0:
                break;
            case 1:
                Node.currentNodes.push(this);
                break;
            case 2:
                Node.nextNodes.push(this);
                break;
        }

        //console.log(Node.nextNodes);
        this.triWidth = 0.5 * this.w;
        this.centerPosX = this.posX + this.w * 0.5;
        this.centerPosY = this.posY + this.h * 0.5;

        this.triPos1 = null;
        this.triPos2 = null;
        this.triPos3 = null;

        this.nextPosX = null;
        this.nextPosY = null;

        this.nextNodeSelected = false;
        this.nextNode = null;
        this.c1 = null;
        this.c2 = null;

        this.timeElapsed = 0;
        Node.nodeArr.push(this);
    }

    display() {
        stroke(255);
        noFill();
        rect(this.posX, this.posY, this.w, this.h);

        switch (this.drawMode) {
            case 0:
                break;
            case 1:
                noStroke();
                fill(0, 255, 0);
                circle(
                    this.posX + this.w * 0.5,
                    this.posY + this.h * 0.5,
                    this.w * 0.5
                );

                stroke(255);
                strokeWeight(1);
                noFill();
                //line(this.centerPosX, this.centerPosY, this.nextPosX, this.nextPosY);
                this.drawBezierCurve();
                this.drawBezierPoint();
                strokeWeight(1);

                noStroke();
                fill(255, 0, 0);
                triangle(
                    this.triPos1[0],
                    this.triPos1[1],
                    this.triPos2[0],
                    this.triPos2[1],
                    this.triPos3[0],
                    this.triPos3[1]
                );
                break;
            case 2:
                noStroke();
                fill(255, 0, 0);
                triangle(
                    this.triPos1[0],
                    this.triPos1[1],
                    this.triPos2[0],
                    this.triPos2[1],
                    this.triPos3[0],
                    this.triPos3[1]
                );
                break;
        }
    }

    selectNodeFromArray() {
        if (this.drawMode != 1 || this.nextNodeSelected) return;
        this.nextNode = random(Node.nodeArr);
        this.nextPosX = this.nextNode.centerPosX;
        this.nextPosY = this.nextNode.centerPosY;

        this.triPos1 = [this.nextPosX, this.nextPosY - this.triWidth / sqrt(3)];
        this.triPos2 = [
            this.nextPosX - this.triWidth * 0.5,
            this.nextPosY + this.triWidth / (2 * sqrt(3)),
        ];
        this.triPos3 = [
            this.nextPosX + this.triWidth * 0.5,
            this.nextPosY + this.triWidth / (2 * sqrt(3)),
        ];

        this.nextNodeSelected = true;
    }

    drawBezierCurve() {
        let x1 = this.centerPosX;
        let y1 = this.centerPosY;
        let x2 = this.nextPosX;
        let y2 = this.nextPosY;

        let p1 = createVector(x1 + (x2 - x1) / 3, y1 + (y2 - y1) / 3);
        let p2 = createVector(
            x1 + ((x2 - x1) * 2) / 3,
            y1 + ((y2 - y1) * 2) / 3
        );

        let dirVec1 = createVector(1, -(x2 - x1) / (y2 - y1));
        dirVec1.normalize();

        let d = 10;
        this.c1 = p5.Vector.add(p1, dirVec1.mult(d));
        this.c2 = p5.Vector.add(p2, dirVec1.mult(-d));

        bezier(x1, y1, this.c1.x, this.c1.y, this.c2.x, this.c2.y, x2, y2);
    }

    drawBezierPoint() {
        //this.timeElapsed += (1 - this.timeElapsed) * 0.05;
        let tPos;

        switch (Node.transitionMode) {
            case 0:
                this.timeElapsed += 0.01;
                tPos = this.timeElapsed;
                break;
            case 1:
                this.timeElapsed += (1 - this.timeElapsed) * 0.05;
                tPos = this.timeElapsed;
                break;
            case 2:
                this.timeElapsed += 0.01;
                tPos =
                    this.timeElapsed +
                    0.1 * Math.sin(8 * Math.PI * this.timeElapsed);
                break;
        }
        let x = bezierPoint(
            this.centerPosX,
            this.c1.x,
            this.c2.x,
            this.nextPosX,
            tPos
        );
        let y = bezierPoint(
            this.centerPosY,
            this.c1.y,
            this.c2.y,
            this.nextPosY,
            tPos
        );

        fill(255);
        circle(x, y, 10);

        if (this.timeElapsed > 0.999) {
            this.timeElapsed = 0;
            this.drawMode = 0;
            this.nextNodeSelected = false;
            this.nextNode.drawMode = 1;
            this.nextNode.selectNodeFromArray();
            //this.nextNode.nextNode.drawMode = 2;
        }
    }

    static randomizeNextNodes() {}
}

Node.nodeArr = [];
Node.currentNodes = [];
Node.nextNodes = [];
Node.transitionMode = 0;
const rowNum = 12;
const colNum = 11;
const nodeWidth = 50;
const nodeHeight = 50;
const offsetX = 20;
const offsetY = 20;
const gap = 10;
const nodeArr = [];

function setup() {
    createCanvas(1000, 1000);

    for (let i = 0; i < rowNum; i++) {
        for (let j = 0; j < colNum; j++) {
            let x = j * nodeWidth + j * gap + offsetX;
            let y = i * nodeHeight + i * gap + offsetY;
            let tempNode = new Node(x, y, nodeWidth, nodeHeight);
            nodeArr.push(tempNode);
        }
    }
    textSize(25);
}

function draw() {
    background(0);

    noFill();
    stroke(255);
    nodeArr.forEach((node) => {
        node.selectNodeFromArray();
        node.display();
    });

    fill(255);
    let str;
    switch (Node.transitionMode) {
        case 0:
            str = "Transition Mode: LINEAR";
            break;
        case 1:
            str = "Transition Mode: EASE IN";
            break;
        case 2:
            str = "Transition Mode: JITTER";
            break;
    }
    text(str, width * 0.7, height * 0.05);
}

function keyPressed() {
    switch (key) {
        case "q":
            switchMode();
            break;
    }
}

function switchMode() {
    Node.transitionMode += 1;
    Node.transitionMode %= 3;
}
