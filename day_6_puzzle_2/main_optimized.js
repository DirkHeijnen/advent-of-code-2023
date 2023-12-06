const fs = require("fs");
const path = require("path");


function findWinningTime(raceTime, recordDistance) {
    let discriminant = (raceTime * raceTime) - (4 * recordDistance);

    let sqrtDiscriminant = Math.floor(Math.sqrt(discriminant));

    return Math.floor((raceTime - sqrtDiscriminant) / 2);
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
    console.log(`Solution`, lastFoundWinner - firstFoundWinner - 1)
}


main();
