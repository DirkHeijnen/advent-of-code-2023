const fs = require("fs");
const path = require("path");


class Boat {

    constructor() {
        this.speed = 0;
        this.distance = 0;
    }

    increaseSpeed() {
        this.speed = this.speed + 1;
    }

    travel() {
        this.distance += this.speed;
    }
}


class Race {

    constructor(time, recordDistance) {
        this.time = time;
        this.recordDistance = recordDistance;
    }
}


class LeaderBoard {

    constructor(text) {
        this.races = [];


        // Extract the times and distances from the text.
        const times = text.split("\r\n")[0].replace("Time: ", "").trim().replace(/\s+/g, ' ').split(' ').map(x => parseInt(x));
        const distances = text.split("\r\n")[1].replace("Distance: ", "").trim().replace(/\s+/g, ' ').split(' ').map(x => parseInt(x));

        // Create all the races.
        for (let i = 0; i < times.length; i++) {
            this.races.push(new Race(times[i], distances[i]));
        }
    }
}


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');


    // Create the leaderboard and get all the races.
    const leaderBoard = new LeaderBoard(inputFileText);
    const races = leaderBoard.races;


    // Hold an array of the count of winning boats (each race the winning boat count is added)
    const raceResults = [];

    // Test case here with first race.
    for (let race of races) {
        // Create a bunch of boats, each running the race with different settings.
        const boats = [];
        for (let i = 0; i < race.time; i++) {
            boats.push(new Boat());
        }

        // Increase the speed of the boats (boat 0 has speed 0, boat 1 has speed 1, boat 2 has speed 2)
        for (let i = 0; i < race.time; i++) {
            // Create a slice of boats with equal of higher index than i.
            const boatsToIncreaseSpeedSlice = boats.slice(i);
            const boatsToIncreaseDistance = boats.slice(0, i);
    
            for (let j = 0; j < boatsToIncreaseSpeedSlice.length; j++) {
                boatsToIncreaseSpeedSlice[j].increaseSpeed();
            }

            for (let j = 0; j < boatsToIncreaseDistance.length; j++) {
                boatsToIncreaseDistance[j].travel();
            }
        }

        // Add the boat with no speed aswell....
        boats.unshift(new Boat());

        // Now find the count of winning boats.
        let count = 0;

        for (let boat of boats) {
            if (boat.distance > race.recordDistance) {
                count++;
            }
        }


        raceResults.push(count);
        console.log(`In race x there are ${count} different winners`);
    }


    let solution = 0;
    for (let raceResult of raceResults) {
        if (solution === 0) {
            solution = solution + raceResult;
            continue;
        }

        solution *= raceResult;
    }

    console.log(`The solution is ${solution}`);
}


main();