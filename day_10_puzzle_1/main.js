const fs = require("fs");
const path = require("path");


class PipeMazeFactory {

    static create(text) {
        const lines = text.split('\r\n').map(line => line.trim());

        const pipeMaze = new PipeMaze();

        for (let row = 0; row < lines.length; row++) {
            const columns = lines[row].split('');

            for (let column = 0; column < columns.length; column++) {
                const symbol = lines[row][column];
                pipeMaze.addToPosition(row, column, PipeFactory.create(symbol, row, column));
            }
        }

        return pipeMaze;
    }
}


class PipeMaze {
 
    constructor() {
        this.maze = [];
    }

    getRowCount() {
        return this.maze.length;
    }

    getColumnCount() {
        if (this.maze.length > 0) {
            return this.maze[0].length;
        }
        return 0;
    }

    addToPosition(row, column, value) {
        if (this.maze[row] === undefined) {
            this.maze[row] = [];
        }

        this.maze[row][column] = value;
    }

    getPosition(row, column) {
        return this.maze[row][column];
    }

    getStartingPosition() {
        const rowCount = this.maze.length;
        const columnCount = this.maze.length === 0 ? 0 : this.maze[0].length;

        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {

                let currentPosition  = this.getPosition(row, column);

                if (currentPosition.symbol === 'S') {
                    return currentPosition;
                }
            }
        }

        return undefined;
    }

    getNorthPositionFrom(row, column) {
        if (this.maze[row - 1]) {
            return this.maze[row - 1][column];
        }

        return undefined;
    }

    getEastPositionFrom(row, column) {
        return this.maze[row][column + 1];
    }

    getSouthPositionFrom(row, column) {
        if (this.maze[row + 1]) {
            return this.maze[row + 1][column];
        }
        
        return undefined;
    }

    getWestPositionFrom(row, column) {
        return this.maze[row][column - 1];
    }

    hasConnectionToNorth(row, column) {
        const currentPosition = this.getPosition(row, column);
        const otherPosition = this.getNorthPositionFrom(row, column)

        if (currentPosition === undefined || otherPosition === undefined || otherPosition.symbol === '.') {
            return false;
        }

        return currentPosition.north === 'open' && otherPosition.south === 'open';
    }

    hasConnectionToEast(row, column) {
        const currentPosition = this.getPosition(row, column);
        const otherPosition = this.getEastPositionFrom(row, column)

        if (currentPosition === undefined || otherPosition === undefined || otherPosition.symbol === '.') {
            return false;
        }

        return currentPosition.east === 'open' && otherPosition.west === 'open';
    }

    hasConnectionToSouth(row, column) {
        const currentPosition = this.getPosition(row, column);
        const otherPosition = this.getSouthPositionFrom(row, column)

        if (currentPosition === undefined || otherPosition === undefined || otherPosition.symbol === '.') {
            return false;
        }

        return currentPosition.south === 'open' && otherPosition.north === 'open';
    }

    hasConnectionToWest(row, column) {
        const currentPosition = this.getPosition(row, column);
        const otherPosition = this.getWestPositionFrom(row, column)

        if (currentPosition === undefined || otherPosition === undefined || otherPosition.symbol === '.') {
            return false;
        }

        return currentPosition.west === 'open' && otherPosition.east === 'open';
    }

    getLoopToDirection(direction) {
        // Keep an array of pipes for the current loop.
        const loopPipes = [];

        // Get starting pipe and add it to the loop.
        const startingPipe = structuredClone(this.getStartingPosition());
        loopPipes.push(startingPipe);

        // Check the connection from the starting pipe to the given direction.
        if (direction === 'north' && !this.hasConnectionToNorth(startingPipe.row, startingPipe.column)) {
            return []
        }
        if (direction === 'east' && !this.hasConnectionToEast(startingPipe.row, startingPipe.column)) {
            return []
        }
        if (direction === 'south' && !this.hasConnectionToSouth(startingPipe.row, startingPipe.column)) {
            return []
        }
        if (direction === 'west' && !this.hasConnectionToWest(startingPipe.row, startingPipe.column)) {
            return []
        }

        // Get current walking pipe.
        let currentPipe = undefined;
        switch (direction) {
            case "north": currentPipe = this.getNorthPositionFrom(startingPipe.row, startingPipe.column); break;
            case "east": currentPipe = this.getEastPositionFrom(startingPipe.row, startingPipe.column); break;
            case "south": currentPipe = this.getSouthPositionFrom(startingPipe.row, startingPipe.column); break;
            case "west": currentPipe = this.getWestPositionFrom(startingPipe.row, startingPipe.column); break;
        }

        // Add current pipe to the loop
        loopPipes.push(currentPipe);


        // Store for previous location and current location.
        let previousWalkedPipe = structuredClone(this.getStartingPosition());

        // Traverse
        while (!currentPipe.equals(startingPipe)) {
            // Add the new current pipe to the loop.
            loopPipes.push(currentPipe);

            // Get current pipe row/column
            let currentRow = currentPipe.row;
            let currentColumn = currentPipe.column;

            // Check directions.
            if (this.hasConnectionToNorth(currentRow, currentColumn)) {
                const destinationPipe = this.getNorthPositionFrom(currentRow, currentColumn);

                if (!destinationPipe.equals(previousWalkedPipe)) {
                    previousWalkedPipe = structuredClone(currentPipe);
                    currentPipe = destinationPipe;
                    continue;
                }
            }

            if (this.hasConnectionToEast(currentRow, currentColumn)) {
                const destinationPipe = this.getEastPositionFrom(currentRow, currentColumn);

                if (!destinationPipe.equals(previousWalkedPipe)) {
                    previousWalkedPipe = structuredClone(currentPipe);
                    currentPipe = destinationPipe;
                    continue;
                }
            }

            if (this.hasConnectionToSouth(currentRow, currentColumn)) {
                const destinationPipe = this.getSouthPositionFrom(currentRow, currentColumn);

                if (!destinationPipe.equals(previousWalkedPipe)) {
                    previousWalkedPipe = structuredClone(currentPipe);
                    currentPipe = destinationPipe;
                    continue;
                };
            }

            if (this.hasConnectionToWest(currentRow, currentColumn)) {
                const destinationPipe = this.getWestPositionFrom(currentRow, currentColumn);

                if (!destinationPipe.equals(previousWalkedPipe)) {
                    previousWalkedPipe = structuredClone(currentPipe);
                    currentPipe = destinationPipe;
                    continue;
                }
            }

            // Dead end.
            break;
        }

        if (currentPipe.equals(startingPipe)) {
            loopPipes.push(currentPipe);
            return loopPipes;
        }

        return []
    }
}


class PipeFactory {

    static create(symbol, row, column) {
        switch(symbol) {
            case '|': return new Pipe('|', row, column, "open", "closed", "open", "closed");
            case '-': return new Pipe('-', row, column, "closed", "open", "closed", "open");
            case 'L': return new Pipe('L', row, column, "open", "open", "closed", "closed");
            case 'J': return new Pipe('J', row, column, "open", "closed", "closed", "open");
            case '7': return new Pipe('7', row, column, "closed", "closed", "open", "open");
            case 'F': return new Pipe('F', row, column, "closed", "open", "open", "closed");
            case 'S': return new Pipe('S', row, column, "open", "open","open","open");
            case '.': return new Pipe('.', row, column, "closed", "closed","closed","closed");
        }
    }
}


class Pipe {

    constructor(symbol, row, column, north, east, south, west) {
        // The symbol of the pipe.
        this.symbol = symbol;

        // The position of the pipe.
        this.row = row;
        this.column = column;

        // The openings/closings of the pipe.
        this.north = north;
        this.east = east;
        this.south = south;
        this.west = west;
    }

    equals(other) {
        return this.row === other.row && this.column === other.column;
    }
}


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the pipe maze given the input text.
    const pipeMaze = PipeMazeFactory.create(inputFileText);

    // Find loops (Each loop has a direction and all the ordered steps of the loop).
    const loops = [
        { direction: "north", steps: pipeMaze.getLoopToDirection("north") },
        { direction: "south", steps: pipeMaze.getLoopToDirection("south") },
        { direction: "east", steps: pipeMaze.getLoopToDirection("east") },
        { direction: "west", steps: pipeMaze.getLoopToDirection("west") },
    ]

    // Filter out loops that don't exists (empty loops)
    const existingLoops = loops.filter(loop => loop.steps.length > 0);

    // Order the existing loops in descending order.
    const orderedLoops = existingLoops.sort((a, b) => a.steps.length - b.steps.length);

    // The furthest point is the steps / 2 - 1 (Because the starting point is twice in the loop).
    const longestLoop = orderedLoops[0];
    const furthestPoints = longestLoop.steps.length / 2 - 1;

    console.log("The solution is: " + furthestPoints);
}


main();
