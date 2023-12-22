const fs = require("fs");
const path = require("path");


const parseInput = (inputText) => {
    const lines = inputText.split('\r\n').map(x => x.trim());
    
    
    const grid = [];

    for (let row = 0; row < lines.length; row++) {
        grid[row] = [];

        for (let column = 0; column < lines[row].length; column++) {
            const characterToAdd = lines[row][column];
            
            // Mark an obstacle as infinity
            if (characterToAdd === '#') {
                grid[row][column] = [Infinity];
            } else {
                grid[row][column] = [];
            }
        }
    }

    return grid;
}

const expandGrid = (grid, factor) => {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const expandedMatrix = [];

    for (let i = 0; i < factor * numRows; i++) {
        const row = [];
        for (let j = 0; j < factor * numCols; j++) {
            // Creating a deep copy of the array element
            const cellCopy = Array.isArray(grid[i % numRows][j % numCols]) 
                ? [...grid[i % numRows][j % numCols]] 
                : grid[i % numRows][j % numCols];
            row.push(cellCopy);
        }
        expandedMatrix.push(row);
    }

    return expandedMatrix;
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

const getVisitedCount = (grid, steps) => {
    // Current step
    let currentStep = 0;
    let target = steps;

    // Starting point is at the center of the grid.
    let startingRow = Math.floor(grid.length / 2);
    let startingColumn = startingRow;

    // Loop untill we hit the target steps.
    while (!(currentStep === target + 1)) {
        const currentPositions = [];

        // If we are at step 0, start from the starting point.
        // If we are at a higher step, find their neighbours.
        if (currentStep === 0) {
            currentPositions.push({ row: startingRow, column: startingColumn });
        } else {
            currentPositions.push(...getPositionFromGridWithValue(grid, currentStep))
        }

        for (let currentPosition of currentPositions) {
            // Get neighbouring cells
            const neighbours = getNeighbourPositions(grid, currentPosition.row, currentPosition.column);

            for (let neighbour of neighbours) {
                if (!isBlockingPosition(grid, neighbour.row, neighbour.column)) {
                    // If the neighrbour is not already marked with the increased stepcount, then do so.
                    if (!grid[neighbour.row][neighbour.column].find(x => x === (currentStep + 1))) {
                        grid[neighbour.row][neighbour.column].push(currentStep + 1);
                    }
                }
            }
        }

        currentStep++;
    }

    return getSolution(grid, target);
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Load in the grid with an expansion factor 7.
    // Its done 3 times beceause the getVisitedCount modifies the grid itself, we need 3 calcultions, thus also 3 grids.
    const expandGrid1 = expandGrid(parseInput(inputFileText), 7);
    const expandGrid2 = expandGrid(parseInput(inputFileText), 7);
    const expandGrid3 = expandGrid(parseInput(inputFileText), 7);

    // Calculate for various growth steps.
    let y_values = [
        getVisitedCount(expandGrid1, 65),
        getVisitedCount(expandGrid2, 196),
        getVisitedCount(expandGrid3, 327),
    ]
    let x_values = [0, 1, 2]
    let target = Math.floor((26501365 - 65) / 131);

    console.log('the x values to use: ' + x_values);
    console.log('the y values to use: ' + y_values);
    console.log('the target', target);

    // I ran this part of the solution in a seperate python project
    // with numpy (see main.py):
    //      coefficients = np.polyfit(x_values, y_values, 2)
    //      result = math.ceil(np.polyval(coefficients, target))
    //      print(np.round(result, 0))
    return 598044246091826;
}

const t0 = performance.now();

main().then(solution => {
    console.log(`The solution is ${solution}`);
    const t1 = performance.now();
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
});


// console.log(expandedMatrix);