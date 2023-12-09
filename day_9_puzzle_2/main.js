const fs = require("fs");
const path = require("path");


class SensorDevice {

    constructor(text) {
        this.readings = [];

        const lines = text.split("\r\n").map((line) => line.trim()).map(line => line.split(" "));

        for (let line of lines) {
            let values = line.map(value => parseInt(value));
            this.readings.push(new SensorReading(values));
        }
    }
}


class SensorReading {
    
    constructor(values) {
        this.values = values;
    }

    getFirstValue() {
        return this.values[0];
    }

    getLastValue() {
        return this.values[this.values.length - 1];
    }

    extrapolateForward() {
        let sequences = this.#calculateSequences();

        // Run backwards through the sequences.
        for (let i = sequences.length - 1; i >= 0; i--) {
            let currentSequenceLastValue = sequences[i][sequences[i].length - 1];
            let previousSequenceLastValue = 0;

            // If not at the end of the sequences, take the last value from the previous sequence.
            if (i !== sequences.length - 1) {
                let previousSequence = sequences[i + 1]
                previousSequenceLastValue = previousSequence[previousSequence.length - 1];
            }

            // Extend the sequence with one number.
            let valueToAdd = currentSequenceLastValue + previousSequenceLastValue;
            sequences[i].push(valueToAdd);
        }

        // Add the new value.
        const valueToAdd = sequences[0][sequences[0].length - 1]
        const lastValue = this.values[this.values.length - 1];
        this.values.push(lastValue + valueToAdd);
    }

    extrapolateBackwards() {
        let sequences = this.#calculateSequences();

        // Run backwards through the sequences.
        for (let i = sequences.length - 1; i >= 0; i--) {
            let currentSequenceFirstValue = sequences[i][0];
            let previousSequenceFirstValue = 0;

            // If not at the end of the sequences, take the first value from the previous sequence.
            if (i !== sequences.length - 1) {
                let previousSequence = sequences[i + 1]
                previousSequenceFirstValue = previousSequence[0];
            }

            // Add to the front of the sequence with one number.
            let valueToAdd = currentSequenceFirstValue - previousSequenceFirstValue;
            sequences[i].unshift(valueToAdd);
        }

        // Add the new value to the front.
        const valueToSubtract = sequences[0][0]
        const lastValue = this.values[0];
        this.values.unshift(lastValue - valueToSubtract);
    }

    #calculateSequences() {
        const sequences = [this.#calculateSequence(this.values)];

        while (!sequences[sequences.length - 1].every((x) => x === 0)) {
            sequences.push(this.#calculateSequence(sequences[sequences.length - 1]));
        }

        return sequences;
    }

    #calculateSequence(values) {
        const sequence = [];

        for (let i = 0; i < values.length - 1; i++) {
            sequence.push(values[i + 1] - values[i]);
        }

        return sequence;
    }
}


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the sensor device.
    const sensorDevice = new SensorDevice(inputFileText);

    // Do the extrapolation and calculate the sum.
    let sum = 0; 

    for (let reading of sensorDevice.readings) {
        reading.extrapolateBackwards();
        sum += reading.getFirstValue();
    }

    console.log("The solution is: " + sum);
}


main();
