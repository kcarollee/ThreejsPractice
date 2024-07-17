let fontFile;
let font;
let testString = "HELLO";
let testString2 = "HELLO"
let fontPath;
let fontData;
let defaultSize = 800;
let textCanvas, textCanvas2;
let testLinePairs, testLinePairs2;

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

		//console.log(this.mouseDraggedCount)

		this.premadeLinesMode = 0;
		this.oppositeOffsetMode = false;
		this.numSeg = LinePairs.numSeg;
	}

	premadeLines(){
		
		let radius1 = 500;
		let radius2 = 300;
		let degInc = PI / this.numSeg;

		if (this.premadeLinesMode == 0 ){
			for (let i = 0; i < this.numSeg; i++){
				let x = radius1 * cos(PI + degInc * i);
				let y = radius1 * sin(PI + degInc * i);
				this.lineArr1.push(createVector(x, y));
			}
	
			for (let i = 0; i < this.numSeg; i++){
				let x = radius2 * cos(PI + degInc * i);
				let y = radius2 * sin(PI + degInc * i);
				this.lineArr2.push(createVector(x, y));
			}
		}

		else{

			for (let i = 0; i < this.numSeg; i++){
				let x = radius2 * cos(PI - degInc * i);
				let y = radius2 * sin(PI - degInc * i);
				this.lineArr1.push(createVector(x, y));
			}
	
			for (let i = 0; i < this.numSeg; i++){
				let x = radius1 * cos(PI - degInc * i);
				let y = radius1 * sin(PI - degInc * i);
				this.lineArr2.push(createVector(x, y));
			}
		}
		
	}



	// https://www.paulwheeler.us/articles/custom-3d-geometry-in-p5js/
	createModelFromLines() {

		let lineArr1 = this.lineArr1;
		let lineArr2 = this.lineArr2;
		let stripPointsNum = min(lineArr1.length, lineArr2.length);
		let uvxDiv = 1.0 / stripPointsNum;

		this.model = new p5.Geometry(1, 1,
			function createGeometry() {
				for (let i = 0; i < stripPointsNum - 1; i++) {
					this.vertices.push(lineArr1[i]);
					this.vertices.push(lineArr2[i]);

					this.uvs.push([uvxDiv * i, 0]);
					this.uvs.push([uvxDiv * i, 1]);

				}

				this.computeFaces();
			}
		);
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
			beginShape(LINES)
			this.lineArr1.forEach(function (p) {
				vertex(p.x, p.y)
			});
			endShape();

			beginShape(LINES)
			this.lineArr2.forEach(function (p) {
				vertex(p.x, p.y)
			});
			endShape();

			beginShape(LINES)
			for (let i = 0; i < min(this.lineArr1.length, this.lineArr2.length); i++) {
				vertex(this.lineArr1[i].x, this.lineArr1[i].y);
				vertex(this.lineArr2[i].x, this.lineArr2[i].y);
			}
			endShape();
		}

		else {
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

			let uvy1, uvy2;
			if (LinePairs.flipTexture){
				uvy1 = 1;
				uvy2 = 0;
			}

			else {
				uvy1 = 0;
				uvy2 = 1;
			}
			for (let i = 0; i < stripPointsNum - 1; i++) {
				vertex(this.lineArr1[i].x, this.lineArr1[i].y, uvxDiv * i, uvy1);
				vertex(this.lineArr2[i].x, this.lineArr2[i].y, uvxDiv * i, uvy2);
			}
			endShape();
			pop();

		}
	}

	// onMousePressed() {
	// 	if (!this.drawModel) this.mouseDraggedCount++;
	// }

	// onMouseReleased() {
	// 	if (this.mouseDraggedCount == 1 && !this.drawModel) {
	// 		//this.lineArrCopy1 = Array.from(this.lineArr1);
	// 	}

	// 	if (this.mouseDraggedCount == 2 && !this.drawModel) {
	// 		//console.log("CREATE SHAPE");
	// 		//this.createModelFromLines();
	// 		//this.lineArrCopy2 = Array.from(this.lineArr2);
	// 		this.drawModel = true;

	// 		linePairsArr.push(new LinePairs());
	// 	}
	// }

	chngeProperties(sliderVal, sliderVal2, sliderVal3, sliderVal4){
		
		let radius1 = sliderVal;

		let radius2 = sliderVal2;
		let degInc = PI / this.numSeg;

		let xOffset = sliderVal3;
		let yOffset = sliderVal4

		if (this.premadeLinesMode == 0 ){
			for (let i = 0; i < this.numSeg; i++){
				let x = radius1 * cos(PI + degInc * i);
				let y = radius1 * sin(PI + degInc * i);
				this.lineArr1[i].x = x;
				this.lineArr1[i].y = y;
			}
	
			for (let i = 0; i < this.numSeg; i++){
				let x = radius2 * cos(PI + degInc * i) + xOffset;
				let y = radius2 * sin(PI + degInc * i) + yOffset;
				this.lineArr2[i].x = x;
				this.lineArr2[i].y = y;
			}
		}

		else{
			for (let i = 0; i < this.numSeg; i++){
				let x, y;
				if (this.oppositeOffsetMode){
					x = radius2 * cos(PI - degInc * i) - xOffset;
					y = radius2 * sin(PI - degInc * i) - yOffset;
				}
				else{
					x = radius2 * cos(PI - degInc * i) + xOffset;
					y = radius2 * sin(PI - degInc * i) + yOffset;
				}
				this.lineArr1[i].x = x;
				this.lineArr1[i].y = y;
			}
	
			for (let i = 0; i < this.numSeg; i++){
				let x = radius1 * cos(PI - degInc * i);
				let y = radius1 * sin(PI - degInc * i);
				this.lineArr2[i].x = x;
				this.lineArr2[i].y = y;
			}
		}
	}

	randomizeProperties(){
		
		let radius1 = map(noise(frameCount * 0.01 + 13), 0, 1, 0, 500);;

		let radius2 = map(noise(frameCount * 0.01 + 19), 0, 1, 0, 500);
		let degInc = PI / this.numSeg;

		let xOffset = map(noise(frameCount * 0.01 + 31), 0, 1, -250, 250);
		let yOffset = map(noise(frameCount * 0.01 + 41), 0, 1, -250, 250);

		if (this.premadeLinesMode == 0 ){
			for (let i = 0; i < this.numSeg; i++){
				let x = radius1 * cos(PI + degInc * i);
				let y = radius1 * sin(PI + degInc * i);
				this.lineArr1[i].x = x;
				this.lineArr1[i].y = y;
			}
	
			for (let i = 0; i < this.numSeg; i++){
				let x = radius2 * cos(PI + degInc * i) + xOffset;
				let y = radius2 * sin(PI + degInc * i) + yOffset;
				this.lineArr2[i].x = x;
				this.lineArr2[i].y = y;
			}
		}

		else{
			for (let i = 0; i < this.numSeg; i++){
				let x, y;
				if (this.oppositeOffsetMode){
					x = radius2 * cos(PI - degInc * i) - xOffset;
					y = radius2 * sin(PI - degInc * i) - yOffset;
				}
				else{
					x = radius2 * cos(PI - degInc * i) + xOffset;
					y = radius2 * sin(PI - degInc * i) + yOffset;
				}
				this.lineArr1[i].x = x;
				this.lineArr1[i].y = y;
			}
	
			for (let i = 0; i < this.numSeg; i++){
				let x = radius1 * cos(PI - degInc * i);
				let y = radius1 * sin(PI - degInc * i);
				this.lineArr2[i].x = x;
				this.lineArr2[i].y = y;
			}
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

LinePairs.numSeg = 500;
LinePairs.flipTexture = false;
LinePairs.randomMode = false;
function preload() {
	let fontNames = ["helvetica.ttf", "Silk Serif Bold.otf", "Skinny Type - Mestora Regular.otf", "nhg.ttf", "nhg bold.ttf"];
	fontFile = loadFont(fontNames[0]);

	fontData = loadBytes("helvetica.ttf");
}
let bbox, bbox2;
let slider1, slider2, slider3, slider4;
let button, button2, button3, button4;
function toggleOppositeOffsetMode(){
	linePairsArr[0].oppositeOffsetMode = !linePairsArr[0].oppositeOffsetMode;
	linePairsArr[1].oppositeOffsetMode = !linePairsArr[1].oppositeOffsetMode;
}

function toggleSkeletons(){
	linePairsArr[0].drawModel = !linePairsArr[0].drawModel;
	linePairsArr[1].drawModel = !linePairsArr[1].drawModel;
}

function toggleTextureFlip(){
	LinePairs.flipTexture = !LinePairs.flipTexture;
}

function toggleRandomMode(){
	LinePairs.randomMode = !LinePairs.randomMode;
}

function setup() {
	// outer radius
	slider1 = createSlider(0, 500, 500);
	slider1.position(10, 10);
	slider1.size(80);

	// inner radius
	slider2 = createSlider(0, 500, 400);
	slider2.position(10, 30);
	slider2.size(80);

	// x offset
	slider3 = createSlider(-250, 250, 0);
	slider3.position(10, 50);
	slider3.size(80);

	// y offset
	slider4 = createSlider(-250, 250, 0);
	slider4.position(10, 70);
	slider4.size(80);

	// toggle opposite offset
	button = createButton('opposite offset');
	button.position(10, 90);
	button.size(80);
	button.mousePressed(toggleOppositeOffsetMode);

	// toggle skeleton view
	button2 = createButton('toggle skeletons');
	button2.position(10, 130);
	button2.size(80);
	button2.mousePressed(toggleSkeletons);

	// toggle texture flip (y)
	button3 = createButton('flip textures');
	button3.position(10, 170);
	button3.size(80);
	button3.mousePressed(toggleTextureFlip);

	// toggle random mode
	button4 = createButton('toggle random');
	button4.position(10, 210);
	button4.size(80);
	button4.mousePressed(toggleRandomMode);
	
	bbox = fontFile.textBounds(testString, 0, defaultSize * 0.725, defaultSize);
	bbox2 = fontFile.textBounds(testString2, 0, defaultSize * 0.725, defaultSize);

	textCanvas = createGraphics(bbox.w, bbox.h);
	textCanvas.textFont(fontFile);
	textCanvas.textSize(defaultSize);
	textCanvas.smooth();

	textCanvas2 = createGraphics(bbox2.w, bbox2.h);
	textCanvas2.textFont(fontFile);
	textCanvas2.textSize(defaultSize);
	textCanvas2.smooth();


	//textCanvas.pixelDensity(1)
	createCanvas(windowWidth, windowHeight, WEBGL);
	textFont(fontFile);
	textSize(defaultSize);

	smooth();

	testLinePairs = new LinePairs;
	testLinePairs.premadeLines();
	testLinePairs.drawModel = true;
	linePairsArr.push(testLinePairs);

	testLinePairs2 = new LinePairs;
	testLinePairs2.premadeLinesMode = 1;
	testLinePairs2.premadeLines();
	testLinePairs2.drawModel = true;
	linePairsArr.push(testLinePairs2);

	console.log(linePairsArr);

	//font = opentype.parse(fontData.bytes.buffer);
	//fontPath = font.getPath("EXAMPLE", 0, 0, 72);

	//testLinePairs.createModelFromLines();
}

function draw() {
	textCanvas.background(0, 0);
	textCanvas.text(testString, 0, defaultSize * 0.725);

	textCanvas2.background(0, 0);
	textCanvas2.text(testString2, 0, defaultSize * 0.725);
	background(255);

	//noFill();
	// linePairsArr.forEach(function (linePair) {
	// 	linePair.display(textCanvas);
	// })

	//rotate(frameCount * 0.01);

	linePairsArr[0].display(textCanvas);
	linePairsArr[1].display(textCanvas2);

	

	if (LinePairs.randomMode){
		linePairsArr[0].randomizeProperties();
		linePairsArr[1].randomizeProperties();
	}

	else {
		linePairsArr[0].chngeProperties(slider1.value(), slider2.value(), slider3.value(), slider4.value());
		linePairsArr[1].chngeProperties(slider1.value(), slider2.value(), slider3.value(), slider4.value());
	}
	//ellipse(mouseX - width * 0.5, mouseY - height * 0.5, 50, 50);
	//rect(bbox.x, bbox.y, bbox.w, bbox.h);
	//image(textCanvas, bbox.x - width * 0.5 + bbox.x * 0.5, bbox.y - height * 0.5  + bbox.y * 0.5);
}


// function mousePressed() {



// 	linePairsArr.forEach(function (linePair) {
// 		linePair.onMousePressed();
// 	})
// }

// function mouseReleased() {
// 	linePairsArr.forEach(function (linePair) {
// 		linePair.onMouseReleased();
// 	})
// }



// function mouseDragged() {
// 	linePairsArr.forEach(function (linePair) {
// 		linePair.onMouseDragged();
// 	})
// }

function keyTyped() {
	testString += key;


}

function keyPressed() {
	if (keyCode == BACKSPACE) {
		testString = testString.substring(0, testString.length - 1);
		textCanvas.clear();
		console.log(testString);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}