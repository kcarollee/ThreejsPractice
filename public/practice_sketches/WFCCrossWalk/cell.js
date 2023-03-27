class Cell {
    constructor(value) {
        this.collapsed = false;
        if (value instanceof Array){
            this.options = value;
        }else {
            this.options = new Array(value).fill(0).map((_, i) => i);
        }
    }
    setPos(pos){
        this.pos = pos;
    }
}


