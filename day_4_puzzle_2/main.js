const fs = require("fs");
const path = require("path");


class ScratchCard {

    constructor(id, numbers, winningNumbers) {
        this.id = id;
        this.numbers = numbers;
        this.winningNumbers = winningNumbers;
    }

    getAmountOfWinningNumbers = () => {
        let total = 0;

        for (let number of this.numbers) {
            if (this.winningNumbers.includes(number)) {
                total++;
            }
        }
        
        return total;
    }
}


class ScratchCardCollection {

    constructor() {
        this.scratchCards = [];
    }

    addScratchCard = (scratchCard) => {
        this.scratchCards.push(scratchCard);
    }

    getTotalCardCount = () => {
        let count = 0;
        let stack = [...this.scratchCards];

        while (stack.length > 0) {
            let scratchCard = stack.shift();
            count++;

            for (let i = 0; i < scratchCard.getAmountOfWinningNumbers(); i++) {
                let scratchCardToCopy = this.scratchCards[scratchCard.id + i];

                if (scratchCardToCopy) {
                    stack.unshift(scratchCardToCopy);
                }
            }
        }

        return count;
    }
}


const main = () => {
    // Path to the input files (Contains the values for the puzzle)
    const inputFilePath = path.join(__dirname, 'input.txt');

    // Get the content of the file as text, split into lines and store each line in an array.
    const cardStrings = fs.readFileSync(inputFilePath, 'utf-8').split('\n').map(x => x.trim());

    const scratchCardCollection = new ScratchCardCollection();

    for (let cardString of cardStrings) {
        let cardId = parseInt(cardString.split(':')[0].replace('Card ', ''));
        let cardNumbers = cardString.split(':')[1].split('|')[1].split(' ').map(x => x.trim()).map(x => parseInt(x)).filter(x => !Number.isNaN(x));
        let winningNumbers = cardString.split(':')[1].split('|')[0].split(' ').map(x => x.trim()).map(x => parseInt(x)).filter(x => !Number.isNaN(x));
    
        scratchCardCollection.addScratchCard(new ScratchCard(cardId, cardNumbers, winningNumbers));
    }

    console.log("The totals number of scratch cards = " + scratchCardCollection.getTotalCardCount()); 
}

main();