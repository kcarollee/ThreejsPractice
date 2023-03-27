function reverseString(s) {
    let arr = s.split("");
    arr = arr.reverse();
    return arr.join("");
}

function compareEdge(a,b){
    return a === reverseString(b);
}

class Tile {
    constructor(img, edges) {
        this.img = img;
        this.edges = edges;
        // up, right, down, left
        this.constraint = [[],[],[],[]];
        // this.up = [];
        // this.right = [];
        // this.down = [];
        // this.left = [];
    }

    rotate(num) {
        const w = this.img.width;
        const h = this.img.height;
        const newImg = createGraphics(w, h);
        newImg.imageMode(CENTER);
        newImg.translate(w / 2, h / 2);
        newImg.rotate(HALF_PI * num);
        newImg.image(this.img, 0, 0);

        const newEdges = [];
        let len = this.edges.length;
        for (let i = 0; i < len; i++) {
            newEdges[i] = this.edges[(i - num + len) % len];
        }

        return new Tile(newImg, newEdges);
    }

    analyze(tiles) {
        for(let i = 0; i < tiles.length; i++){
            let tile = tiles[i];
            for(let j = 0; j < 4; j++){
                if (compareEdge(tile.edges[(j + 2) % 4], this.edges[j])) {
                    this.constraint[j].push(i);
                }
            }
        }
    }
}