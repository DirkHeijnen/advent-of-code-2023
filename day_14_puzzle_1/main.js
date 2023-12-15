const fs = require("fs");
const path = require("path");


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

    // Custom methods for puzzle
    tiltNorth() {
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

                let newSplit = circles.join('') + dots.join('');
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

    // Tilt north
    grid.tiltNorth();
 
    // Get load value and return the solution.
    return grid.getTotalLoad();
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
