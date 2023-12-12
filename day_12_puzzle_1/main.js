const fs = require("fs");
const path = require("path");


// Custom memoized wrapper.
const memoizedFunction = (fn) => {
    const cache = new Map();

    return function(...args) {
        const key = JSON.stringify({ ...args });

        if (!cache.has(key)) {
            cache.set(key, fn.apply(this, args));
        }
        
        return cache.get(key);
    };
};



// Given a spring, will find all consecutive # at the start and return.
// If none are found undefined is returned.
const findConsecutiveHashTagsAtStart = (spring) => {
    let count = 0;

    // Count consecutive '#' characters from the start
    while (count < spring.length && spring[count] === '#') {
        count++;
    }

    // Check if the sequence of '#' is at the start and followed by '.' or if it's at the end.
    if (count > 0) {
        if (spring[count] === '.' || spring.length === count) {
            return spring.substring(0, count);
        }
    }

    return undefined;
}


// Counts the hashtags in the spring and returns that count
const countHashTags = (spring) => {
    let count = 0;

    for (let char of spring) {
        if (char === '#') {
            count++;
        }
    }

    return count;
}


const findCombinations = memoizedFunction((spring, groupings) => {
    // Replace dots on both ends of the spring.
    spring = spring.replace(/^\.+|\.+$/, '');

    // All groups are placed.
    if (spring === '') {
        if (groupings.length === 0) {
            return 1;
        }
        return 0;
    }

    if (groupings.length === 0) {
        if (spring.includes('#')) {
            return 0;
        }
        return 1;
    }

    let result = 0;
    
    // Check for damaged (fixed '#') section at the start of the row
    const consecutiveHashTags = findConsecutiveHashTagsAtStart(spring);
    const currentGroupSize = groupings[0];

    if (consecutiveHashTags) {
        if (consecutiveHashTags.length === currentGroupSize) {
            // Values for next recursion.
            const nextSpring = spring.slice(currentGroupSize);
            const nextGroups = groupings.slice(1);

            // Do the recursion and add to result.
            result += findCombinations(nextSpring, nextGroups);
        }
    } else if (spring.includes('?')) {
        // For any ? left in the spring, we can change it with either '.' or '#'.

        // First try the '.'
        result += findCombinations(spring.replace('?', '.'), groupings);

        // If there are hashtags in the string, and the amount of hashtags is less than expect, try
        // replacing with '#'.
        const expectedHashTags = groupings.reduce((a, b) => a + b);
        
        if (countHashTags(spring) < expectedHashTags) {
            // Values for next recursion.
            const nextSpring = spring.replace('?', '#'); // Replaces only the first detected ? with #.
            const nextGroups = groupings;

            result += findCombinations(nextSpring, nextGroups);
        }
    }

    return result;
});


const main = async () => {
    // Read input
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Read the lines.
    const lines = inputFileText.split('\r\n').map(x => x.trim());

    // Hold the sum.
    let sum = 0;

    // Add to the sum for all the possbilities of each line.
    for (let line of lines) {
        let spring = line.split(' ')[0];
        let grouping = line.split(' ')[1].split(',').map(x => parseInt(x));

        sum += findCombinations(spring, grouping);
    }

    // Return the sum.
    return sum;
}


main().then((sum) => {
    console.log('The sum = ' + sum);
});
