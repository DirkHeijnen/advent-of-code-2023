const fs = require("fs");
const path = require("path");


const parseInput = (inputText) => {
    const lines = inputText.split('\r\n').map(x => x.trim());
    
    
    const grid = [];

    for (let row = 0; row < lines.length; row++) {
        grid[row] = [];

        for (let column = 0; column < lines[row].length; column++) {
            const characterToAdd = lines[row][column];

            // If we are at the start, mark it as step count of 1.
            if (characterToAdd === 'S') {
                grid[row][column] = [];
            }

            // Mark an obstacle as infinity
            if (characterToAdd === '#') {
                grid[row][column] = [Infinity];
            }

            // Mark all other cells as 0 steps.
            if (characterToAdd === '.') {
                grid[row][column] = [];
            }   
        }
    }

    return grid;
}

const getPositionFromGridWithValue = (grid, value) => {
    const positions = [];

    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column < grid[row].length; column++)  {

            const listOfStepsAtPosition = grid[row][column];

            for (let stepCount of listOfStepsAtPosition) {
                if (stepCount === value) {
                    positions.push({ row, column });
                }
            }
        }
    }

    return positions;
}

const isBlockingPosition = (grid, row, column) => {
    let isBlocking = false;

    if (grid[row][column].length === 1 && grid[row][column][0] === Infinity) {
        isBlocking = true;
    }
        
    return isBlocking;
}   

const isGridFilled = (grid) => {
    let isFilled = true;

    for (let row = 0; row < grid.length; row++) {
        if (isFilled === false) {
            break;
        }

        for (let column = 0; column < grid[row].length; column++)  {
            if (grid[row][column].length === 0) {
                isFilled = false;
                break;
            }
        }
    }

    return isFilled;
}

const getNeighbourPositions = (grid, row, column) => {
    // Create store for the neighbours.
    const neighbours = [];

    // Get grid bounds
    const rowCount = grid.length - 1;
    const colCount = grid[0].length - 1;

    // Get neighbours.
    const up = row - 1 < 0 ? undefined : row - 1;
    const right = column + 1 > colCount ? undefined : column + 1;
    const left = column - 1 < 0 ? undefined : column - 1;
    const down = row + 1 > rowCount ? undefined : row + 1;

    // Add to the neighbour list.
    if (up !== undefined) neighbours.push({ row: up, column: column });
    if (right !== undefined) neighbours.push({ row: row, column: right });
    if (left !== undefined) neighbours.push({ row: row, column: left });
    if (down !== undefined) neighbours.push({ row: down, column: column });

    // Return
    return neighbours;
}


const printGrid = (grid, target) => {
    let string = '';

    for (let row = 0; row < grid.length; row++) {
        string += '\n';

        for (let column = 0; column < grid[row].length; column++) {
            // Step array
            let stepArray = grid[row][column];

            if (stepArray.find(x => x === target)) {
                // Found target and can place a O
                string += 'O'
            } else {
                if (stepArray[0] === Infinity) {
                    string += '#'
                } else {
                    string += '.'
                }
            }
        }
    }

    console.log(string);
}

const getSolution = (grid, target) => {
    let count = 0;

    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column < grid[row].length; column++) {

            if (grid[row][column].find(x => x === target)) {
                // Found target and can place a O
                count++;
            } 
        }
    }

    return count;
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the base grid.
    const grid = parseInput(inputFileText);

    // Current step
    let currentStep = 0;
    let target = 64;

    while (!isGridFilled(grid)) {
        // Break early
        if (currentStep === target + 1) {
            break;
        }

        // Get current positions to handle
        const currentPositions = getPositionFromGridWithValue(grid, currentStep);

        for (let currentPosition of currentPositions) {
            // Get neighbouring cells
            const neighbours = getNeighbourPositions(grid, currentPosition.row, currentPosition.column);

            for (let neighbour of neighbours) {
                if (!isBlockingPosition(grid, neighbour.row, neighbour.column)) {
                    if (!grid[neighbour.row][neighbour.column].find(x => x === (currentStep + 1))) {
                        grid[neighbour.row][neighbour.column].push(currentStep + 1);
                    }
                }
            }
        }

        // printGrid(grid, currentStep);
        currentStep++;
    }

    return getSolution(grid, target);
}

const t0 = performance.now();

main().then(solution => {
    console.log(`The solution is ${solution}`);
    const t1 = performance.now();
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
});
