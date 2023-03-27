const tiles = [];
const tileImages = [];

let grid = [];
let selectedArr = [];

const DIM = 20;

const RSEED = 10;
const CANVASSIZE = 1200;
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

function preload() {
    // path = "tiles";
    // tileImages[0] = loadImage(`${path}/blank.png`);
    // tileImages[1] = loadImage(`${path}/up.png`);

    // circuit Tile
    // path = "circuits";
    // for (let i = 0; i < 13; i++) {
    //     tileImages[i] = loadImage(`${path}/${i}.png`);
    // }

    //
    path = "CrossWalk";
    for (let i = 0; i < 54; i++) {
        tileImages[i] = loadImage(`${path}/${i}.png`);
    }
}

function setup() {
    // 랜덤 시드
    // randomSeed(RSEED);

    // canvas 생성
    createCanvas(CANVASSIZE, CANVASSIZE);

    // New Method
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

    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        tile.analyze(tiles);
    }

    startOver();
}

let cnt = 0;
let totalCnt = 0;
let errorCnt = 0;
let start = new Date();

function startOver() {
    totalCnt++;
    cnt = 0;
    start = new Date();
    //background(128);
    // Create cell for each spot on the grid
    for (let i = 0; i < DIM * DIM; i++) {
        grid[i] = new Cell(tiles.length);
        let pos = [i % DIM, parseInt(i / DIM)]
        grid[i].setPos(pos);
    }
}

function checkValid(options, validOptions) {
    // for (let i = arr.length - 1; i >= 0; i--) {
    //     // VALID: [BLANK, RIGHT]
    //     // ARR : [BLANK, UP, RIGHT, DOWN, LEFT]
    //     // result in removing UP, DOWN, LEFT
    //     let element = arr[i];
    //     if (!valid.includes(element)) {
    //         arr.splice(i, 1);
    //     }
    // }

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

function draw() {
    cnt++;
    
    if (cnt === DIM * DIM) {
        let end = new Date();
        console.log(end - start);
        console.log("Finish");
        console.log(selectedArr);
        
//         //에러 걸릴때 까지 돌리기
//         start = new Date();
//         cnt = 0;
//         startOver();

        const w = width / DIM;
        const h = height / DIM;

        selectedArr.forEach(function(cell){
            // this is where you set the texture for a cell.
            // ex) cell.material.map = tiles[cell.options[0]].img
            image(tiles[cell.options[0]].img, cell.pos[0] * w, cell.pos[1] * h, w, h);
        })
    }

    else waveFunctionCollapse();

    

}

function waveFunctionCollapse(){
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


    const w = width / DIM;
    const h = height / DIM;

    // 기본 코드
    const cell = random(gridCopy);

    selectedArr.push(cell);
    
    cell.collapsed = true;
    const pick = random(cell.options);
    /*
    if (pick === undefined) {

        console.log(cell);
        fill(0);
        stroke(255);
        rect(cell.pos[0] * w, cell.pos[1] * h, w, h);

        errorCnt++;
        console.log(errorCnt);
        if(errorCnt >= 100) {
            noLoop();
            console.log("totalCnt : " , totalCnt);
        }

        startOver();
        return;
    }
    */
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

    // console.log(tiles);

    for (let i = 0; i < toVisit.length; i++) {
        let cur = nextGrid[toVisit[i]];
        let curPos = [cur.pos[0], cur.pos[1]];
        let curIndex = curPos[0] + curPos[1] * DIM;

        // console.log(curPos);
        // console.log(curIndex);

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

function mousePressed() {
    startOver();
}
