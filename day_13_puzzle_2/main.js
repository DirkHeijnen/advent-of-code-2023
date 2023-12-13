const fs = require("fs");
const path = require("path");


class GridFactory {

    static create(fieldText) {
        const grid = new Grid();

        const lines = fieldText.split('\r\n').map(x => x.trim());

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

    findMatches() {
        // Array to store matching indices.
        let matches = [];
        // flag for done.
        let done = false;

        // Iterate over all the rows in the field.
        for (let row = 0; row < this.getRowCount(); row++) {
            // If we are done, exit the loop.
            if (done) {
                break;
            }

            // Get the current row, and the row after that.
            let currentRow = this.getRow(row);
            let nextRow = this.getRow(row + 1);

            // If there is no next row, the current row is the final row, nothing is left to check at this point.
            if (nextRow === undefined) {
                break;
            }

            // Keeps track of smudges.
            let smudgesDetected = 0;

            // If the current row and the next row match, or if there is a single smudge on the line, it's a potential mirror.
            if (currentRow.toString() === nextRow.toString() || this.compareForSinglePositionDifference(currentRow, nextRow)) {
                if (this.compareForSinglePositionDifference(currentRow, nextRow)) {
                    smudgesDetected++;
                }
  
                // Add the mirror index.
                matches.push(row);

                // Go up and down once.
                let previousRowIndex = row - 1;
                let nextRowIndex = row + 2;

                // Get the rows at the indices.
                let previousRow = this.getRow(previousRowIndex);
                nextRow = this.getRow(nextRowIndex);

                // Loop over the rows untill the end.
                while (true) {
                    if (previousRow && nextRow) {
                        if (previousRow.toString() === nextRow.toString()) {
                            matches.push(previousRowIndex);
                        } else if (this.compareForSinglePositionDifference(previousRow, nextRow)) {
                            smudgesDetected++;
                            matches.push(previousRowIndex);
                        } else {
                            // Reflection is not perfect, so there was no mirror, remove all matches and leave the loop.
                            matches = [];
                            break;
                        }
                    } else {
                        // The end of the mirror is reached.
                        // If the mirror doesn't have exactly 1 smudge it's not a valid mirror.
                        if (smudgesDetected !== 1) {
                            matches = [];
                            break;
                        }

                        // If the previous row is defined, we need to traverse back to the start.
                        if (previousRow) {
                            for (let i = previousRowIndex; i >= 0; i--) {
                                matches.push(i);
                            }
                        }
           
                        done = true;
                        break;
                    }
                  
                    // Increment the indeces.
                    previousRowIndex--;
                    nextRowIndex++;

                    // Update the rows.
                    previousRow = this.getRow(previousRowIndex);
                    nextRow = this.getRow(nextRowIndex);
                }
            }
        }

        return matches;
    }

    compareForSinglePositionDifference(array1, array2) {
        let difference = 0;
        let index = 0;

        // Early exit
        if (array1.length !== array2.length) {
            return false;
        }

        while (index <= array1.length){
            if (array1[index] !== array2[index]) {
                difference++;
            }
            index++;
        }

        return difference === 1;
    }

    transpose() {
        this.grid = this.grid[0].map((_, colIndex) => this.grid.map(row => row[colIndex]));
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Split input by empty lines.
    const fields = inputFileText.split('\r\n\r\n');

    // Value for keeping track of the solution
    let solution = 0;

    for (let field of fields) {
        const grid = GridFactory.create(field);

        // Check all rows, add the result, the flip the array 90 degrees and repeat for the columns.
        solution += grid.findMatches().length * 100;
        grid.transpose();
        solution += grid.findMatches().length;
    }
    
    // Return answer.
    return solution;
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
