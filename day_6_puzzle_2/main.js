const fs = require("fs");
const path = require("path");



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
    let firstFoundWinner = 0;
    let middlePartOfRace = Math.round((race.time - 1) / 2);
    let lastFoundWinner = 0;  

    for (let i = 0; i <= race.time; i++) {
        let distance = i * (race.time - i);

        if (distance > race.recordDistance) {
            firstFoundWinner = i;
            break;
        }
    }

    lastFoundWinner = middlePartOfRace + (middlePartOfRace - firstFoundWinner);

    // Log the solution.
    console.log(`Solution`, lastFoundWinner - firstFoundWinner + 1)
}


main();
