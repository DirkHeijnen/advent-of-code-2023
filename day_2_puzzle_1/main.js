const fs = require("fs");
const path = require("path");


// Enum to determine the state of a game after validation.
const GameState = {
    UNCHECKED: "UNCHECKED",
    POSSIBLE: "POSSIBLE",
    IMPOSSIBLE: "IMPOSSIBLE"
}


// Class to hold a single round result within a game.
class GameRoundResult {

    constructor(red, green, blue) {
        this.red = red || 0;
        this.green = green || 0;
        this.blue = blue || 0;
    }
}


// Class to hold a single game.
class Game {

    constructor(id) {
        // Game id and state.
        this.id = id;
        this.state = GameState.UNCHECKED;

        // Cube Boundaries.
        this.redBoundary = 12;
        this.greenBoundary = 13;
        this.blueBoundary = 14;

        // Rounds played.
        this.gameRounds = []
    }

    // Adds a round to the game.
    //
    // Here are 3 example string of rounds.
    //      "3 blue, 4 red"
    //      "1 red, 2 green, 6 blue"
    //      "2 green"
    addRound(gameRoundResult) {
        let red = 0;
        let green = 0;
        let blue = 0;

        for (let element of gameRoundResult.split(',')) {
            if (element.includes(' red')) {
                red = parseInt(element.replace(' red', ''));
            }
            if (element.includes(' green')) {
                green = parseInt(element.replace(' green', ''));
            }
            if (element.includes(' blue')) {
                blue = parseInt(element.replace(' blue', ''));
            }
        }

        this.gameRounds.push(new GameRoundResult(red, green, blue));
    }

    // Validate if the game is possible or impossible given it's current configuration.
    validateGame() {
        for (let round of this.gameRounds) {
            if (round.red > this.redBoundary || round.green > this.greenBoundary || round.blue > this.blueBoundary) {
                this.state = GameState.IMPOSSIBLE;
                return;
            }
        }

        this.state = GameState.POSSIBLE;
    }
}


const main = () => {
    // Path to the input files (Contains the values for the puzzle)
    const inputFilePath = path.join(__dirname, 'input.txt');

    // Get the content of the file as text, split into lines and store each line in an array.
    const lines = fs.readFileSync(inputFilePath, 'utf-8').split('\r\n');


    // Make a list of all games.
    const games = [];

    // Each line looks like this ("Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green")
    for (const line of lines) {
        // Get the game id and create the game.
        const gameId = parseInt(line.split(':')[0].replace("Game ", ""));
        const game = new Game(gameId);

        // Game rounds are extracted by semicolon, then trimmed to removed outside spaces.
        const rounds = line.split(':')[1].split(";").map((x) => x.trim());

        // Add all rounds to the game
        for (let round of rounds) {
            game.addRound(round);
        }

        // After all rounds are added, validate the game.
        game.validateGame();

        // Add the game to the games array.
        games.push(game);
    }

    // Now all games are finished, calculate the sum
    let sum = 0;

    for (let game of games) {
        if (game.state === GameState.POSSIBLE) {
            sum += game.id;
        }
    }

    console.log("The sum of all the possible games identifiers = " + sum); 
}

main();