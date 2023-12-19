const fs = require("fs");
const path = require("path");


const parseInput = (inputText) => {

    // Extract lines of the input file.
    const inputLines = inputText.split('\r\n').map(line => line.trim());

    // Find the empty line index
    const emptyLineIndex = inputLines.indexOf(inputLines.find((x => x === '')))

    // Extract workflows and the parts.
    const workflowLines = inputLines.slice(0, emptyLineIndex);
    const partLines = inputLines.slice(emptyLineIndex + 1, inputLines.length);


    // Makes arrays to store indivual values in
    const workflows = [];
    const parts = [];


    // Handle workflow lines
    for (let workflowLine of workflowLines) {
        
        // Get the name of the workflow.
        const name = workflowLine.split('{')[0];

        // Store the rules.
        const rules = [];

        // Store the name of the next workflow for when no rules match
        let nextWorkflow = undefined;

        // Iterate over the rules.
        for (let ruleString of workflowLine.split('{')[1].replace('}', '').split(',')) {
            
            // If the item is not a rule (then it's the last bit that contains the next workflow name)
            if (ruleString.indexOf(':') === -1) {
                nextWorkflow = ruleString;
                continue;
            }

            // Otherwise we have a rule.
            const category = ruleString[0];
            const operator = ruleString[1];
            const value = ruleString.split(operator)[1].split(':')[0];
            const nextWorkFlowOfRule = ruleString.split(':')[1];

            // Add the rule
            rules.push(new Rule(category, operator, value, nextWorkFlowOfRule));
        }
        workflows.push(new Workflow(name, rules, nextWorkflow));
    }


    // Handle part lines
    for (let partLine of partLines) {
        const part = new Part();

        // Get the categories from the text.
        const categories = partLine.replace('{', '').replace('}', '').split(',');

        for (let category of categories) {
            const categoryLetter = category.split('=')[0];
            const categoryValue = category.split('=')[1];

            switch (categoryLetter) {
                case 'x': part.x = parseInt(categoryValue); break;
                case 'm': part.m = parseInt(categoryValue); break;
                case 'a': part.a = parseInt(categoryValue); break;
                case 's': part.s = parseInt(categoryValue); break;
            }
        }

        parts.push(part);
    }

    return { workflows, parts };
}


/**
 * A part is a single machine part that the elves picked up from the heap of machine parts.
 * 
 * Each part has a value across 4 categories [x, m, a, s].
 */
class Part {

    /**
     * Initialized a part with default values of 0 on all categories.
     */
    constructor() {
        this.x = 0;
        this.m = 0;
        this.a = 0;
        this.s = 0;
    }
}


/**
 * A rule defines a single operation to evaluate a category of a part.
 * 
 * For example, given the input text "x<2005:one" will simply evaluate if the input part has an x value less than 2005 or not.
 *      If the x category has a value lower than 2005 it will return one.
 *      If the x category has a value higher or equal than 2005 it will return undefined.
 */
class Rule {

    /**
     * Creates a new rule instance.
     * 
     * @param {String} category The category of the rule (within the set of ['x', 'm', 'a', 's'])
     * @param {String} operator The operator for comparison (within the set of ['<', '>'])
     * @param {Number} value The number to compare with.
     * @param {String} nextWorkflow The name of the workflow to check next when the rule find a match.
     */
    constructor(category, operator, value, nextWorkflow) {
        this.category = category;
        this.operator = operator;
        this.value = parseInt(value);
        this.nextWorkflow = nextWorkflow;
    }


    /**
     * Given a complete part, will check for a match with this rule.
     * 
     * @param {Part} part An instance of Path to check against this rule.
     * @returns {String | undefined} Returns a the name of the next workflow if a match is made, otherwise undefined.
     */
    match(part) {
        switch (this.category) {    
            case 'x': return (this.#matchValue(part.x)) ? this.nextWorkflow : undefined;
            case 'm': return (this.#matchValue(part.m)) ? this.nextWorkflow : undefined;
            case 'a': return (this.#matchValue(part.a)) ? this.nextWorkflow : undefined;
            case 's': return (this.#matchValue(part.s)) ? this.nextWorkflow : undefined;
        }

        return undefined;
    }

    /**
     * This private method checks if the rule has a match given the category value of the part.
     * 
     * @param {String} categoryValue The value to check for.
     * @returns {Boolean} Returns true if the rule is matched, otherwise false. 
     */
    #matchValue(categoryValue) {
        if (this.operator === '<' && categoryValue < this.value) {
            return true;
        }
        if (this.operator === '>' && categoryValue > this.value) {
            return true;
        }

        return false;
    }
}


/**
 * A workflow contains a list of rules and directs a given part through those rules.
 */
class Workflow {

    /**
     * Creates a new instance of the workflow.
     * 
     * @param {String} name The name of the workflow.
     * @param {Rule[]} rules An array of rule instances.
     * @param {String} nextWorkflow The name of the workflow to go to when no rules match.
     */
    constructor(name, rules, nextWorkflow) {
        this.name = name;
        this.rules = rules;
        this.nextWorkflow = nextWorkflow;
    }

    /**
     * Executes the workflow and return the next workflow name as a result.
     * 
     * @param {Part} part The part to run the workflow against.
     * @returns {String} The name of the workflow to visit next.
     */
    execute(part) {
        // Loop over all rules of this workflow and if a rule matches we return it's result.
        for (let rule of this.rules) {
            const matchResult = rule.match(part);

            if (matchResult !== undefined) {
                return matchResult;
            }
        }

        // If no matches, return the default next workflow name
        return this.nextWorkflow;
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Parse the input
    const { workflows, parts } = parseInput(inputFileText);

    // Create a store for all accepted parts and all rejected parts.
    const acceptedParts = [];
    const rejectedParts = [];
    
    // Execute workflows for each part.
    for (let part of parts) {

        // The first workflow is always the one with the name 'in'.
        let nextWorkflow = workflows.find(workflow => workflow.name === 'in');
        let workflowResult = undefined;

        // As long as the workflow result is not Accepted (A) or Rejected (R) then keep moving to the next workflow.
        while (true) {
            // Execute the workflow.
            workflowResult = nextWorkflow.execute(part);

            // Check if this workflow's result is Accepted or Rejected, if so exit the loop.
            if (workflowResult === 'A' || workflowResult === 'R') {
                break;
            };

            // The result is the name of the next workflow, so update the next workflow.
            nextWorkflow = workflows.find(workflow => workflow.name === workflowResult);
        }


        // Add the part to the list it belongs to.
        if (workflowResult === 'A') acceptedParts.push(part);
        if (workflowResult === 'R') rejectedParts.push(part);
    }

    // Calculate the solution.
    let solution = 0;

    for (let acceptedPart of acceptedParts) {
        solution += acceptedPart.x;
        solution += acceptedPart.m;
        solution += acceptedPart.a;
        solution += acceptedPart.s;
    }

    return solution;
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
