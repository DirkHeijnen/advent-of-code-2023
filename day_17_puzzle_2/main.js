const fs = require("fs");
const path = require("path");


/**
 * Parses the input and return a 2d array contaning the grid.
 * 
 * @param {String} input The input of the challenge
 * @returns {Number[][]} A 2d grid filled with the numbers of heatloss.
 */
const parseInput = (input) => {
    return input.split("\r\n").map(line => line.split("").map(Number));
}

class GridManager {

    /**
     * Initialize an empty object to store grid data.
     * 
     * Initialize an array to keep track of the last position set in the grid.
     */
    constructor() {
        this.gridData = {};
        this.lastPosition = [];
    }
    
    /**
     * Sets a value in the grid at the specified coordinates.
     * 
     * @param {any} value The value to be set in the grid.
     * @param {number} x The x-coordinate in the grid.
     * @param {number} y The y-coordinate in the grid.
     * @param {number} direction The direction moved in to reach this node.
     * @param {number} distanceToRoot The distance from this node to the starting node.
     * @returns The value that was set in the grid.
     */
    set(value, x, y, direction, distanceToRoot) {
        if (!this.gridData[distanceToRoot]) {
            this.gridData[distanceToRoot] = {};
        } 

        if (!this.gridData[distanceToRoot][direction]) {
            this.gridData[distanceToRoot][direction] = {};
        }

        if (!this.gridData[distanceToRoot][direction][y]) {
            this.gridData[distanceToRoot][direction][y] = {}
        }

        this.gridData[distanceToRoot][direction][y][x] = value;

        this.lastPosition = [x, y, direction, distanceToRoot];

        return value;
    }

    /**
     * Retrieves the value from the grid at the specified coordinates.
     * 
     * @param {number} x The x-coordinate in the grid.
     * @param {number} y The y-coordinate in the grid.
     * @param {number} direction The direction moved in to reach this node.
     * @param {number} distanceToRoot The distance from this node to the starting node.
     * 
     * @returns The value at the specified coordinates, or undefined if not set.
     */
    get(x, y, direction, distanceToRoot) {
        return this.gridData[distanceToRoot]?.[direction]?.[y]?.[x];
    }
}


class PriorityQueue {

    constructor() {
        this.queue = [];
    }

    add(cost, x, y, direction, distance, previous) {
        if (!this.queue[cost]) {
            this.queue[cost] = [];
        }

        this.queue[cost].push({ x, y, direction, distance, previous });
    }

    get(cost) {
        return this.queue[cost];
    }

    pop(currentCost) {
        return this.queue[currentCost].pop();
    }
}


const findShortestPath = (grid) => {

    // Create the base properties for the algorithm.
    const queue = new PriorityQueue();
    const visited = new GridManager();

    // Set the directions for the grid traversal.
    const directions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

    // Set a cost for later use.
    let currentCost = 0;
    
    // Set the starting point
    const startingCost = currentCost;
    const startingX = 0;
    const startingY = 0;

    // Add the starting point to the queue.
    queue.add(startingCost, startingX, startingY, -1, 4, null);


    while (true) {

        // Loop over the queue.
        while (queue.get(currentCost) && queue.get(currentCost).length) {

            // Pop item from the queue.
            const current = queue.pop(currentCost);

            // If we already visited this node with the same direction and distance, skip.
            if (visited.get(current.x, current.y, current.direction, current.distance) !== undefined) {
                continue;
            }

            // Mark the node as visited.
            visited.set(current.previous, current.x, current.y, current.direction, current.distance);


            // For every direction possible.
            for (let i = 0; i < 4; i++) {

                // Get the delta to the direction.
                const nextPosition = directions[i];

                // Set the new X and Y values into that direction.
                const newX = current.x + nextPosition[0];
                const newY = current.y + nextPosition[1];

                // Check if we are moving in another direction than we just came from.
                const isTurn = i !== current.direction;


                // If we are continuing (not taking a turn)
                //      Then we must check the distance we already move.
                //      If we have moved 10 consecutive moves in a single direction, we can skip this option.
                if (!isTurn && current.distance >= (10)) {
                    continue;
                };

                // In part 2, we can only take a turn if we already moved 4 times in the same direction, so no
                // need to check edges that turn if we haven't made 4 moves so far.
                if (isTurn && current.distance < 4) {
                    continue;
                }

                // Also continue if the next option 
                if (newX < 0 || newY < 0 || newX >= grid[0].length || newY >= grid.length) {
                    continue;
                }

                // If we move back in the direction we just came from then continue.
                if (current.direction === (i + 2) % 4) {
                    continue;
                }

                // Check if we reached the end position.
                if (current.x === grid[0].length - 1 && current.y === grid.length - 1) {

                    // Get the end position.
                    const endPosition = [current.x, current.y, current.direction, current.distance];

                    // Reconstruct the taken path.
                    const pathTaken = reconstructPath(visited, ...endPosition);

                    // Return the response.
                    return { cost: currentCost, path: pathTaken };
                }

                // Calculate the cost to travel over this edge.
                const newCost = currentCost + grid[newY][newX];

                // Add the new edge to the queue.
                queue.add(newCost, newX, newY, i, isTurn ? 1 : current.distance + 1, [current.x, current.y, current.direction, current.distance]);
            }
        }

        // Increment the current code by 1.
        currentCost++;
    }

}


function reconstructPath(visited, x, y, direction, distanceToRoot) {
    // Add the end to the path.
    const path = [[x, y, direction, distanceToRoot]];

    // Walk back from end to start.
    while (true) {
        const node = visited.get(x, y, direction, distanceToRoot);

        // Reached the start node so break;
        if (node === null) {
            break;
        }

        // Push the node to the reconstruction path.
        path.push(node);


        [x, y, direction, distanceToRoot] = node;
    }

    // Reverse it to get the path from start to end.
    return path.reverse();
}



const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');


    // Create the grid
    const grid = parseInput(inputFileText);

    // Traverse the grid.
    const result = findShortestPath(grid);

    // Log the results.
    return result.cost;
};



main().then(solution => {
    console.log(`The solution is ${solution}`);
});