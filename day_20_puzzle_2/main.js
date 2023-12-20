const fs = require("fs");
const path = require("path");



const PulseType = {
    LOW: 'LOW',
    HIGH: 'HIGH'
}


const ModuleType = {
    BUTTON: 'BUTTON',
    BROADCASTER: 'BROADCASTER',
    FLIPFLOP: 'FLIPFLOP',
    CONJUNCTION: 'CONJUNCTION'
}


class Module {

    constructor(name, type, sources, destinations) {
        this.name = name;
        this.type = type;
        this.sources = sources;
        this.destinations = destinations

        this.setInitialState();
    }

    setInitialState() {
        this.state = { };
        
        if (this.type === ModuleType.FLIPFLOP) {
            this.state.power = 'OFF';
        }

        if (this.type === ModuleType.CONJUNCTION) {
            for (let source of this.sources) {
                this.state[source] = PulseType.LOW;
            }
        }

        if (this.type === ModuleType.BROADCASTER) {
            this.state.received = undefined;
        }
    }

    updateState(source, pulse) {
        if (this.type === ModuleType.FLIPFLOP) {
            if (pulse === PulseType.LOW) {
                this.state.power = this.state.power === 'ON' ? 'OFF': 'ON';
                this.state.ignore = false;
            } else {
                this.state.ignore = true;
            }
        }

        if (this.type === ModuleType.CONJUNCTION) {
            this.state[source] = pulse;
        }

        if (this.type === ModuleType.BROADCASTER) {
            this.state.received = pulse;
        }
    }

    getSignalsToSend() {
        if (this.type === ModuleType.FLIPFLOP) {
            if (this.state.ignore) {
                return null;
            }
            return { 
                source: this.name,
                destinations: this.destinations,  
                signal: this.state.power === 'ON' ? PulseType.HIGH : PulseType.LOW
            }
        }

        if (this.type === ModuleType.CONJUNCTION) {
            let pulseToSend = PulseType.LOW;

            for (let key of Object.keys(this.state)) {
                if (this.state[key] === PulseType.LOW) {
                    pulseToSend = PulseType.HIGH;
                }
            }

            return {
                source: this.name,
                destinations: this.destinations,  
                signal: pulseToSend
            }
        }

        if (this.type === ModuleType.BUTTON) {
            return {
                source: this.name,
                destinations: this.destinations,  
                signal: PulseType.LOW
            }
        }

        if (this.type === ModuleType.BROADCASTER) {
            return {
                source: this.name,
                destinations: this.destinations,  
                signal: this.state.received
            }
        }
    }

}


class StateMachine {

    constructor(modules) {
        this.modules = modules;
        this.queue = [];

        this.buttonPresses = 0;
        this.conjuctionModuleForRx = undefined;
        this.modulesToCycleCheck = [];
    }

    getModuleByName(name) {
        return this.modules.find(module => module.name === name);
    }

    pressButton() {
        if (this.queue.length !== 0) {
            throw new Error("Cant press the button when the modules are still processing");
        }

        // Increment the button presses.
        this.buttonPresses++;

        // Find the button module and get the signals.
        const buttonModule = this.getModuleByName('aptly');
        const signalsToSend = buttonModule.getSignalsToSend();

        // Update the queue
        for (let destination of signalsToSend.destinations) {
            this.queue.push({ source: signalsToSend.source, destination: destination, pulse: signalsToSend.signal});
        }
    }

    processQueue() {
        if (this.queue.length === 0) {
            throw new Error("You forgot to push the button");
        }

        while (this.queue.length !== 0) {
            // Get signal to process
            const signal = this.queue.shift();
    
            // Find the module that must handle the signal.
            const module = this.getModuleByName(signal.destination);

            // If the module is not found (unnamed module) then continue.
            if (!module) {

                // Find the conjuction parent of 'rx' (Only need to find this once)
                if (signal.destination === 'rx' && this.modulesToCycleCheck.length === 0) {

                    // Find the conjunction that leads to 'rx'.
                    this.conjuctionModuleForRx = this.getModuleByName(signal.source);

                    // Find all the sources of the conjuctions that lead up to 'rx'
                    for (let source of this.conjuctionModuleForRx.sources) {
                        this.modulesToCycleCheck.push({
                            module: this.getModuleByName(source),
                            amountOfPresses: 0,
                            satisfied: false,
                        })
                    }
                }
                
                // Don't process unnamed modules further.
                continue;
            }

            // Check if we are sending a HIGH pulse signal to the conjuction that ends up at RX.
            if (this.conjuctionModuleForRx && signal.destination === this.conjuctionModuleForRx.name && signal.pulse === PulseType.HIGH) {
                // Get the module that is sending to the the conjuction and mark it as satisfied.
                let module = this.modulesToCycleCheck.find(cycle => cycle.module.name === signal.source);

                // If we already found the high pulse for this module, we don't need to record it anymore.
                if (!module.satisfied) {
                    module.amountOfPresses = this.buttonPresses;
                    module.satisfied = true;
                }
            }

            // Handle the signal
            module.updateState(signal.source, signal.pulse);

            // Get the new signal to send
            const signalsToSend = module.getSignalsToSend();

            if (signalsToSend === null) {
                continue;
            }
            
            // Add new signals to the queue.
            for (let destination of signalsToSend.destinations) {
                this.queue.push({ source: signalsToSend.source, destination: destination, pulse: signalsToSend.signal});
            }
        }
    }
}


const parseInput = (inputFileText) => {

    const lines = inputFileText.split('\r\n').map(line => line.trim());

    // Temp modules contains modules without the source, real contains them with sources.
    const tempModules = [];
    const realModules = [];

    // Find name, type and destination
    for (let line of lines) {
        let name = undefined;
        let type = undefined;

        const nameAndType = line.split(' ')[0];

        if (nameAndType === 'broadcaster') {
            name = 'broadcaster',
            type = ModuleType.BROADCASTER;
        }

        if (nameAndType[0] === '%') {
            name = nameAndType.slice(1);
            type = ModuleType.FLIPFLOP;
        }

        if (nameAndType[0] === '&') {
            name = nameAndType.slice(1);
            type = ModuleType.CONJUNCTION;
        }

        // Find destinations.
        const destinations = line.split('->')[1].trim().split(',').map(x => x.trim());
        
        // Add a temporary module instance (We still need to find source.)
        tempModules.push(new Module(name, type, [], destinations));
    }

    // Find sources and create the actual real modules (complete instances)
    for (let tempModule1 of tempModules) {
        let name = tempModule1.name;
        let type = tempModule1.type;
        let sources = [];
        let destinations = tempModule1.destinations;

        for (let tempModule2 of tempModules) {
            // Don't check the same entry
            if (tempModule1.name === tempModule2.name) {
                continue;
            }

            // If the other module contains the current module as a destination
            // Add the other module as a source for the current module.
            if (tempModule2.destinations.find(dest => dest === tempModule1.name)) {
                sources.push(tempModule2.name);
            }
        }

        realModules.push(new Module(name, type, sources, destinations));
    }

    return realModules;
}


// Copy and pasted again from internet...
const gcd = (a, b) => b == 0 ? a : gcd(b, a % b);
const lcm = (a, b) => a / gcd(a, b) * b;
const lcmAll = arr => arr.reduce(lcm, 1);


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Hard code the button (not delivered in the input file).
    const buttonModule = new Module('aptly', ModuleType.BUTTON, [], ['broadcaster']);
    
    // Fetch the modules.
    const modules = [buttonModule, ...parseInput(inputFileText)];

    // Create the state machine
    const stateMachine = new StateMachine(modules);

    while (stateMachine.modulesToCycleCheck.length == 0 || !stateMachine.modulesToCycleCheck.every(check => check.satisfied)) {
        stateMachine.pressButton();
        stateMachine.processQueue();
    }

    // Get the numbers from LCM.
    const lcmNumbers = [];

    for (let cycleModule of stateMachine.modulesToCycleCheck) {
        lcmNumbers.push(cycleModule.amountOfPresses);
    }

    // Return the solution.
    return lcmAll(lcmNumbers);
}


main().then(solution => {
    console.log(`The solution is ${solution}`);
});
