const fs = require("fs");
const path = require("path");


// This enum marks the types of cells.
//      1. Cells with a "." are EMPTY.
//      2. Cells with a number are NUMBER.
//      3. All other cells are SYMBOL.
const EngineSchematicCellType = {
    EMPTY: "EMPTY",
    NUMBER: "NUMBER",
    SYMBOL: "SYMBOL"   
}


// Defines a single cell in the engine schematic.
//
// The cell has a rowIndex, indicating the row position of the cell on the parent grid.
// The cell has a columnIndex, indicating the column position of the cell on the parent grid.
// The cell has a character, which is the character inside of the cell.
// The cell has a cell type, which is the EngineSchematicCellType.
class EngineSchematicCell {

    constructor(character, rowIndex, columnIndex) {
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
        this.character = character;
        this.cellType = this.#getCellType();
    }

    #isCharacterNumber = (char) => {
        return char >= '0' && char <= '9';
    }

    #getCellType() {
        if (this.character === '.') {
            return EngineSchematicCellType.EMPTY;
        } else if (this.#isCharacterNumber(this.character)) {
            return EngineSchematicCellType.NUMBER;
        } else {
            return EngineSchematicCellType.SYMBOL;
        }
    }
}


// Defines the engine schematic itself.
// It takes in a grid in text format to create itself.
//
// The engine schematic has a grid property, containing the grid as 2d array of EngineSchematicCell objects.
// The engine schematic has a gearRatios property, containing the gear ratios of the gear parts as detected in the grid.
class EngineSchematic {

    constructor(gridAsText) {
        this.grid = [];
        this.gearRatios = [];

        this.#fillGrid(gridAsText);
        this.#extractGearRatios();
    }

    #fillGrid(gridAsText) {
        const gridRows = gridAsText.split('\r\n').map(x => x.trim());
    
        for (let rowIndex = 0; rowIndex < gridRows.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < gridRows[rowIndex].length; columnIndex++) {
                if (!this.grid[rowIndex]) {
                    this.grid[rowIndex] = [];
                }

                this.grid[rowIndex][columnIndex] = new EngineSchematicCell(gridRows[rowIndex][columnIndex], rowIndex, columnIndex);
            }
        }
    }

    #getCellAt(row, column) {
        if (this.grid[row] && this.grid[row][column]) {
            return this.grid[row][column];
        }

        return undefined;
    }

    #extractGearRatios() {
        const rowCount = this.grid.length;
        const columnCount = this.grid[0].length;

        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {

                // We ignore the cells that aren't symbols.
                if (this.#getCellAt(row, column).cellType !== EngineSchematicCellType.SYMBOL) {
                    continue;
                }

                // We also ignore all symbols that aren't possible gear parts ('*')
                if (this.#getCellAt(row, column).character !== "*") {
                    continue;
                }

                // The current cell is now a potentional gear part, we must look in a all directions around the cell.
                // We must also validate if a cell exists, in the top left corner of the grid, only 3 possible directions exists.
                let topLeft = this.#getCellAt(row - 1, column -1);
                let topMiddle = this.#getCellAt(row - 1, column);
                let topRight = this.#getCellAt(row - 1, column + 1);
                let middleLeft = this.#getCellAt(row, column - 1); 
                let middleRight = this.#getCellAt(row, column + 1);
                let bottomLeft = this.#getCellAt(row + 1, column -1);
                let bottomMiddle = this.#getCellAt(row + 1, column);
                let bottomRight = this.#getCellAt(row + 1, column + 1);

                let cellsToCheck = [topLeft, topMiddle, topRight, middleLeft, middleRight, bottomLeft, bottomMiddle, bottomRight];

                // Keep an array of the marked cells in this iteration.
                let markedCells = []
                let markedNumbers = [];
                let markedCellGroupString = "";

                for (let cell of cellsToCheck) {

                    // Don't double check cells that are already checked.
                    if (markedCells.find(markedCell => markedCell.rowIndex === cell.rowIndex && markedCell.columnIndex === cell.columnIndex)){
                        continue;
                    }

                    if (cell && cell.cellType === EngineSchematicCellType.NUMBER) {
                        // Mark this cell as checked.
                        markedCells.push(cell);
                        markedCellGroupString = cell.character;

                        // Walk left and mark all other numbers in this cell group.
                        let leftIndex = cell.columnIndex - 1;
                        while (this.#getCellAt(cell.rowIndex, leftIndex) && this.#getCellAt(cell.rowIndex, leftIndex).cellType === EngineSchematicCellType.NUMBER) {
                            markedCells.push(this.#getCellAt(cell.rowIndex, leftIndex));
                            markedCellGroupString = this.#getCellAt(cell.rowIndex, leftIndex).character + markedCellGroupString;
                            leftIndex--;
                        }
   
                        // Walk right and mark all other numbers in this cell group.
                        let rightIndex = cell.columnIndex + 1;
                        while (this.#getCellAt(cell.rowIndex, rightIndex) && this.#getCellAt(cell.rowIndex, rightIndex).cellType === EngineSchematicCellType.NUMBER) {
                            markedCells.push(this.#getCellAt(cell.rowIndex, rightIndex));
                            markedCellGroupString = markedCellGroupString + this.#getCellAt(cell.rowIndex, rightIndex).character;
                            rightIndex++;
                        }

                        // Append the number and reset the string.
                        markedNumbers.push(parseInt(markedCellGroupString));
                        markedCellGroupString = "";
                    }
                }

                // If there are only 2 numbers than we found a gear part and we can calculate the ratio and push it.
                if (markedNumbers.length == 2) {                   
                    this.gearRatios.push(markedNumbers[0] * markedNumbers[1]);
                }
            }
        }
    }
}


const main = () => {
    // Path to the input files (Contains the values for the puzzle)
    const inputFilePath = path.join(__dirname, 'input.txt');

    // Get the content of the file as text, split into lines and store each line in an array.
    const gridAsText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the EngineSchematic class from the input grid.
    const engineSchematic = new EngineSchematic(gridAsText);

    let sum = 0;

    for (let gearRatio of engineSchematic.gearRatios) {
        sum += gearRatio
    }

    console.log("The sum of gear ratio numbers = " + sum); 
}

main();