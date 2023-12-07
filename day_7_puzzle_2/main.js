const fs = require("fs");
const path = require("path");


// Enum for easy access to hand types, higher number is stronger hand.
const HandTypes = {
    FIVE_OF_A_KIND: 6,
    FOUR_OF_A_KIND: 5,
    FULL_HOUSE: 4,
    THREE_OF_A_KIND: 3,
    TWO_PAIR: 2,
    ONE_PAIR: 1,
    HIGH_CARD: 0
}


// Card can be a string character in the set of [2, 3, 4, 5, 6, 7, 8, 9, T, J, Q, K. A]
const getCardStrength = (card) => {
    switch (card) {
        case "J": return 1;
        case "2": return 2;
        case "3": return 3;	
        case "4": return 4;
        case "5": return 5;	
        case "6": return 6;
        case "7": return 7;
        case "8": return 8;
        case "9": return 9;
        case "T": return 10;
        case "Q": return 11;
        case "K": return 12;
        case "A": return 13;
        default: return 0;
    }
}


// Get a hand (set of 5 cards) and calculates the handtype.
const getHandStrength = (cards) => {
    // Create map of card values and the array of jokers.
    const mapOfCardOccurrences = new Map();
    const jokers = [];
    
    for (let card of cards) {
        // If the cards is a J then add it as a joker in the joker array.
        if (card === 'J') {
            jokers.push(card);
            continue;
        }

        if (!mapOfCardOccurrences.has(card)) {
            mapOfCardOccurrences.set(card, 0);
        }

        currentValue = mapOfCardOccurrences.get(card);
        mapOfCardOccurrences.set(card, currentValue + 1);
    }

    // Sort map by value in descending order
    const sortedMapOfCards = new Map([...mapOfCardOccurrences.entries()].sort((a, b) => b[1] - a[1]));


    // If there are 5 jokers.
    if (jokers.length === 5) {
        return HandTypes.FIVE_OF_A_KIND;
    }

    // If there are 4 jokers.
    if (jokers.length === 4) {
        return HandTypes.FIVE_OF_A_KIND;
    }

    // If there are 3 jokes.
    if (jokers.length === 3) {
        if (mapOfCardOccurrences.size === 1) {
            return HandTypes.FIVE_OF_A_KIND;
        }
        if (mapOfCardOccurrences.size === 2) {
            return HandTypes.FOUR_OF_A_KIND;
        }
    }

    // If there are 2 jokes.
    if (jokers.length === 2) {
        if (mapOfCardOccurrences.size === 1) {
            return HandTypes.FIVE_OF_A_KIND;
        }
        if (mapOfCardOccurrences.size === 2) {
            return HandTypes.FOUR_OF_A_KIND;
        }
        if (mapOfCardOccurrences.size === 3) {
            return HandTypes.THREE_OF_A_KIND;
        }
    }

    // If there is 1 joker.
    if (jokers.length === 1) {
        if (mapOfCardOccurrences.size === 1) {
            return HandTypes.FIVE_OF_A_KIND;
        }

        if (mapOfCardOccurrences.size === 2) {
            // Either (Joker + 3K + 1Q = FOUR_OF_A_KIND) or (Joker + 2K + 2Q = FULL_HOUSE).
            if (Array.from(sortedMapOfCards)[0][1] === 3) {
                return HandTypes.FOUR_OF_A_KIND;
            }
            return HandTypes.FULL_HOUSE;
        }

        if (mapOfCardOccurrences.size === 3) {
            return HandTypes.THREE_OF_A_KIND;
        }

        if (mapOfCardOccurrences.size === 4) {
            return HandTypes.ONE_PAIR;
        }
    }

    // Check for five of a kind.
    if (Array.from(sortedMapOfCards)[0][1] == 5) {
        return HandTypes.FIVE_OF_A_KIND;
    }

    // Check for four of a kind.
    if (Array.from(sortedMapOfCards)[0][1] == 4) {
        return HandTypes.FOUR_OF_A_KIND;
    }

    // Check for full house
    if (Array.from(sortedMapOfCards)[0][1] == 3 && Array.from(sortedMapOfCards)[1][1] == 2) {
        return HandTypes.FULL_HOUSE;
    }

    // Check for three of a kind.
    if (Array.from(sortedMapOfCards)[0][1] == 3 && Array.from(sortedMapOfCards)[1][1] == 1) {
        return HandTypes.THREE_OF_A_KIND;
    }

    // Check for two pair.
    if (Array.from(sortedMapOfCards)[0][1] == 2 && Array.from(sortedMapOfCards)[1][1] == 2) {
        return HandTypes.TWO_PAIR;
    }

    // Check for one pair.
    if (Array.from(sortedMapOfCards)[0][1] == 2 && Array.from(sortedMapOfCards)[1][1] == 1) {
        return HandTypes.ONE_PAIR;
    }

    return HandTypes.HIGH_CARD;
}


// Comparison function to compare hands against each other.
const compareHandStrength = (hand1, hand2) => {
    handStrengthHand1 = getHandStrength(hand1.cards);
    handStrengthHand2 = getHandStrength(hand2.cards);

    if (handStrengthHand1 > handStrengthHand2) {
        return -1; 
    } 
    
    if (handStrengthHand1 < handStrengthHand2) {
        return 1;
    }

    return 0;
}


// Comparison function to compare cards against each other.
const compareCardStrength = (hand1, hand2) => {
    for (let i = 0; i < hand1.cards.length; i++) {
        cardStrenghtHand1 = getCardStrength(hand1.cards[i]);
        cardStrenghtHand2 = getCardStrength(hand2.cards[i]);

        if (cardStrenghtHand1 > cardStrenghtHand2) {
            return -1; 
        } 
        
        if (cardStrenghtHand1 < cardStrenghtHand2) {
            return 1;
        }
    }

    return 0; 
}


class CamelCardGame {

    constructor(cards, bid) {
        this.cards = cards;
        this.bid = bid;
    }
}


const main = () => {
    // Read the input file.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');


    // Create the list of camel card games.
    const games = inputFileText.split('\r\n').map((line) => {
        line = line.trim();
        return new CamelCardGame(line.split(' ')[0], line.split(' ')[1]);
    });


    // Sort the games by their hand strength first.
    const gamesSortedByHandStrength = [...games.sort(compareHandStrength)];

    // Create the list of games sorted by both hand and card strength.
    const gamesSortedByHandAndCardStrength = [];
    
    // Split games in groups of hand strength, so the sorting is possible in subsets..
    // For example [ 
    //    [...FIVE_OF_A_KIND_GAMES], 
    //    [...FOUR_OF_A_KIND_GAMES], 
    //    ...
    // ],
    let handStrengthGroups = [];
    let handStrengthGroup = [];

    while (games.length > 0) {
        // Get the first game.
        let currentGame = games.shift();

        if (handStrengthGroup.length === 0) {
            handStrengthGroup.push(currentGame);
            continue;
        }

        if (getHandStrength(currentGame.cards) === getHandStrength(handStrengthGroup[0].cards)) {
            handStrengthGroup.push(currentGame);
        } else {
            // Add current game group to game groups.
            handStrengthGroups.push(handStrengthGroup);
            handStrengthGroup = [currentGame];
        }

        // Final record must also be added.
        if (games.length === 0) {
            handStrengthGroups.push(handStrengthGroup);
        }
    }

    // For each group, sort the cards and add them to the gamesSortedByHandAndCardStrength
    let iterationNumber = 0;
    for (let handStrengthGroup of handStrengthGroups) {
        handStrengthGroup.sort(compareCardStrength);

        for (let game of handStrengthGroup) {
            gamesSortedByHandAndCardStrength.push({ 
                cards: game.cards, 
                bid: game.bid, 
                rank: gamesSortedByHandStrength.length - iterationNumber
            });
            iterationNumber++;
        }
    }

    // Get the sum:
    let sum = 0;
    for (let game of gamesSortedByHandAndCardStrength) {
        sum += (game.bid * game.rank);
    }
    console.log("The solution is: " + sum);
}

main();
