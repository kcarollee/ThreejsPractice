import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Tile from './Tile.js';
import Cell from './Cell.js';
import WFCFloorMesh from './WFCFloorMesh.js';

function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

// CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 0, 10);

// SCENES AND GAME MODES
	let currentScene;
	let gameMode = "TITLE_SCREEN"; // TITLE_SCREEN, STAGE_SELECT, MAIN_GAME
	const titleScene = new THREE.Scene();
	titleScene.background = new THREE.Color(0xCCCCCC);

	const stageSelectScene = new THREE.Scene();
	stageSelectScene.background = new THREE.Color(0xCCCCCC);

	const mainGameScene = new THREE.Scene();
	mainGameScene.background = new THREE.Color(0xCCCCCC);

	currentScene = titleScene;
	
	renderer.render(currentScene, camera);

	
	const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.copy(currentScene.position);
    orbitControls.update();
	
	

// LOAD ROAD TEXTURES
	const tileImages = [];
	for (let i = 0; i < 54; i++){
		const tex = new THREE.TextureLoader().load(
			'assets/tiles/crosswalk/' + i + '.png'
		)
		tileImages.push(tex);
	}

	console.log(tileImages);

// WFC CONSTANTS, VARIABLES
	const tiles = [];
	const DIM = 20;
	const RSEED = 10;
	
	const dx = [0, 1, 0, -1];
	const dy = [-1, 0, 1, 0];

	let grid = [];
	let selectedArr = []; // array of selected cells
	let wfcIterCount = 0;

// WFC INIT
    const sc1 = 'ABAAAABA';
    const sc2 = 'AABAABAA';
    const sn = 'AAAAAAAA';
    const sb = 'CCCCCCCC';
    const sb1 = 'ACCCCCCC';
    const sb2 = 'CCCCCCCA';
    const sbc1 = 'AACCCCCC';
    const sbc2 = 'CCCCCCAA';

    tiles[0] = new Tile(tileImages[0], [sc1, sc1, sc1, sc1]);
    tiles[1] = new Tile(tileImages[1], [sc1, sc1, sc1, sn]);
    tiles[2] = new Tile(tileImages[2], [sc1, sc1, sn, sn]);
    tiles[3] = new Tile(tileImages[3], [sc1, sn, sc1, sn]);
    tiles[4] = new Tile(tileImages[4], [sc1, sn, sn, sn]);
    tiles[5] = new Tile(tileImages[5], [sn, sn, sn, sn]);
    tiles[6] = new Tile(tileImages[6], [sc1, sc1, sb1, sb2]);
    tiles[7] = new Tile(tileImages[7], [sc1, sn, sb1, sb2]);
    tiles[8] = new Tile(tileImages[8], [sn, sc1, sb1, sb2]);
    tiles[9] = new Tile(tileImages[9], [sn, sn, sb1, sb2]);
    tiles[10] = new Tile(tileImages[10], [sc1, sb1, sb, sb2]);
    tiles[11] = new Tile(tileImages[11], [sn, sb1, sb, sb2]);
    tiles[12] = new Tile(tileImages[12], [sc2, sc1, sc2, sc1]);
    tiles[13] = new Tile(tileImages[13], [sc2, sc1, sc2, sn]);
    tiles[14] = new Tile(tileImages[14], [sc2, sc1, sn, sc1]);
    tiles[15] = new Tile(tileImages[15], [sc2, sc1, sn, sn]);
    tiles[16] = new Tile(tileImages[16], [sc2, sn, sc2, sn]);
    tiles[17] = new Tile(tileImages[17], [sc2, sn, sn, sc1]);
    tiles[18] = new Tile(tileImages[18], [sn, sc1, sn, sc1]);
    tiles[19] = new Tile(tileImages[19], [sc2, sn, sn, sn]);
    tiles[20] = new Tile(tileImages[20], [sn, sc1, sn, sn]);
    tiles[21] = new Tile(tileImages[21], [sn, sn, sn, sn]);
    tiles[22] = new Tile(tileImages[22], [sc2, sc1, sbc1, sb2]);
    tiles[23] = new Tile(tileImages[23], [sc2, sn, sbc1, sb2]);
    tiles[24] = new Tile(tileImages[24], [sn, sc1, sbc1, sb2]);
    tiles[25] = new Tile(tileImages[25], [sn, sn, sbc1, sb2]);
    tiles[26] = new Tile(tileImages[26], [sc1, sc2, sb1, sbc2]);
    tiles[27] = new Tile(tileImages[27], [sc1, sn, sb1, sbc2]);
    tiles[28] = new Tile(tileImages[28], [sn, sc2, sb1, sbc2]);
    tiles[29] = new Tile(tileImages[29], [sn, sn, sb1, sbc2]);
    tiles[30] = new Tile(tileImages[30], [sc2, sc2, sc2, sc2]);
    tiles[31] = new Tile(tileImages[31], [sc2, sc2, sc2, sn]);
    tiles[32] = new Tile(tileImages[32], [sc2, sc2, sn, sn]);
    tiles[33] = new Tile(tileImages[33], [sc2, sn, sc2, sn]);
    tiles[34] = new Tile(tileImages[34], [sc2, sn, sn, sn]);
    tiles[35] = new Tile(tileImages[35], [sn, sn, sn, sn]);
    tiles[36] = new Tile(tileImages[36], [sc2, sc2, sbc1, sbc2]);
    tiles[37] = new Tile(tileImages[37], [sc2, sn, sbc1, sbc2]);
    tiles[38] = new Tile(tileImages[38], [sn, sc2, sbc1, sbc2]);
    tiles[39] = new Tile(tileImages[39], [sn, sn, sbc1, sbc2]);
    tiles[40] = new Tile(tileImages[40], [sc1, sbc1, sb, sbc2]);
    tiles[41] = new Tile(tileImages[41], [sn, sbc1, sb, sbc2]);
    tiles[42] = new Tile(tileImages[42], [sb, sb, sb, sb]);
    tiles[43] = new Tile(tileImages[43], [sc1, sn, sc2, sn]);
    tiles[44] = new Tile(tileImages[44], [sc2, sc1, sc1, sc1]);
    tiles[45] = new Tile(tileImages[45], [sc2, sc2, sc1, sc1]);
    tiles[46] = new Tile(tileImages[46], [sc2, sc2, sc2, sc1]);
    tiles[47] = new Tile(tileImages[47], [sn, sc1, sc1, sc2]);
    tiles[48] = new Tile(tileImages[48], [sn, sc1, sc2, sc2]);
    tiles[49] = new Tile(tileImages[49], [sn, sc2, sc1, sc1]);
    tiles[50] = new Tile(tileImages[50], [sn, sc2, sc2, sc1]);
    tiles[51] = new Tile(tileImages[51], [sn, sn, sc1, sc2]);
    tiles[52] = new Tile(tileImages[52], [sn, sn, sc2, sc1]);
    tiles[53] = new Tile(tileImages[53], [sc2, sb1, sb, sb2]);

    for (let i = 1; i < 4; i++) {
        for (let j = 0; j < 54; j++) {
            tiles.push(tiles[j].rotate(i));
        }
    }

	//console.log(tiles);

    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        tile.analyze(tiles);
    }

	startOver();
	//waveFunctionCollapseSingleIteration();
	//console.log(selectedArr);
	waveFunctionCollapseFullCycle();



// MINIMAP & MINIMAP CAMERA
	const minimapCamera = new THREE.OrthographicCamera( -5, 5, 5, -5, 1, 1000);
	const minimapRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
	const minimapCameraLookAt = new THREE.Vector3(0, 0, 0);
	
	minimapCamera.position.set(0, 2, 0);
	minimapCamera.lookAt(0, 0, 0);

	function renderOntoRenderTarget(renderer, scene, renderTarget, camera){
		renderer.setRenderTarget(renderTarget);
		renderer.clear();
		renderer.render(scene, camera);
	}

	const minimapPlaneGeom = new THREE.PlaneGeometry(window.innerWidth * 0.0025, window.innerWidth * 0.0025);
	const minimapPlaneMat = new THREE.MeshBasicMaterial({
		map: minimapRenderTarget.texture,
		side: THREE.DoubleSide,
		depthTest: false
	})

	const minimapMesh = new THREE.Mesh(minimapPlaneGeom, minimapPlaneMat);
	// set renderOrder to higher than any other objects so it always renders on the top of the screen
	minimapMesh.renderOrder = 1;
	minimapMesh.position.set(5, -5);
	mainGameScene.add(minimapMesh);




// CITY MODEL
	class StageModel {
		constructor(){
			this.stageNum;
			/*
			this.geometryArr = [];
			this.materialArr = [];	
			*/
			// TEMPORARY CITY MODELING
			this.buildingNum = 200;
			this.meshGroup = new THREE.Group();
			this.meshMaterial = new THREE.MeshNormalMaterial(); // TEMP MATERIAL
			for (let i = 0; i < this.buildingNum; i++){
				// buildings will be spread across the XZ axis
				// the Y axis determines the height of the building. if height = h yPos = h * 0.5
				let width = Math.random() + .2;
				let depth = Math.random() + .2;
				let height = Math.random() + .2;
				let radius = Math.random();
		        this.cityRadius = 5 * Math.random();

				let posx = this.cityRadius * Math.cos(radius * Math.PI * 2.0);
				let posz = this.cityRadius * Math.sin(radius * Math.PI * 2.0);
				let posy = height * 0.5;

				let buildingGeom =  new THREE.BoxGeometry(width, height, depth);
				let buildingMesh = new THREE.Mesh(buildingGeom, this.meshMaterial);
				buildingMesh.position.set(posx, posy, posz);
				this.meshGroup.add(buildingMesh);
			}


			this.stageState = {
				score: 0,
				numberOfMoves: 0,
				unlocked: false
			}
		}
		
		addToScene(scene){
			this.meshGroup.renderOrder = 0;
			scene.add(this.meshGroup);
		}
	}

	const stageArr = [];

	const titleScreenModel = new StageModel();
	titleScreenModel.meshGroup.scale.set(0.75, 0.75, 0.75);
	titleScreenModel.meshGroup.rotation.set(0.5, 0.5, 0.5);
	titleScreenModel.meshGroup.position.set(4, .0, .0);
	titleScreenModel.addToScene(currentScene);

	
// STAGE SELECT
	const stageUnlockedStatus = [
		true, false, false, false, false, false, false, false, false,
	];
	const lockedMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000})
	const unlockedMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});

	for (let i = 0; i < 9; i++){
		let tileGeom = new THREE.PlaneGeometry(1, 1);
		
		let mesh;
		if (stageUnlockedStatus[i]) mesh = new THREE.Mesh(tileGeom, unlockedMaterial);
		else mesh = new THREE.Mesh(tileGeom, lockedMaterial);
		mesh.position.set(-9 + i * 2.0, 0, 0);
		mesh.unlocked = stageUnlockedStatus[i];
		stageSelectScene.add(mesh);

	}







	/*
//GUI
	const gui = new dat.GUI();
	const controls = new function(){
		this.outputObj = function(){
			scene.children.forEach(c => console.log(c));
		}
	}
	gui.add(controls, 'outputObj');
	*/
// UI ELEMENT
	let raycaster = new THREE.Raycaster();
	let raycasterIntersects;
	const pointer = new THREE.Vector2();
	const fontLoader = new FontLoader();
	fontLoader.load('assets/fonts/font_1.json', function(font){
		const titleGeometry = new TextGeometry('THREEGUESSR', {
			font: font,
			size: 0.5,
			height: 0.25,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.01,
			bevelSize: 0.01,
			bevelOffset: 0,
			bevelSegments: 5
		});

		titleGeometry.computeBoundingBox();
		const titleTextMesh = new THREE.Mesh(titleGeometry, new THREE.MeshNormalMaterial());
		titleTextMesh.position.set(-10.0, 3.0, .0);
		titleTextMesh.name = "TITLE_MESH";
		currentScene.add(titleTextMesh);

		const playButtonGeometry = new TextGeometry('PLAY', {
			font: font,
			size: 0.75,
			height: 0.25,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.01,
			bevelSize: 0.01,
			bevelOffset: 0,
			bevelSegments: 5
		});

		playButtonGeometry.computeBoundingBox();
		const playButtonMesh = new THREE.Mesh(playButtonGeometry, new THREE.MeshNormalMaterial());
		playButtonMesh.position.set(-8.5, -3.0, .0);
		playButtonMesh.name = "PLAY_MESH";
		currentScene.add(playButtonMesh);
	});

	function render(time){
		time *= 0.001;
		updateRaycaster();
		if (gameMode == "MAIN_GAME") renderOntoRenderTarget(renderer, currentScene, minimapRenderTarget, minimapCamera);
		
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(currentScene, camera);
		requestAnimationFrame(render);
	}

	function map(value, min1, max1, min2, max2) {
		return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
	}

	function onPointerMove( event ) {
		raycasterIntersects = raycaster.intersectObjects( currentScene.children );
		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
	
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	}

	function onPointerClick(event){
		if (gameMode == "TITLE_SCREEN"){
			for (let i = 0; i < raycasterIntersects.length; i++){
				if (raycasterIntersects[i].object.name == "PLAY_MESH") {
					console.log("STAGE SELECT ACTIVATED");
					gameMode = "STAGE_SELECT";
					currentScene = stageSelectScene;
					raycasterIntersects = [];
					break;
				}
			}
		}
		else if (gameMode == "STAGE_SELECT"){
			for (let i = 0; i < raycasterIntersects.length; i++){
				if (raycasterIntersects[i].object.unlocked){
					currentScene = mainGameScene;
					gameMode = "MAIN_GAME"
					raycasterIntersects = [];
					generateStage();
					break;
				}
			}
		}
		
	}

	function generateStage(){
		const newStage = new StageModel();
		newStage.addToScene(mainGameScene);
		console.log(mainGameScene.children);
	}

	function updateRaycaster(){
		// update the picking ray with the camera and pointer position
		raycaster.setFromCamera( pointer, camera );

		// calculate objects intersecting the picking ray
		//const intersects = raycaster.intersectObjects( scene.children );
		/*
		for ( let i = 0; i < intersects.length; i ++ ) {
			console.log("HIT");
		}
		*/

	}

	function startOver() {
		wfcIterCount = 0;
		selectedArr = [];
		//totalCnt++;
		//background(128);
		// Create cell for each spot on the grid
		for (let i = 0; i < DIM * DIM; i++) {
			grid[i] = new Cell(tiles.length);
			let pos = [i % DIM, parseInt(i / DIM)];
			//console.log(pos);
			grid[i].setPos(pos);
		}
	}

	function checkValid(options, validOptions) {
		for (let i = options.length - 1; i >= 0; i--) {
			// VALID: [BLANK, RIGHT]
			// ARR : [BLANK, UP, RIGHT, DOWN, LEFT]
			// result in removing UP, DOWN, LEFT
			let element = options[i];
			if (!validOptions[element]) {
				options.splice(i, 1);
			}
		}
	}

	function isInGrid(pos) {
		return pos[0] >= 0 && pos[0] < DIM && pos[1] >= 0 && pos[1] < DIM;
	}

	function waveFunctionCollapseSingleIteration(){
		wfcIterCount++;
		//Pick cell with least entropy
		let gridCopy = grid.slice();
		gridCopy = gridCopy.filter((a) => !a.collapsed);
		gridCopy.sort(((a, b) => {
			return a.options.length - b.options.length;
		}));

		if (gridCopy.length === 0) {
			return;
		}

		let len = gridCopy[0].options.length;
		let stopIndex = 0;
		for (let i = 1; i < gridCopy.length; i++) {
			if (gridCopy[i].options.length > len) {
				stopIndex = i;
				break;
			}
		}
		if (stopIndex > 0) gridCopy.splice(stopIndex);


		const w = 800 / DIM;
		const h = 800 / DIM;

		// 기본 코드
		const cell = randomFromArray(gridCopy);
		selectedArr.push(cell);
		cell.collapsed = true;
		const pick = randomFromArray(cell.options);
		
		if (pick === undefined) {
			startOver();
			return;
		}
		
		cell.options = [pick];
		// cell의 옵션이 선택됐으므로 바로 그리면 됨.
		//image(tiles[cell.options[0]].img, cell.pos[0] * w, cell.pos[1] * h, w, h);
		// 일단 붕괴한 거의 주변 타일을 전부 고른다.
		// 붕괴한 주위 타일만 갱신함
		// 다음번 그리드 갱신하는 함수
		const nextGrid = grid.slice();
		const toVisit = [];
		for (let j = 0; j < DIM; j++) {
			for (let i = 0; i < DIM; i++) {
				for (let dir = 0; dir < 4; dir++) {
					let pos = [i + dx[dir], j + dy[dir]];
					let index = pos[0] + pos[1] * DIM;
					if (isInGrid(pos) && !nextGrid[index].collapsed && !toVisit[index]) {
						toVisit.push(index);
					}
				}
			}
		}

		for (let i = 0; i < toVisit.length; i++) {
			let cur = nextGrid[toVisit[i]];
			let curPos = [cur.pos[0], cur.pos[1]];
			let curIndex = curPos[0] + curPos[1] * DIM;

			let options = new Array(tiles.length).fill(0).map((x, i) => i);
			// 주변 4방향 타일 보고 갱신
			// 주위 타일이 붕괴 안했어도 원래는 체크 해야하는데
			// 안하고 다시 그리는게 훨씬 빨리 그려지네
			// 사실 변화가 모든 타일에 있을것이나
			// BFS 마냥 검색할거기 때문에 주위타일은 나중에 갱신해도 됨
			for (let dir = 0; dir < 4; dir++) {
				let pos = [curPos[0] + dx[dir], curPos[1] + dy[dir]]
				let index = pos[0] + pos[1] * DIM;
				if (isInGrid(pos) && nextGrid[index].collapsed) {
					let value = nextGrid[index];
					let validOptions = new Array(tiles.length).fill(false);
					for (let option of value.options) {
						let valid = tiles[option].constraint[(dir + 2) % 4];
						// validOptions = validOptions.concat(valid);
						for (let k = 0; k < tiles.length; k++) {
							validOptions[valid[k]] = true;
						}
					}
					checkValid(options, validOptions);
				}
			}

			// nextGrid[curIndex] = new Cell(options);
			nextGrid[curIndex].options = options;
			// 각각의 셀이 자신의 인덱스를 포함함, 예전 자신의 위치를 가져오면 그걸 넣는것도 좋다.
			nextGrid[curIndex].setPos(curPos);
			// 내부코드는 여기까지
		}
		grid = nextGrid;
	}

	function waveFunctionCollapseFullCycle(){
		while (wfcIterCount != DIM * DIM) waveFunctionCollapseSingleIteration();
		
		//console.log(selectedArr);
		for (let i = 0; i < selectedArr.length; i++){
			let currentCell = selectedArr[i];
			// image to be used as texture
			let currentCellTile = tiles[currentCell.options[0]]; 
			
			// number of rotation the cell mesh should have
			let currentCellTileRotation = currentCellTile.imageRotationNum; 
			//console.log(currentCellTileRotation);
			currentCell.setTexture(currentCellTile.img);
			currentCell.setRotationNum(currentCellTileRotation);
			currentCell.buildMesh();
			currentCell.addToScene(currentScene);
			
		}
	}

	function randomFromArray(arr){
		let randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	}

	function resizeRenderToDisplaySize(renderer){
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	
	

	window.addEventListener( 'pointermove', onPointerMove );
	window.addEventListener('click', onPointerClick);
	requestAnimationFrame(render);
}

main();