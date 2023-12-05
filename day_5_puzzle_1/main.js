const fs = require("fs");
const path = require("path");


class TransformationMap {

    constructor() {
        this.entries = [];
    }

    addEntry(destinationRangeStart, sourceRangeStart, rangeLength) {
        this.entries.push({
            sourceRangeStart: sourceRangeStart,
            destinationRangeStart: destinationRangeStart,
            rangeLength: rangeLength
        });
    }

    getDestination(source) {
        for (let entry of this.entries) {

            const sourceRangeStart = entry.sourceRangeStart;
            const sourceRangeEnd = entry.sourceRangeStart + (entry.rangeLength - 1);

            if (source >= sourceRangeStart && source <= sourceRangeEnd) {

                // Get the difference between the input source and the source range start.
                let difference = Math.abs(source - entry.sourceRangeStart);
            
                const destination = entry.destinationRangeStart + difference;
                return destination;
            }
        }

        return source;
    }
}


class PipelineStep {

    constructor(map) {
        this.map = map;
    }

    run(input) {
        return this.map.getDestination(input);
    }
}


class Pipeline {

    constructor() {
        this.steps = [];
    }

    addStep(step) {
        this.steps.push(step);
    }

    run(input) {
        let previousStepOutput = input;

        for (let step of this.steps) {
            previousStepOutput = step.run(previousStepOutput);
        }

        return previousStepOutput;
    }
}


class Almanac {

    constructor(text) {
        this.seeds = [];
        this.transformationMaps = [];

        // 1. Take all the lines.
        let textLines = text.split('\r\n');

        // 2. Extract the seeds
        this.seeds = textLines[0].replace('seeds: ', '').split(' ').map(x => parseInt(x));

        // 3. Remove the first two lines, they are the seed line and an empty line.
        textLines.shift();
        textLines.shift();

        // 4. Split the textLines into subarrays, each forming a transformation map.
        let transformationMap = new TransformationMap();

        for (let i = 0; i < textLines.length; i++) {
            // If the line is empty, complete the current map and move on.
            if (textLines[i] === '') {
                this.transformationMaps.push(transformationMap)
                transformationMap = new TransformationMap();
                continue;
            }

            // Otherwise, check if the line contains the text 'map', if that is the case, skip the line.
            if (textLines[i].includes('map')) {
                continue;
            }

            // The line contains an transformation map entry.
            let transformationMapEntryArray = textLines[i].split(' ').map(x => parseInt(x));
            transformationMap.addEntry(
                transformationMapEntryArray[0], 
                transformationMapEntryArray[1], 
                transformationMapEntryArray[2]
            );

            // If it's the final row of the final transformation map, the loop won't be executed anymore.
            // This means that we need to appennd the final transformation map this way.
            if (i === textLines.length - 1) {
                this.transformationMaps.push(transformationMap)
            }
        }
    }
}


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');


    // Parse the Almanac.
    const almanac = new Almanac(inputFileText);

    // Create the pipeline.
    const pipeline = new Pipeline();

    // For each map in the almanac, add a pipeline step.
    for (let map of almanac.transformationMaps) {
        pipeline.addStep(new PipelineStep(map));
    }

    // Define all the locations per seed.
    const locations = [];
    for (let seed of almanac.seeds) {
        locations.push(pipeline.run(seed));
    }

    // Sort the seeds in ascending order.
    locations.sort((a, b) => a - b);

    // Log the answer.
    console.log("The closest location = " + locations[0]);
}


main();
