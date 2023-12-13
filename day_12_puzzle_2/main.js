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


// Given a spring, will find all consecutive # at the start and return a string containing all the hashtags.
const findConsecutiveHashTagsAtStart = memoizedFunction((spring) => {
    let count = 0;

    // Count consecutive '#' characters from the start
    while (count < spring.length && spring[count] === '#') {
        count++;
    }

    // If there are no hastags, or if we can't conclusively form a group (? could potentially be a #) then no hashtags are found.
    if (count === 0 || spring[count] === '?')
        return ""

    // Return group of hashtags.
    return spring.substring(0, count);
});


// Counts the hashtags in the spring and returns that count
const countHashTags = memoizedFunction((spring, count = 0) => {
    // Base cases.
    if (spring[0] === '#')
        return count + 1;

    if (spring[0] !== '#')
        return count;


    // No base case.
    return countHashTags(spring.slice(1), count)
});


// Counts the possible combinations.
const findCombinations = memoizedFunction((spring, groupings) => {
    // Replace dots on both ends of the spring.
    spring = spring.replace(/^\.+|\.+$/, '');

    // Base cases.
    if (spring === '' && groupings.length === 0)
        return 1;

    if (spring === '' && groupings.length !== 0) 
        return 0
    
    if (groupings.length === 0 && spring.includes('#'))
        return 0;

    if (groupings.length === 0 && !spring.includes('#'))
        return 1;


    // Not a base case anymore from here on.
    let result = 0;
    
    // Check for damaged (fixed '#') section at the start of the row
    const consecutiveHashTags = findConsecutiveHashTagsAtStart(spring);

    if (consecutiveHashTags) {
        // If we walk up on the correct group of hashtags, continue, otherwise break the recursion early as the string doesn't comply with the groupings.
        return consecutiveHashTags.length === groupings[0] 
            ? result + findCombinations(spring.slice(groupings[0]), groupings.slice(1))
            : result;
    } 
    
    if (spring.includes('?')) {
        // If there is still room for # to be placed, replace the ? with #.
        if (countHashTags(spring) < groupings.reduce((a, b) => a + b)) {
            result += findCombinations(spring.replace('?', '#'), groupings);
        }

        // Always replace the dots.
        result += findCombinations(spring.replace('?', '.'), groupings);
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
             
        // Do the unfolding...
        spring = [spring, spring, spring, spring, spring].join('?');
        grouping = [...grouping, ...grouping, ...grouping, ...grouping, ...grouping];

        sum += findCombinations(spring, grouping);
    }

    // Return the sum.
    return sum;
}


main().then((sum) => {
    console.log('The sum = ' + sum);
});
