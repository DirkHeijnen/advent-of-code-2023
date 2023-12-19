const fs = require("fs");
const path = require("path");


const parseInput = (inputText) => {

    // Extract lines of the input file.
    const inputLines = inputText.split('\r\n').map(line => line.trim());

    // Find the empty line index
    const emptyLineIndex = inputLines.indexOf(inputLines.find((x => x === '')))

    // Extract workflows and the parts.
    const workflowLines = inputLines.slice(0, emptyLineIndex);

    // Makes arrays to store indivual values in
    const workflows = [];

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

    return workflows;
}


/**
 * When the workflow enters an accepted state it will return a range 
 * of the accepted part configurations.
 * 
 * Example:
 *      x -> [2006 ... 4000]
 *      m -> [2091 ... 4000]
 *      a -> [0001 ... 4000]
 *      s -> [0001 ... 4000]
 * 
 * In this class, left left hand side is marked as minX, minS etc.
 * The right hand side is marked as maxX, maxS etc.
 */
class PartRanges {

    constructor(minX, maxX, minM, maxM, minA, maxA, minS, maxS) {
        this.minX = minX;
        this.maxX = maxX;

        this.minM = minM;
        this.maxM = maxM;

        this.minA = minA;
        this.maxA = maxA;

        this.minS = minS;
        this.maxS = maxS;
    }

    /**
     * Calculates all possible states that this configuration can have.
     * 
     * @returns {Number} The possible states as a number
     */
    calculatePossbilities() {
        const x = this.maxX - this.minX + 1;
        const m = this.maxM - this.minM + 1;
        const a = this.maxA - this.minA + 1;
        const s = this.maxS - this.minS + 1;

        return x*m*a*s;
    }
}


/**
 * Contains a single result from a rule.
 * 
 * It contains the part ranges after the rule is executed and a possible next workflow name
 * if the rule had a match, in no-match scenarios this nextWorkflowName is undefined.
 */
class RuleResult {

    constructor(partRanges, nextWorkflowName) {
        this.partRanges = partRanges;
        this.nextWorkflowName = nextWorkflowName;
    }
}


/**
 * A rule defines a single operation to evaluate a category of a part.
 * 
 * Now given that we know that parts always have numbers between 1 (min) and 4000 (max) we can infer the amount of steps hit.
 * 
 * For example, given the input text"x<2005:one" we now that there are 2004 possible options that match and 1995 that don't.
 * 
 * The return of a rule is the amount of possbile options and it's next workflow name.
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
     * Takes an input PartRanges and return an two RuleResult objects.
     * Each rule result contains the AcceptedResult after the rule is applied to it and the name of the next workflow or undefined.
     * 
     * @param {PartRanges} inputResult The current result before the rule is applied to it.
     * @returns {RuleResult[]} Returns two rule results.
     */
    execute(inputPartRanges) {

        // Base case (There is no match)
        // Example:
        //      range:      1 - 100
        //      operator:   >
        //      value:      500
        // The full range is below our value so therefore no change happens and we return the result + undefined.
        switch(this.category) {
            case 'x': {
                if (!this.#hasMatch(inputPartRanges.minX, inputPartRanges.maxX)) {
                    return [new RuleResult(inputPartRanges, undefined)];
                }
                break;
            }
            case 'm': {
                if (!this.#hasMatch(inputPartRanges.minM, inputPartRanges.maxM)) {
                    return [new RuleResult(inputPartRanges, undefined)];
                }
                break;
            }
            case 'a': {
                if (!this.#hasMatch(inputPartRanges.minA, inputPartRanges.maxA)) {
                    return [new RuleResult(inputPartRanges, undefined)];
                }
                break;
            }
            case 's': {
                if (!this.#hasMatch(inputPartRanges.minS, inputPartRanges.maxS)) {
                    return [new RuleResult(inputPartRanges, undefined)];
                }
                break;
            }
        }

        // If we have a match, we calculte the 2 output rule results and return them.
        return this.#calculateNewResults(inputPartRanges)
    }

    /**
     * Takes the minimum and maximum value (the range) for the given category and
     * checks if the rule has a match.
     * 
     * @param {Number} minValue The minimum value for the category.
     * @param {Number} maxValue The maximum value for the category.
     * @returns {Boolean} True if the rule has a match, otherwise false.
     */
    #hasMatch(minValue, maxValue) {
        if (this.operator === '<') {
            return minValue < this.value && this.value < maxValue;
        }

        if (this.operator === '>') {
            return maxValue > this.value && this.value > minValue;
        }
    }

    /**
     * Given a matching input, returns 2 new ranges, one range that matches the rule and one range with the leftover.
     * 
     * @param {PartRanges} inputPartRanges The input part range
     * @returns {RuleResult[]} The 2 results we have.
     */
    #calculateNewResults(inputPartRanges) {
        // Stupid syntax because javascript assignment is by reference and we need a copy here...
        // This is basically saying:  outputResultWithMatch = inputResult
        const outputResultWithMatch = Object.assign(Object.create(Object.getPrototypeOf(inputPartRanges)), inputPartRanges);
        const outputResultWithoutMatch = Object.assign(Object.create(Object.getPrototypeOf(inputPartRanges)), inputPartRanges);

        // For X
        if (this.category === 'x') {
            if (this.operator === '<') {
                outputResultWithMatch.maxX = this.value - 1;
                outputResultWithoutMatch.minX = this.value;
            } else {
                outputResultWithMatch.minX = this.value + 1;
                outputResultWithoutMatch.maxX = this.value;
            }
        }

        // For M
        if (this.category === 'm') {
            if (this.operator === '<') {
                outputResultWithMatch.maxM = this.value - 1;
                outputResultWithoutMatch.minM = this.value;
            } else {
                outputResultWithMatch.minM = this.value + 1;
                outputResultWithoutMatch.maxM = this.value;
            }
        }

        // For A
        if (this.category === 'a') {
            if (this.operator === '<') {
                outputResultWithMatch.maxA = this.value - 1;
                outputResultWithoutMatch.minA = this.value;
            } else {
                outputResultWithMatch.minA = this.value + 1;
                outputResultWithoutMatch.maxA = this.value;
            }
        }

        // For S
        if (this.category === 's') {
            if (this.operator === '<') {
                outputResultWithMatch.maxS = this.value - 1;
                outputResultWithoutMatch.minS = this.value;
            } else {
                outputResultWithMatch.minS = this.value + 1;
                outputResultWithoutMatch.maxS = this.value;
            }
        }

        const ruleResultWithMatch = new RuleResult(outputResultWithMatch, this.nextWorkflow);
        const ruleResultWithoutMatch = new RuleResult(outputResultWithoutMatch, undefined);

        return [ruleResultWithMatch, ruleResultWithoutMatch];
    }
}


/**
 * A workflow contains a list of rules and orchestrates the path through that list.
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

}


class WorkflowRunner {

    constructor(workflows) {
        this.workflows = workflows;
    }

    execute(ruleResult) 
    {
        let inputPartRanges = ruleResult.partRanges;
        let nextWorkflowName = ruleResult.nextWorkflowName;

        // Base case (Rejected)
        if (nextWorkflowName === 'R') {
            return [];
        }

        // Base case (Accepted)
        if (nextWorkflowName === 'A') {
            return [ruleResult.partRanges];
        }

        // Store local results
        const currentResults = [];

        // Get the current workflow.
        const currentWorkflow = this.workflows.find(workflow => workflow.name === nextWorkflowName);

        for (let i = 0; i < currentWorkflow.rules.length; i++) {
            // Find the rule to execute and execute it.
            const ruleToExecute = currentWorkflow.rules[i];
            const outputResults = ruleToExecute.execute(inputPartRanges);

            // Get the matched an unmatched results.
            let matchedResult = outputResults.find(result => result.nextWorkflowName !== undefined);
            let unmatchedResult = outputResults.find(result => result.nextWorkflowName === undefined);

            // Override the input result for the next rule
            inputPartRanges = unmatchedResult.partRanges

            // We need to call another workflow.
            if (matchedResult) {
                const recursionResult = this.execute(new RuleResult(matchedResult.partRanges, matchedResult.nextWorkflowName));
                currentResults.push(...recursionResult);
            }

            // If we are on the final rule and have ran it, send it to the next workflow.
            if (i === currentWorkflow.rules.length - 1) {
                const recursionResult = this.execute(new RuleResult(unmatchedResult.partRanges, currentWorkflow.nextWorkflow));
                currentResults.push(...recursionResult);
            }
        }

        // All recursion is done
        return currentResults;
    }
} 


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Parse the input
    const workflows = parseInput(inputFileText);

    // Before we start the workflows, all possible ranges are accepted, the rules will boil that down.
    const basePartRanges = new PartRanges(
        1, 4000, // Range of X
        1, 4000, // Range of M
        1, 4000, // Range of A
        1, 4000  // Range of S
    )

    // Get the name of the workflow to start in.
    const baseWorkflowName = 'in';

    // Run the workflows, starting with the base setup.
    const workflowRunner = new WorkflowRunner(workflows);
    const acceptedResults = workflowRunner.execute(new RuleResult(basePartRanges, baseWorkflowName))

    // Calculate the solution.
    let solution = 0;

    for (let acceptedResult of acceptedResults) {
        solution += acceptedResult.calculatePossbilities();
    }

    return solution;
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
