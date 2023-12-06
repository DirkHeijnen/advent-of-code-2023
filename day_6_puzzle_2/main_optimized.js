const fs = require("fs");
const path = require("path");


function findWinningTime(raceTime, recordDistance) {
    // Coefficients for the quadratic equation
    let a = -1;
    let b = raceTime;
    let c = -recordDistance;

    // Calculating the discriminant
    let discriminant = b * b - 4 * a * c;

    // Calculate the two possible solutions
    let solution1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    let solution2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    // Array to hold valid solutions
    let validSolutions = [solution1, solution2];
    validSolutions.sort((a, b) => a - b);

    // Return
    return Math.floor(validSolutions[0]) + 1;
}


class Race {

    constructor(text) {
        const time = parseInt(text.split("\r\n")[0].replace("Time: ", "").trim().replace(/\s+/g, ''));
        const distance = parseInt(text.split("\r\n")[1].replace("Distance: ", "").trim().replace(/\s+/g, ''));

        this.time = time;
        this.recordDistance = distance;
    }
}


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the race
    const race = new Race(inputFileText);

    // Calculate the possible winning times.
    let firstFoundWinner = findWinningTime(race.time, race.recordDistance);
    let middlePartOfRace = Math.round((race.time - 1) / 2);
    let lastFoundWinner =  middlePartOfRace + (middlePartOfRace - firstFoundWinner);

    // Log the solution.
    console.log(`Solution`, lastFoundWinner - firstFoundWinner + 1)
}


main();