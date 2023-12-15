const fs = require("fs");
const path = require("path");


const getAsciiValue = (character) => {
    return character.charCodeAt(0);
}


const hash = (string) => {
    let currentValue = 0;
    const multiplier = 17;
    const divider = 256;

    for (let char of string) {
        currentValue += getAsciiValue(char);
        currentValue *= multiplier;
        currentValue %= divider;
    }

    return currentValue;
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    sum = 0;

    for (let item of inputFileText.trim().split(',')) {
        sum += hash(item);
    }

    return sum;
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
