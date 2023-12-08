const fs = require("fs");
const path = require("path");


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');


    // Parse the input.
    const steps = inputFileText.split('\r\n')[0].trim().split('');

    const locations = inputFileText.split('\r\n').slice(2).map(x => x.trim()).map((line) => {
        const current = line.split('=')[0].trim();
        const left = line.split('=')[1].split(',')[0].trim().replace('(', '');
        const right = line.split('=')[1].split(',')[1].trim().replace(')', '');

        return { current, left, right };
    });


    // Turn the location into a map of [key = current, value = { left, right }];
    // This makes location access be O(1).
    const locationsMap = new Map();
    for (let location of locations) {
        if (!locationsMap.has(location.current)) {
            locationsMap.set(location.current, { left: location.left, right: location.right });
        }
    }


    // Setup counters for total steps and the step index, and set current and destination points.
    let stepCounter = 0;
    let stepIndex = 0;
    let currentLocation = 'AAA';
    let destination = 'ZZZ';


    // Loop through the graph using the steps.
    while (currentLocation !== destination) {
        // Move one step forward.
        if (steps[stepIndex] === 'L') {
            currentLocation = locationsMap.get(currentLocation).left;
        } else {
            currentLocation = locationsMap.get(currentLocation).right;
        }

        // After each step increase the counter and the step index.
        stepCounter++;
        stepIndex++;

        // Reset step index to 0 when final step is reached.
        if (stepIndex === steps.length) {
            stepIndex = 0;
        }
    } 

    console.log("The solution is: " + stepCounter);
}


main();
