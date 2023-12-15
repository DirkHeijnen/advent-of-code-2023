const fs = require("fs");
const path = require("path");


const Direction = {
    NORTH: 'NORTH',
    EAST: 'EAST',
    SOUTH: 'SOUTH',
    WEST: 'WEST',
}


class GridFactory {

    static create(inputText) {
        const grid = new Grid();

        const lines = inputText.split('\r\n').map(x => x.trim());

        for (let x = 0; x < lines.length; x++) {
            for (let y = 0; y < lines[x].length; y++) {

                grid.addToGrid(x, y, lines[x][y]);

            }
        }

        return grid;
    }
}


class Grid {

    constructor() {
        this.grid = [];
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

    transpose() {
        this.grid = this.grid[0].map((_, colIndex) => this.grid.map(row => row[colIndex]));
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

    toString() {
        let string = ''
        for (let x = 0; x < this.getRowCount(); x++) {
            let rowString = "";

            for (let y = 0; y < this.getColumnCount(); y++) {
                rowString += this.grid[x][y].toString();
            }

            string = string + rowString;
        }
        return string;
    }

    // Custom methods for puzzle
    tilt(direction) {

        // Tilt north or south.
        if (direction === Direction.NORTH || direction === Direction.SOUTH) {
            for (let columnIndex = 0; columnIndex < this.getColumnCount(); columnIndex++) {
                const column = this.getColumn(columnIndex);
    
                // Take the column
                let columnText = column.join('');
    
                // Split text into arrays where each split is done at the # (keep the # at the splits)
                let splits = columnText.split(/(?=#)/g);
    
                // Process the splits so the tilt happens.
                let splitsAfterTilt = [];
    
                for (let split of splits) {
                    let splitStartsWithHastag = split.includes('#');
    
                    let circles = [];
                    let dots = [];
    
                    for (let i = 0; i < split.length; i++) {
                        if (split[i] === '.')
                            dots.push('.')
                        if (split[i] === 'O')
                            circles.push('O')
                    }
    
                    let newSplit = '' 
                    if (direction === Direction.NORTH)
                        newSplit = circles.join('') + dots.join('');
                    if (direction === Direction.SOUTH)
                        newSplit = dots.join('') + circles.join('');
    
    
                    if (splitStartsWithHastag) {
                        newSplit = '#' + newSplit;
                    }
    
                    splitsAfterTilt.push(newSplit);
                }
    
                let newColumn = splitsAfterTilt.join('').split('');
    
                for (let rowIndex = 0; rowIndex < this.getRowCount(); rowIndex++) {
                    this.grid[rowIndex][columnIndex] = newColumn[rowIndex];
                }
            }
    
        }

        // Tilt east and west.
        if (direction === Direction.EAST || direction === Direction.WEST) {
            for (let rowIndex = 0; rowIndex < this.getColumnCount(); rowIndex++) {
                const row = this.getRow(rowIndex);
    
                // Take the row
                let rowText = row.join('');
    
                // Split text into arrays where each split is done at the # (keep the # at the splits)
                let splits = rowText.split(/(?=#)/g);
    
                // Process the splits so the tilt happens.
                let splitsAfterTilt = [];
    
                for (let split of splits) {
                    let splitStartsWithHastag = split.includes('#');
    
                    let circles = [];
                    let dots = [];
    
                    for (let i = 0; i < split.length; i++) {
                        if (split[i] === '.')
                            dots.push('.')
                        if (split[i] === 'O')
                            circles.push('O')
                    }
    
                    let newSplit = '' 
                    if (direction === Direction.WEST)
                        newSplit = circles.join('') + dots.join('');
                    if (direction === Direction.EAST)
                        newSplit = dots.join('') + circles.join('');
    
    
                    if (splitStartsWithHastag) {
                        newSplit = '#' + newSplit;
                    }
    
                    splitsAfterTilt.push(newSplit);
                }
    
                let newRow = splitsAfterTilt.join('').split('');
    
                this.grid[rowIndex] = newRow;
            }
        }
    }

    rotate() {
        this.tilt(Direction.NORTH);
        this.tilt(Direction.WEST);
        this.tilt(Direction.SOUTH);
        this.tilt(Direction.EAST);
    }

    getTotalLoad() {
        let sum = 0;

        for (let rowWeight = this.getRowCount(); rowWeight >= 1; rowWeight--) {
            const rowIndex = this.getRowCount() - rowWeight;
            const row = this.getRow(rowIndex);

            for (let char of row) {
                if (char === 'O')
                    sum += rowWeight;
            }
        }

        return sum;
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the grid.
    const grid = GridFactory.create(inputFileText);  

    let cache = new Map();
    let initialIterations = 0;

    // Loop until no new configurations are detected
    while (true) {
        initialIterations++;

        let cacheKey = JSON.stringify({ load: grid.getTotalLoad(), grid: grid.toString() });
        
        let currentSize = cache.size;
        if (!cache.has(cacheKey)) {
            cache.set(cacheKey, 1);
        }
        grid.rotate();
        let afterSize = cache.size;

        if (currentSize === afterSize) {
            break;
        }
    }
    

    cache = new Map();

    for (let i = 0; i < 1000; i++) {
        let cacheKey = JSON.stringify({ load: grid.getTotalLoad(), grid: grid.toString() });
        
        grid.rotate();

        if (!cache.has(cacheKey)) {
            cache.set(cacheKey, 1);
            continue;
        }

        cache.set(cacheKey, (cache.get(cacheKey))+1);

        // If every grid has been seen exactly twice we detected the loop.
        if (Array.from(cache.values()).every((x) => x === 2)) {
            let iterationsPerLoop = cache.size;
            let targetIterations = 1000000000 - initialIterations;

            let cacheIndexOfLoopStart = targetIterations % iterationsPerLoop;
            
            let loopKeyJson = Array.from(cache.keys())[cacheIndexOfLoopStart];
            let loopKey = JSON.parse(loopKeyJson);
            return loopKey.load;
        }
    }
}



const t0 = performance.now();
main().then(solution => {
    const t1 = performance.now();
    console.log(`The solution is ${solution}`);
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
});
