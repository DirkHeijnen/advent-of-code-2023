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
// The cell has a markedAsEnginePart, which indicates if the content of the cell is part of an engine part.
class EngineSchematicCell {

    constructor(character, rowIndex, columnIndex) {
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
        this.character = character;
        this.markedAsEnginePart = false;
        this.cellType = this.#getCellType();
    }

    markAsEnginePart() {
        this.markedAsEnginePart = true;
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
// The engine schematic has a enginePartNumbers property, containing the numbers of the engine parts as detected in the grid.
class EngineSchematic {

    constructor(gridAsText) {
        this.grid = [];
        this.enginePartNumbers = [];

        this.#fillGrid(gridAsText);
        this.#markEnginePartCells();
        this.#extractEngineParts();
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

    #markEnginePartCells() {
        const rowCount = this.grid.length;
        const columnCount = this.grid[0].length;

        // Now iterate over the grid and mark cells as part of the engine where they touch a symbol.
        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {

                // We ignore the cells that aren't symbols.
                if (this.#getCellAt(row, column).cellType !== EngineSchematicCellType.SYMBOL) {
                    continue;
                }

                // The current cell is now a symbol, we must look in a all directions and mark the number cells as part of the engine parts.
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

                for (let cell of cellsToCheck) {
                    if (cell && cell.cellType === EngineSchematicCellType.NUMBER) {
                        // Mark this cell as part of the engine parts.
                        cell.markAsEnginePart();

                        // Walk left and mark all other numbers in this cell group.
                        let leftIndex = cell.columnIndex - 1;
                        while (this.#getCellAt(cell.rowIndex, leftIndex) && this.#getCellAt(cell.rowIndex, leftIndex).cellType === EngineSchematicCellType.NUMBER) {
                            this.#getCellAt(cell.rowIndex, leftIndex).markAsEnginePart();
                            leftIndex--;
                        }
   
                        // Walk right and mark all other numbers in this cell group.
                        let rightIndex = cell.columnIndex + 1;
                        while (this.#getCellAt(row, rightIndex) && this.#getCellAt(cell.rowIndex, rightIndex).cellType === EngineSchematicCellType.NUMBER) {
                            this.#getCellAt(cell.rowIndex, rightIndex).markAsEnginePart();
                            rightIndex++;
                        }
                    }
                }
            }
        }
    }

    #extractEngineParts() {
        const rowCount = this.grid.length;
        const columnCount = this.grid[0].length;

        // Hold the current engine part text.
        let enginePartText = "";

        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {

                const currentCell = this.#getCellAt(row, column);

                if (currentCell.markedAsEnginePart) {
                    enginePartText += currentCell.character;
                    continue;
                }

                if (enginePartText.length !== 0) {
                    this.enginePartNumbers.push(parseInt(enginePartText));
                    enginePartText = "";
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

    for (let enginePartNumber of engineSchematic.enginePartNumbers) {
        sum += enginePartNumber
    }

    console.log("The sum of engine part numbers = " + sum); 
}

main();