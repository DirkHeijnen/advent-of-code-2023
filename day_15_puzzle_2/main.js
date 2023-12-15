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


class Lens {

    constructor(label, focalLength) {
        this.label = label;
        this.focalLength = focalLength;
    }
}


class Box {

    constructor(id) {
        this.id = id;
        this.lenses = [];
    }

    addLens(label, focalLength) {
        const lens = this.lenses.find((lens => lens.label === label));

        if (lens) {
            lens.focalLength = focalLength;
        } else {
            this.lenses.push(new Lens(label, focalLength));
        }
    }

    removeLens(label) {
        this.lenses = this.lenses.filter(lens => lens.label !== label);
    }

    getLensPower() {
        let lensPower = 0;

        for (let i = 0; i < this.lenses.length; i++) {
            const num1 = 1 + Number(this.id);
            const num2 = i + 1;
            const num3 = this.lenses[i].focalLength;

            lensPower += num1 * num2 * num3;
        }

        return lensPower;
    }
}


class Facility {

    constructor() {
        this.boxes = []; 
    }

    addLens(boxId, label, focalLength) {
        const box = this.boxes.find(box => box.id === boxId);

        if (box) {
            box.addLens(label, focalLength);
        } else {
            const newBox = new Box(boxId);
            newBox.addLens(label, focalLength);
            this.boxes.push(newBox);
        }
    }

    removeLens(boxId, label){
        const box = this.boxes.find(box => box.id === boxId);

        if (box) {
            box.removeLens(label);

            if (box.lenses.length === 0) {
                this.boxes = this.boxes.filter(x => x.id !== box.id);
            }
        }
    }

    getLensPower() {
        let lensPower = 0;

        for (let box of this.boxes) {
            lensPower += box.getLensPower();
        }

        return lensPower;
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create the facility.
    const facility = new Facility();

    // Instructions
    const instructions = [];

    // Fill the instruction list.
    for (let item of inputFileText.trim().split(',')) {
        if (item.includes('-')) {
            instructions.push({ id: item.split('-')[0], operation: '-', focalLength: '' });
        }
        if (item.includes('=')) {
            instructions.push({ id: item.split('=')[0], operation: '=', focalLength: item.split('=')[1] });
        }
    }

    // Process instructions
    for (let instruction of instructions) {
        const boxId = hash(instruction.id);

        if (instruction.operation === '=') {
            facility.addLens(boxId, instruction.id, instruction.focalLength);
        }

        if (instruction.operation === '-') {
            facility.removeLens(boxId, instruction.id);
        }
    }

    return facility.getLensPower();     
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
