const fs = require("fs");
const path = require("path");


const Direction = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
}


class Obstacle {
    constructor(row, column, value) {
        this.row = row;
        this.column = column;
        this.value = value;
        this.hits = 0;
    }

    hit() {
        this.hits++;
    }

    toString() {
        return this.value;
    }
}


class LightBeam {

    constructor(row, column, direction) {
        this.row = row;
        this.column = column;
        this.direction = direction;
    }

    changeDirection(direction) {
        this.direction = direction;
    }

    move() {
        switch(this.direction) {
            case Direction.UP: this.row--; break;
            case Direction.DOWN: this.row++; break;
            case Direction.LEFT: this.column--; break;
            case Direction.RIGHT: this.column++; break;
        }
    }
}


class GridFactory {

    static create(inputText) {
        const grid = new Grid();

        const lines = inputText.split('\r\n').map(x => x.trim());

        for (let x = 0; x < lines.length; x++) {
            for (let y = 0; y < lines[x].length; y++) {

                const value = lines[x][y];
                if (value == '.') {
                    grid.addToGrid(x, y, lines[x][y]);
                } else {
                    grid.addToGrid(x, y, new Obstacle(x, y, lines[x][y]));
                }
                

            }
        }

        return grid;
    }
}


class Grid {

    constructor() {
        this.grid = [];
        this.lightBeams = [];
        this.prevState = undefined;
        this.sameForRounds = 0;
    }

    addToGrid(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }

        this.grid[x][y] = value;
    }

    getRow(rowIndex) {
        return this.grid[rowIndex];
    }

    getRowCount() {
        return this.grid.length;
    }

    getColumn(columnIndex) {
        if (this.getRowCount() > 0) {
            const foundColumn = [];

            for (let row = 0; row < this.getRowCount(); row++) {
                foundColumn.push(this.grid[row][columnIndex]);
            }

            return foundColumn;
        }

        return undefined;
    }

    getColumnCount() {
        if (this.getRowCount() > 0) {
            return this.getRow(0).length;
        }

        return 0;
    }

    get(row, column) {
        if (this.grid[row]) {
            return this.grid[row][column];
        }

        return undefined;
    }

    print() {
        for (let x = 0; x < this.getRowCount(); x++) {
            let stringToPrint = "";

            for (let y = 0; y < this.getColumnCount(); y++) {
                stringToPrint += this.grid[x][y].toString();
            }

            console.log(stringToPrint);
        }
    }

    // Checks if a lightbeam has happened like this before based on an array of visited cells
    hasBeenVisited(lightbeam, allVisited) {
        const row = lightbeam.row;
        const column = lightbeam.column;
        const direction = lightbeam.direction;

        allVisited = allVisited.flat(1);

        for (let visited of allVisited) {
            if (visited.row === row && visited.column === column && visited.direction === direction) {
                return true;
            }
        }

        return false;
    }

    energize(startBeam) {
        // Create a queue with starting point.
        const queue = [startBeam];

        // Set the array visited cells.
        let allVisited = [{ row: queue[0].row, column: queue[0].column, direction: queue[0].direction }];

        // Handle edge case where first cell is obstacle.
        let cell = this.get(queue[0].row, queue[0].column);
        if (cell instanceof Obstacle) {
            switch(cell.value) {
                case '/':       queue[0].direction = Direction.UP;      break;
                case '\\':      queue[0].direction = Direction.DOWN;    break;
                case '|':       queue[0].direction = Direction.DOWN;    break;
                case '-':       queue[0].direction = Direction.RIGHT;   break;
            }
        }

        // Iterate through the queue
        while (queue.length > 0) {

            const lightbeam = queue.shift();
            lightbeam.move();


            let currentCell = this.get(lightbeam.row, lightbeam.column);
            const visited = [{ row: lightbeam.row, column: lightbeam.column, direction: lightbeam.direction }];


 
            while (true) {
                if (currentCell === undefined) { break; }

                if (currentCell === '.') {
                    lightbeam.move();

                    currentCell = this.get(lightbeam.row, lightbeam.column);
                    visited.push({ row: lightbeam.row, column: lightbeam.column, direction: lightbeam.direction });

                    continue;
                }

                if (currentCell instanceof Obstacle) {
                    currentCell = this.get(lightbeam.row, lightbeam.column);
                    visited.push({ row: lightbeam.row, column: lightbeam.column, direction: lightbeam.direction });

                    // Handle obstacle types.
                    switch(currentCell.value) {
                        case '/': {
                            if (lightbeam.direction === Direction.UP && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.RIGHT)); break; }
                            if (lightbeam.direction === Direction.DOWN && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.LEFT)); break; }
                            if (lightbeam.direction === Direction.LEFT && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.DOWN)); break; }
                            if (lightbeam.direction === Direction.RIGHT && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.UP)); break; }      
                            break;
                        }
        
                        case '\\': {
                            if (lightbeam.direction === Direction.UP && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.LEFT)); break; }
                            if (lightbeam.direction === Direction.DOWN && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.RIGHT)); break; }
                            if (lightbeam.direction === Direction.LEFT && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.UP)); break; }
                            if (lightbeam.direction === Direction.RIGHT && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.DOWN)); break; }      
                            break;    
                        }
        
                        case '|': {
                            if (lightbeam.direction === Direction.UP && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.UP)); break; }
                            if (lightbeam.direction === Direction.DOWN && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.DOWN)); break; }
                            if (lightbeam.direction === Direction.LEFT && !this.hasBeenVisited(lightbeam, allVisited)) { 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.UP)); 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.DOWN));
                            }
                            if (lightbeam.direction === Direction.RIGHT && !this.hasBeenVisited(lightbeam, allVisited)) { 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.UP)); 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.DOWN)); 
                            }      
                            break; 
                        }
        
                        case '-': {
                            if (lightbeam.direction === Direction.UP && !this.hasBeenVisited(lightbeam, allVisited)) { 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.LEFT)); 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.RIGHT)); 
                                break;
                            }
                            if (lightbeam.direction === Direction.DOWN && !this.hasBeenVisited(lightbeam, allVisited)) { 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.LEFT)); 
                                queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.RIGHT)); 
                                break;
                            }
                            if (lightbeam.direction === Direction.LEFT && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.LEFT)); break; }
                            if (lightbeam.direction === Direction.RIGHT && !this.hasBeenVisited(lightbeam, allVisited)) { queue.push(new LightBeam(lightbeam.row, lightbeam.column, Direction.RIGHT)); break; }
                            break; 
                        }
                    }
                    break;
                } else {
                    break;
                }
            } 

            allVisited.push(visited);
        }

       allVisited = allVisited.flat(1).filter(visitedCell => {
            return (
                visitedCell.row >= 0 && 
                visitedCell.column >= 0 &&
                visitedCell.row < this.getRowCount() &&
                visitedCell.column < this.getColumnCount()
            )
        });

        for (let visited of allVisited) {
            this.grid[visited.row][visited.column] = '#'
        }

        for (let i = 0; i < this.getRowCount(); i++) {
            for (let j = 0; j < this.getColumnCount(); j++) {
                if (this.grid[i][j] !== '#') {
                    this.grid[i][j] = '.'
                }
            }
        }

        let count = 0;
        for (let i = 0; i < this.getRowCount(); i++) {
            for (let j = 0; j < this.getColumnCount(); j++) {
                if (this.grid[i][j] == '#') {
                    count++;
                }
            }
        }
        return count;

    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');


    // Sums
    const sums = [];

    // Create grid
    const grid = GridFactory.create(inputFileText);


    // Keep counts
    let rowCount = grid.getRowCount();
    let colCount = grid.getColumnCount();

    // TOP
    for (let i = 0; i <= colCount; i++) {
        const grid = GridFactory.create(inputFileText);
        sums.push(grid.energize(new LightBeam(0, i, Direction.DOWN)));
        console.log('TOP ' + i + " done")
    }
    // LEFT
    for (let i = 0; i <= rowCount; i++) {
        const grid = GridFactory.create(inputFileText);
        sums.push(grid.energize(new LightBeam(i, 0, Direction.RIGHT)));
        console.log('LEFT ' + i + " done")
    }
    // BOTTOM
    for (let i = 0; i <= colCount; i++) {
        const grid = GridFactory.create(inputFileText);
        sums.push(grid.energize(new LightBeam(rowCount - 1, i, Direction.UP)));
        console.log('BOTTOM ' + i + " done")
    }
    // RIGHT
    for (let i = 0; i <= rowCount; i++) {
        const grid = GridFactory.create(inputFileText);
        sums.push(grid.energize(new LightBeam(i, colCount - 1, Direction.LEFT)));
        console.log('RIGHT ' + i + " done")
    }
 
    // Energize and return the count of energized cells
    sums.sort((a, b) => b - a);
    return sums[0]
}


const t0 = performance.now();
main().then(solution => {
    const t1 = performance.now();
    console.log(`The solution is ${solution}`);
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
});
