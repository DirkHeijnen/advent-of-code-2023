const fs = require("fs");
const path = require("path");



const gcd = (a, b) => {
    if (b === 0) {
        return a
    };

    return gcd(b, a % b);
}


const lcm = (a, b) => {
    return (a * b) / gcd(a, b);
}


const lcmArray = (arr) => {
    let currentLcm = arr[0];

    for (let i = 1; i < arr.length; i++) {
        currentLcm = lcm(currentLcm, arr[i]);
    }

    return currentLcm;
}


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
    let currentLocations = Array.from(locationsMap).filter(entry => entry[0].endsWith('A')).map(entry => entry[0]);
    let destinations = Array.from(locationsMap).filter(entry => entry[0].endsWith('Z')).map(entry => entry[0]);


    // Keep track of the steps at which destinations have been found.
    let destinationsFound = [];

   
    // Loop through the graph using the steps.
    while(destinationsFound.length !== destinations.length) {

        // Move each "path" one step forward.
        for (let i = 0; i < currentLocations.length; i++) {
            if (steps[stepIndex] === 'L') {
                currentLocations[i] = locationsMap.get(currentLocations[i]).left;
            } else {
                currentLocations[i] = locationsMap.get(currentLocations[i]).right;
            }
        }

        // After each step increase the counter and the step index.
        stepCounter++;
        stepIndex++;

        // Check all current locations and if we are on a destination, note the step count.
        for (let location of currentLocations) {
            for (let destination of destinations) {

                if (location === destination && !destinationsFound.some(dest => dest === location)) {
                    destinationsFound.push({ destination, step: stepCounter});
                }

            }
        }

        // Reset step index to 0 when final step is reached.
        if (stepIndex === steps.length) {
            stepIndex = 0;
        }
    };


    console.log("The solution is: " + lcmArray(destinationsFound.map(x => x.step)));
}


main();
