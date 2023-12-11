const fs = require("fs");
const path = require("path");


const UniverseCellType = {
    EMPTY_SPACE: 'EMPTY_SPACE',
    GALAXY: 'GALAXY'
}


class UniverseCell {

    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}


class UniverseFactory {

    static create(inputFileText) {
        const universe = new Universe();

        const lines = inputFileText.split('\n').map(x => x.trim());

        for (let x = 0; x < lines.length; x++) {
            for (let y = 0; y < lines[x].length; y++) {

                if (lines[x][y] === '.') {
                    universe.addToGrid(x, y, new UniverseCell(x, y, UniverseCellType.EMPTY_SPACE));
                } else if (lines[x][y] === '#') {
                    universe.addToGrid(x, y, new UniverseCell(x, y, UniverseCellType.GALAXY));
                }

            }
        }

        return universe;
    }
}


class Universe {

    constructor() {
        this.grid = [];
    }

    addToGrid(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }

        this.grid[x][y] = value;
    }

    getRowCount() {
        return this.grid.length;
    }

    getColumnCount() {
        if (this.grid.length > 0) {
            return this.grid[0].length;
        }
        return 0;
    }

    getCell(row, column) {
        if (this.grid[row]) {
            return this.grid[row][column];
        }

        return undefined;
    }

    expand() {
        // Find empty rows indexes.
        let emptyRows = [];
        for (let x = 0; x < this.grid.length; x++) {
            let row = this.grid[x];
            if (row.every(cell => cell.value === UniverseCellType.EMPTY_SPACE)) {
                emptyRows.push(x);
            }
        }

        // Find empty column indexes.
        let emptyColumns = [];
        for (let y = 0; y < this.grid[0].length; y++) {
            let columnCells = [];

            for (let x = 0; x < this.grid.length; x++) {
                columnCells.push(this.grid[x][y]);
            }

            if (columnCells.every(cell => cell.value === UniverseCellType.EMPTY_SPACE)) {
                emptyColumns.push(y);
            }
        }

        // Expand empty rows until no more are left.
        while (emptyRows.length !== 0) {
            let rowIndex = emptyRows.shift();

            let leftArray = Array.from(this.grid).splice(0, rowIndex + 1);
            let rightArray = Array.from(this.grid).splice(rowIndex + 1);

            let newRow = [];

            for (let i = 0; i < this.getColumnCount(); i++) {
                newRow.push(new UniverseCell(rowIndex, 0, UniverseCellType.EMPTY_SPACE));
            }

            this.grid = [...leftArray, newRow, ...rightArray];

            emptyRows = emptyRows.map(x => x + 1);
        }

        // Expand empty columns until no more are left.
        while (emptyColumns.length !== 0) {
            let columnIndex = emptyColumns.shift();

            // Every row should add empty space at the index.
            for (let row = 0; row < this.getRowCount(); row++) {
                let leftArray = Array.from(this.grid[row]).splice(0, columnIndex + 1);
                let rightArray = Array.from(this.grid[row]).splice(columnIndex + 1);

                this.grid[row] = [...leftArray, new UniverseCell(0, 0, UniverseCellType.EMPTY_SPACE), ...rightArray];
            }

            emptyColumns = emptyColumns.map(x => x + 1);
            emptyRows = emptyRows.map(x => x + 1);
        }

        // For each row and column, update the cells accordingly to match the proper position.
        for (let row = 0; row < this.getRowCount(); row++) {
            for (let column = 0; column < this.getColumnCount(); column++) {
                this.grid[row][column].x = row;
                this.grid[row][column].y = column;
            }
        }
    }

    getGalaxyPairs() {
        const pairs = [];

        for (let x = 0; x < this.getRowCount(); x++) {
            for (let y = 0; y < this.getColumnCount(); y++) {
                if (this.getCell(x, y).value === UniverseCellType.GALAXY) {
                    pairs.push(this.getCell(x, y));
                }
            }
        }

        return pairs.flatMap(
            (value, index) => pairs.slice(index + 1).map((item) => {
                return [value, item];
            })
        );
    }

    findShortestPath(start, end) {
        return Math.abs(end.x-start.x) + Math.abs(end.y-start.y)
    }

    print() {
        for (let x = 0; x < this.getRowCount(); x++) {
            let stringToPrint = "";

            for (let y = 0; y < this.getColumnCount(); y++) {

                if (this.grid[x][y].value === UniverseCellType.EMPTY_SPACE) {
                    stringToPrint += '.';
                } else {
                    stringToPrint += '#';
                }
            }

            console.log(stringToPrint);
        }
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the galaxy.
    const universe = UniverseFactory.create(inputFileText);

    // Create all the pairs.
    const pairs = universe.getGalaxyPairs();

    // Calculate the shortest path parallel.
    async function getShortestPathAsync(pair) {
        return universe.findShortestPath(pair[0], pair[1]);
    }

    // Given a set of pairs, calculate the shortest path for them all.
    async function getAllShortestPathsCombinedLength(pairs) {
        let promises = [];

        for (let i = 0; i < pairs.length; i++) {
            promises.push(getShortestPathAsync(pairs[i]));
        }

        return Promise.all(promises);
    }

    // Do the path calculation before expansion.
    let shortestPathSumBeforeExpansion = (await getAllShortestPathsCombinedLength(pairs)).reduce((acc, curr) => acc + curr, 0);

    // Expand once
    universe.expand();

    // Do the path calculation again after expansion.
    const shortestPathSumAfterExpansion = (await getAllShortestPathsCombinedLength(pairs)).reduce((acc, curr) => acc + curr, 0);

    // Get the difference between the 2
    const incrementPerExpansion = shortestPathSumAfterExpansion - shortestPathSumBeforeExpansion;

    // The desired amount of expansion is 1 million
    const expansions = 1_000_000;

    // Return the solution (The original path sum + the additional expansions - one expansion (is in the original)).
    return shortestPathSumBeforeExpansion + (incrementPerExpansion * expansions) - incrementPerExpansion

}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
