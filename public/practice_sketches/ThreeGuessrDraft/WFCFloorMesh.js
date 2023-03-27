import * as THREE from 'three';
import Tile from './Tile.js';
import Cell from './Cell.js';



export default class WFCFloorMesh {
    // 20, 'assets/tiles/crosswalk/', '.png'
    constructor(dim, urlString, formatString,
        //default rulesets
            sc1Str = 'ABAAAABA',
            sc2Str = 'AABAABAA',
            snStr = 'AAAAAAAA', 
            sbStr = 'CCCCCCCC', 
            sb1Str = 'ACCCCCCC', 
            sb2Str = 'CCCCCCCA', 
            sbc1Str = 'AACCCCCC', 
            sbc2Str = 'CCCCCCAA'
        ){
        this.tileImages = [];
        // load road textures
        for (let i = 0; i < 54; i++){
            let tex = new THREE.TextureLoader().load(
                urlString + i + formatString
            )
            this.tileImages.push(tex);
        }

        this.tiles = [];
        this.DIM = dim;

        this.grid = [];
        // array of selected cells
        this.selectedArr = [];
        this.wfcIterCount = 0;

        this.sc1 = sc1Str;
        this.sc2 = sc2Str;
        this.sn = snStr;
        this.sb = sbStr;
        this.sb1 = sb1Str;
        this.sb2 = sb2Str;
        this.sbc1 = sbc1Str;
        this.sbc2 = sbc2Str;

        this._wfcInit();
    }

   
    _wfcInit(){
        this.tiles[0] = new Tile(tileImages[0], [this.sc1, this.sc1, this.sc1, this.sc1]);
        this.tiles[1] = new Tile(tileImages[1], [this.sc1, this.sc1, this.sc1, this.sn]);
        this.tiles[2] = new Tile(tileImages[2], [this.sc1, this.sc1, this.sn, this.sn]);
        this.tiles[3] = new Tile(tileImages[3], [this.sc1, this.sn, this.sc1, this.sn]);
        this.tiles[4] = new Tile(tileImages[4], [this.sc1, this.sn, this.sn, this.sn]);
        this.tiles[5] = new Tile(tileImages[5], [this.sn, this.sn, this.sn, this.sn]);
        this.tiles[6] = new Tile(tileImages[6], [this.sc1, this.sc1, this.sb1, this.sb2]);
        this.tiles[7] = new Tile(tileImages[7], [this.sc1, this.sn, this.sb1, this.sb2]);
        this.tiles[8] = new Tile(tileImages[8], [this.sn, this.sc1, this.sb1, this.sb2]);
        this.tiles[9] = new Tile(tileImages[9], [this.sn, this.sn, this.sb1, this.sb2]);
        this.tiles[10] = new Tile(tileImages[10], [this.sc1, this.sb1, this.sb, this.sb2]);
        this.tiles[11] = new Tile(tileImages[11], [this.sn, this.sb1, this.sb, this.sb2]);
        this.tiles[12] = new Tile(tileImages[12], [this.sc2, this.sc1, this.sc2, this.sc1]);
        this.tiles[13] = new Tile(tileImages[13], [this.sc2, this.sc1, this.sc2, this.sn]);
        this.tiles[14] = new Tile(tileImages[14], [this.sc2, this.sc1, this.sn, this.sc1]);
        this.tiles[15] = new Tile(tileImages[15], [this.sc2, this.sc1, this.sn, this.sn]);
        this.tiles[16] = new Tile(tileImages[16], [this.sc2, this.sn, this.sc2, this.sn]);
        this.tiles[17] = new Tile(tileImages[17], [this.sc2, this.sn, this.sn, this.sc1]);
        this.tiles[18] = new Tile(tileImages[18], [this.sn, this.sc1, this.sn, this.sc1]);
        this.tiles[19] = new Tile(tileImages[19], [this.sc2, this.sn, this.sn, this.sn]);
        this.tiles[20] = new Tile(tileImages[20], [this.sn, this.sc1, this.sn, this.sn]);
        this.tiles[21] = new Tile(tileImages[21], [this.sn, this.sn, this.sn, this.sn]);
        this.tiles[22] = new Tile(tileImages[22], [this.sc2, this.sc1, this.sbc1, this.sb2]);
        this.tiles[23] = new Tile(tileImages[23], [this.sc2, this.sn, this.sbc1, this.sb2]);
        this.tiles[24] = new Tile(tileImages[24], [this.sn, this.sc1, this.sbc1, this.sb2]);
        this.tiles[25] = new Tile(tileImages[25], [this.sn, this.sn, this.sbc1, this.sb2]);
        this.tiles[26] = new Tile(tileImages[26], [this.sc1, this.sc2, this.sb1, this.sbc2]);
        this.tiles[27] = new Tile(tileImages[27], [this.sc1, this.sn, this.sb1, this.sbc2]);
        this.tiles[28] = new Tile(tileImages[28], [this.sn, this.sc2, this.sb1, this.sbc2]);
        this.tiles[29] = new Tile(tileImages[29], [this.sn, this.sn, this.sb1, this.sbc2]);
        this.tiles[30] = new Tile(tileImages[30], [this.sc2, this.sc2, this.sc2, this.sc2]);
        this.tiles[31] = new Tile(tileImages[31], [this.sc2, this.sc2, this.sc2, this.sn]);
        this.tiles[32] = new Tile(tileImages[32], [this.sc2, this.sc2, this.sn, this.sn]);
        this.tiles[33] = new Tile(tileImages[33], [this.sc2, this.sn, this.sc2, this.sn]);
        this.tiles[34] = new Tile(tileImages[34], [this.sc2, this.sn, this.sn, this.sn]);
        this.tiles[35] = new Tile(tileImages[35], [this.sn, this.sn, this.sn, this.sn]);
        this.tiles[36] = new Tile(tileImages[36], [this.sc2, this.sc2, this.sbc1, this.sbc2]);
        this.tiles[37] = new Tile(tileImages[37], [this.sc2, this.sn, this.sbc1, this.sbc2]);
        this.tiles[38] = new Tile(tileImages[38], [this.sn, this.sc2, this.sbc1, this.sbc2]);
        this.tiles[39] = new Tile(tileImages[39], [this.sn, this.sn, this.sbc1, this.sbc2]);
        this.tiles[40] = new Tile(tileImages[40], [this.sc1, this.sbc1, this.sb, this.sbc2]);
        this.tiles[41] = new Tile(tileImages[41], [this.sn, this.sbc1, this.sb, this.sbc2]);
        this.tiles[42] = new Tile(tileImages[42], [this.sb, this.sb, this.sb, this.sb]);
        this.tiles[43] = new Tile(tileImages[43], [this.sc1, this.sn, this.sc2, this.sn]);
        this.tiles[44] = new Tile(tileImages[44], [this.sc2, this.sc1, this.sc1, this.sc1]);
        this.tiles[45] = new Tile(tileImages[45], [this.sc2, this.sc2, this.sc1, this.sc1]);
        this.tiles[46] = new Tile(tileImages[46], [this.sc2, this.sc2, this.sc2, this.sc1]);
        this.tiles[47] = new Tile(tileImages[47], [this.sn, this.sc1, this.sc1, this.sc2]);
        this.tiles[48] = new Tile(tileImages[48], [this.sn, this.sc1, this.sc2, this.sc2]);
        this.tiles[49] = new Tile(tileImages[49], [this.sn, this.sc2, this.sc1, this.sc1]);
        this.tiles[50] = new Tile(tileImages[50], [this.sn, this.sc2, this.sc2, this.sc1]);
        this.tiles[51] = new Tile(tileImages[51], [this.sn, this.sn, this.sc1, this.sc2]);
        this.tiles[52] = new Tile(tileImages[52], [this.sn, this.sn, this.sc2, this.sc1]);
        this.tiles[53] = new Tile(tileImages[53], [this.sc2, this.sb1, this.sb, this.sb2]);

        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 54; j++) {
                this.tiles.push(this.tiles[j].rotate(i));
            }
        }
    
        // Generate the adjacency rules based on edges
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            tile.analyze(this.tiles);
        }

        this.startOver();
    }

    startOver() {
		this.wfcIterCount = 0;
		this.selectedArr = [];
		
		// Create cell for each spot on the grid
		for (let i = 0; i < this.DIM * this.DIM; i++) {
			this.grid[i] = new Cell(this.tiles.length);
			let pos = [i % this.DIM, parseInt(i / this.DIM)];
			//console.log(pos);
			this.grid[i].setPos(pos);
		}
	}

    checkValid(options, validOptions) {
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

    isInGrid(pos) {
		return pos[0] >= 0 && pos[0] < DIM && pos[1] >= 0 && pos[1] < DIM;
	}

    randomFromArray(arr){
		let randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	}

    waveFunctionCollapseSingleIteration(){
		this.wfcIterCount++;
		//Pick cell with least entropy
		let gridCopy = this.grid.slice();
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

		// 기본 코드
		const cell = this.randomFromArray(gridCopy);
		this.selectedArr.push(cell);
		cell.collapsed = true;
		const pick = this.randomFromArray(cell.options);
		
		if (pick === undefined) {
			this.startOver();
			return;
		}
		
		cell.options = [pick];
		// cell의 옵션이 선택됐으므로 바로 그리면 됨.
		//image(tiles[cell.options[0]].img, cell.pos[0] * w, cell.pos[1] * h, w, h);
		// 일단 붕괴한 거의 주변 타일을 전부 고른다.
		// 붕괴한 주위 타일만 갱신함
		// 다음번 그리드 갱신하는 함수
		const nextGrid = this.grid.slice();
		const toVisit = [];
		for (let j = 0; j < this.DIM; j++) {
			for (let i = 0; i < this.DIM; i++) {
				for (let dir = 0; dir < 4; dir++) {
					let pos = [i + WFCFloorMesh.dx[dir], j + WFCFloorMesh.dy[dir]];
					let index = pos[0] + pos[1] * this.DIM;
					if (this.isInGrid(pos) && !nextGrid[index].collapsed && !toVisit[index]) {
						toVisit.push(index);
					}
				}
			}
		}

		for (let i = 0; i < toVisit.length; i++) {
			let cur = nextGrid[toVisit[i]];
			let curPos = [cur.pos[0], cur.pos[1]];
			let curIndex = curPos[0] + curPos[1] * this.DIM;

			let options = new Array(this.tiles.length).fill(0).map((x, i) => i);
			// 주변 4방향 타일 보고 갱신
			// 주위 타일이 붕괴 안했어도 원래는 체크 해야하는데
			// 안하고 다시 그리는게 훨씬 빨리 그려지네
			// 사실 변화가 모든 타일에 있을것이나
			// BFS 마냥 검색할거기 때문에 주위타일은 나중에 갱신해도 됨
			for (let dir = 0; dir < 4; dir++) {
				let pos = [curPos[0] + WFCFloorMesh.dx[dir], curPos[1] + WFCFloorMesh.dy[dir]]
				let index = pos[0] + pos[1] * this.DIM;
				if (this.isInGrid(pos) && nextGrid[index].collapsed) {
					let value = nextGrid[index];
					let validOptions = new Array(this.tiles.length).fill(false);
					for (let option of value.options) {
						let valid = this.tiles[option].constraint[(dir + 2) % 4];
						// validOptions = validOptions.concat(valid);
						for (let k = 0; k < this.tiles.length; k++) {
							validOptions[valid[k]] = true;
						}
					}
					this.checkValid(options, validOptions);
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

    waveFunctionCollapseFullCycle(){
		while (this.wfcIterCount != this.DIM * this.DIM) this.waveFunctionCollapseSingleIteration();
	}

    buildMesh(){
        //console.log(selectedArr);
		for (let i = 0; i < this.selectedArr.length; i++){
			let currentCell = this.selectedArr[i];
			// image to be used as texture
			let currentCellTile = this.tiles[currentCell.options[0]]; 
			
			// number of rotation the cell mesh should have
			let currentCellTileRotation = currentCellTile.imageRotationNum; 
			//console.log(currentCellTileRotation);
			currentCell.setTexture(currentCellTile.img);
			currentCell.setRotationNum(currentCellTileRotation);
			currentCell.buildMesh();
			//currentCell.addToScene(currentScene);
		}
    }

    addToScene(scene){
        for (let i = 0; i < this.selectedArr.length; i++){
			let currentCell = this.selectedArr[i];
			currentCell.addToScene(currentScene);
		}
    }
}

WFCFloorMesh.dx = [0, 1, 0, -1];
WFCFloorMesh.dy = [-1, 0, 1, 0];