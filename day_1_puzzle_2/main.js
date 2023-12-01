const fs = require("fs");
const path = require("path");


// This function replaces written out digits with their numerical equivalents based on the text parsing directions.
//
// To solve this problem in a readable manner, each occurance of the written digits are stored as an object looking like this:
//   { startingIndex: 3, writtenDigit: 'eight', numericalDigit: '8' }
//
// These are appended into an array like so (for input: eightwothree):
// [
//      { startingIndex: 0, writtenDigit: 'eight', numericalDigit: '8' },
//      { startingIndex: 4, writtenDigit: 'two', numericalDigit: '2' },
//      { startingIndex: 7, writtenDigit: 'three', numericalDigit: '3' },
// ]
//
// Then the text direction is used to determine which entry to replace:
//      LTR (Left to Right): The first entry replaces the written digit with the numerical digit.
//      RTL (Right to Left): The last entry replaces the written digit with the numerical digit.
//
// Since only the outer number matter for this puzzle, the other writtendigits are ignored.
//
// The return value will be the string with the first occurance of the written digit replaced by the numerical, based on text direction.
const replaceWrittenDigitsWithNumericalDigit = (string, textDirection) => {
    // Array to store occurances.
    let occurances = [];

    // For each found digit, append it to the occurances array.
    occurances.push(...[...string.matchAll(new RegExp('one', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'one', numericalDigit: '1'  }}));
    occurances.push(...[...string.matchAll(new RegExp('two', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'two', numericalDigit: '2' }}));
    occurances.push(...[...string.matchAll(new RegExp('three', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'three', numericalDigit: '3' }}));
    occurances.push(...[...string.matchAll(new RegExp('four', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'four', numericalDigit: '4' }}));
    occurances.push(...[...string.matchAll(new RegExp('five', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'five', numericalDigit: '5' }}));
    occurances.push(...[...string.matchAll(new RegExp('six', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'six', numericalDigit: '6' }}));
    occurances.push(...[...string.matchAll(new RegExp('seven', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'seven', numericalDigit: '7' }}));
    occurances.push(...[...string.matchAll(new RegExp('eight', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'eight', numericalDigit: '8' }}));
    occurances.push(...[...string.matchAll(new RegExp('nine', 'gi'))].map(a => { return { startingIndex: a.index, writtenDigit: 'nine', numericalDigit: '9' }}));

    // If there are no occurrences there is nothing to replace and we can return the string as it is.
    if (occurances.length === 0) {
        return string;
    }

    // Sort the array based on the textDirection.
    if (textDirection === 'LTR') {
        occurances.sort((a, b) => a.startingIndex - b.startingIndex);
    }
    if (textDirection === 'RTL') {
        occurances.sort((a, b) => b.startingIndex - a.startingIndex);
    }

    // Find the first occurrence.
    const firstOccurrence = occurances[0];

    // Take first and second half of the text around the occurrence.
    const firstHalf = string.substr(0, firstOccurrence.startingIndex)
    const lastHalf = string.substr(firstOccurrence.startingIndex + firstOccurrence.writtenDigit.length);

    // Combine the first and last half and put the numberic digit in the middle, essentially doing a direction agnostic replace.
    return firstHalf + firstOccurrence.numericalDigit + lastHalf;
}


// Loops over characters in the string, when number is found instantly return.
const findFirstNumberInString = (string) => {
    string = replaceWrittenDigitsWithNumericalDigit(string, 'LTR');

    for (let i = 0; i < string.length; i++) {
        let character = string.charAt(i);

        if (isCharacterNumber(character)) {
            return character;
        }
    }
}

// Loops over characters in the string backwards, when number is found instantly return.
const findLastNumberInString = (string) => {
    string = replaceWrittenDigitsWithNumericalDigit(string, 'RTL');
    
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

    // Loop over each line, calculate the sum of the calibration values.
    for (let line of lines) {
        sum += findCalibrationValue(line);
    }

    console.log("The sum of all the calibration values = " + sum); 
}

main();