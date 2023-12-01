const fs = require("fs");
const path = require("path");


// Loops over characters in the string, when number is found instantly return.
const findFirstNumberInString = (string) => {
    for (let i = 0; i < string.length; i++) {
        let character = string.charAt(i);

        if (isCharacterNumber(character)) {
            return character;
        }
    }
}

// Loops over characters in the string backwards, when number is found instantly return.
const findLastNumberInString = (string) => {
    for (let i = string.length - 1; i >= 0; i--) {
        let character = string.charAt(i);

        if (isCharacterNumber(character)) {
            return character;
        }
    }
}

const isCharacterNumber = (char) => {
    return char >= '0' && char <= '9';
}


// Finds the calibration value by input string and return the calibration value as a number.
const findCalibrationValue = (string) => {
    const firstNumber = findFirstNumberInString(string);
    const lastNumber = findLastNumberInString(string);

    const calibrationValue = firstNumber + lastNumber;
    return parseInt(calibrationValue);
}


const main = () => {
    // Path to the input files (Contains the values for the puzzle)
    const inputFilePath = path.join(__dirname, 'input.txt');

    // Get the content of the file as text, split into lines and store each line in an array.
    const lines = fs.readFileSync(inputFilePath, 'utf-8').split('\n');

    // Create a variable that stores the sum of the calibration values.
    let sum = 0;

    // Loop over each line and calculate the sum of the calibration values.
    for (let line of lines) {
        sum += findCalibrationValue(line);
    }

    console.log("The sum of all the calibration values = " + sum); 
}

main();