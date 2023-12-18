const fs = require("fs");
const path = require("path");


/**
 * Enum that holds the various directions for movement
 */
const Direction = {
    "UP": "UP",
    "DOWN": "DOWN",
    "LEFT": "LEFT",
    "RIGHT": "RIGHT"
}


/**
 * Keeps the definition of a instruction which is the direction and amount for holes to dig and color
 */
class Instruction {

    /**
     * Creates the instruction object from a line of text.
     * 
     * @param {String} line The single line of text from the input file
     */
    constructor(line) {
        this.direction = this.#getDirection(line.split(' ')[0].trim())
        this.steps = Number(line.split(' ')[1].trim());
        this.color = line.split(' ')[2].trim().replaceAll('(', '').replaceAll(')', '');
    }

    /**
     * Turns the single letter direction into the enum equivalent.
     * 
     * @param {String} direction The direction as a letter given by the input file
     * @returns {Direction} The direction enum for the given direction or undefined.
     */
    #getDirection(direction) {
        return direction === 'U' ? Direction.UP :
                direction === 'D' ? Direction.DOWN :
                direction === 'L' ? Direction.LEFT :
                direction === 'R' ? Direction.RIGHT :
                undefined;
    }
}


/**
 * Defines the digging field that the elves are digging to store the lava in.
 */
class DiggingField {

    /**
     * Creates a new digging field with the shape of the hole as a polygon.
     */
    constructor() {
        this.polygon = [[0, 0]];
    }

    /**
     * Digs a given amount of steps into the right direction.
     * 
     * @param {Number} stepCount The amount of steps to dig right.
     */
    digRight(stepCount) {
        const rowIndex = this.polygon[this.polygon.length - 1][0]
        const columnIndex = this.polygon[this.polygon.length - 1][1] + stepCount;

        this.polygon.push([rowIndex, columnIndex]);
    }

    /**
     * Digs a given amount of steps into the left direction.
     * 
     * @param {Number} stepCount The amount of steps to dig left.
     */
    digLeft(stepCount) {
        const rowIndex = this.polygon[this.polygon.length - 1][0]
        const columnIndex = this.polygon[this.polygon.length - 1][1] - stepCount;

        this.polygon.push([rowIndex, columnIndex]);
    }

    /**
     * Digs a given amount of steps into the downwards direction.
     * 
     * @param {Number} stepCount The amount of steps to dig downwards.
     */
    digDown(stepCount) {
        const rowIndex = this.polygon[this.polygon.length - 1][0] + stepCount
        const columnIndex = this.polygon[this.polygon.length - 1][1];

        this.polygon.push([rowIndex, columnIndex]);
    }

    /**
     * Digs a given amount of steps into the upwards direction.
     * 
     * @param {Number} stepCount The amount of steps to dig upwards.
     */
    digUp(stepCount) {
        const rowIndex = this.polygon[this.polygon.length - 1][0] - stepCount 
        const columnIndex = this.polygon[this.polygon.length - 1][1];

        this.polygon.push([rowIndex, columnIndex]);
    }

    /**
     * Digs out the interatior and returns the size using the shoelace formula.
     * 
     * @returns The area of the hole in cubic meters.
     */
    calculateArea() {
        // The area of the hole.
        let area = 0;
    
        // Store the current point's index.
        let currentPointIndex = 0;

        // Go over every point of the polygon, starting at the first point.
        for (let point of this.polygon) {

            // Take the x and y position of the current point.
            const currentPointX = point[0]; 
            const currentpointY = point[1];

            // Take the next point's x and y position.
            // If there is no next point, then connect back to the first point.
            const isNextNodeAvailable = this.polygon[currentPointIndex + 1] !== undefined;
            const nextPointX = isNextNodeAvailable ? this.polygon[currentPointIndex + 1][0] : this.polygon[0][0];
            const nextPointY = isNextNodeAvailable ? this.polygon[currentPointIndex + 1][1] : this.polygon[0][1];

            // Calculate the area of the hole using the shoelace formula.
            area += currentPointX * nextPointY;
            area -= currentpointY * nextPointX;

            // Add the distance travelled to the next node to the area.
            area += Math.abs(currentPointX - nextPointX);
            area += Math.abs(currentpointY - nextPointY);

            // Increment the current point index for the next iteration.
            currentPointIndex++;
        }

        // Now we have calculated the area of the enclosed polygon.
        return Math.abs(area / 2);
    }


    /**
     * Calculates the circumference of the hole itself.
     * 
     * Because the hole itself is marked by holes instead of just lines, the size of the actual hole is larger than
     * just the area, but also the circumference must be added.
     * 
     * @returns The circumference of the hole.
     */
    calculateCircumference() {
        let circumference = 0;

        // Store the current point's index.
        let currentPointIndex = 0;

        // Go over every point of the polygon, starting at the first point.
        for (let point of this.polygon) {

            // Take the x and y position of the current point.
            const currentPointX = point[0]; 
            const currentpointY = point[1];

            // Take the next point's x and y position.
            // If there is no next point, then connect back to the first point.
            const isNextNodeAvailable = this.polygon[currentPointIndex + 1] !== undefined;
            const nextPointX = isNextNodeAvailable ? this.polygon[currentPointIndex + 1][0] : this.polygon[0][0];
            const nextPointY = isNextNodeAvailable ? this.polygon[currentPointIndex + 1][1] : this.polygon[0][1];

            // Calculate the area of the hole using the shoelace formula.
            circumference += Math.sqrt(Math.pow(nextPointX - currentPointX, 2) + Math.pow(nextPointY - currentpointY, 2));

            // Increment the current point index for the next iteration.
            currentPointIndex++;
        }
    
        // Now we have calculated the circumference of the hole.
        return circumference;
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the instructions from the input.
    const instructions = inputFileText.split('\r\n').map(x => x.trim()).map(x => new Instruction(x));

    // Create the digging grid.
    const diggingField = new DiggingField();

    // Execute the instruction
    for (let instruction of instructions) {
        switch (instruction.direction) {
            case Direction.UP: diggingField.digUp(instruction.steps); break;
            case Direction.LEFT: diggingField.digLeft(instruction.steps); break;
            case Direction.RIGHT: diggingField.digRight(instruction.steps); break;
            case Direction.DOWN: diggingField.digDown(instruction.steps); break;
        }
    }

    // Get the size of the hole, which is returned as the answer. (And a magic 1, because of starting point itself is also a 1 meter hole)
    return diggingField.calculateArea() + diggingField.calculateCircumference() + 1;
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
