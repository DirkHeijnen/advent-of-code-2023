const fs = require("fs");
const path = require("path");


/**
 * Defines an enum for a given direction to prevent magic strings.
 */
const Direction = {
    "UP": "UP",
    "LEFT": "LEFT",
    "RIGHT": "RIGHT",
    "DOWN": "DOWN"
}


/**
 * Defines the content of a vertex within a grid.
 */
class Node {

    /**
     * Create the node.
     * 
     * @param {number} row The row position of the node on the grid.
     * @param {number} column The column position of the node on the grid.
     * @param {number} cityBlockNumber The number of the city block (heat loss).
     */
    constructor(row, column, cityBlockNumber) {
        this.row = Number(row);
        this.column = Number(column);
        this.cityBlockNumber = Number(cityBlockNumber);
    }
}


/**
 * Defines an edge between two vertices in a graph.
 */
class Edge {

    /**
     * Creates the edge between two vertices.
     * 
     * @param {Vertex} source The source vertex.
     * @param {Vertex} destination The destination vertex.
     * @param {number} cost The cost to travel from the source to the destination.
     */
    constructor(source, destination, cost) {
        this.source = source;
        this.destination = destination;
        this.cost = parseInt(cost);
    }

    /**
     * Given that the source and destination are both vertices, and each vertex contains a node with x/y,
     * we could infer the direction that the edge moves in.
     * 
     * @returns {Direction} The direction that the edge moves in.
     */
    getDirection() {
        // Get the source and destination nodes from the vertices.
        const sourceNode = this.source.node;
        const destinationNode = this.destination.node;

        // When on the same row, the edge goes either left or right
        if (sourceNode.row === destinationNode.row) {
            return sourceNode.column < destinationNode.column ? Direction.RIGHT : Direction.LEFT;
        }

        // When on the same row, the edge goes either up or down.
        if (sourceNode.column === destinationNode.column) {
            return sourceNode.row < destinationNode.row ? Direction.DOWN : Direction.UP;
        }
    }
}


/**
 * Defines a vertex in the graph, the vertex contains a node inside of it.
 * Besides the node, the vertex contains a list of edges it has to other vertices.
 */
class Vertex {

    /**
     * Creates a vertex in the graph, the vertex has a node.
     * 
     * @param {Node} node The node within the vertex.
     */
    constructor(node) {
        this.node = node;
        this.edges = [];
    }

    /**
     * Adds an edge to the vertex.
     * 
     * @param {Vertex} destination The destination vertex.
     * @param {number} cost The cost to travel from this vertex to the other.
     */
    addEdge(destination, cost) {
        this.edges.push(new Edge(this, destination, cost));
    }
}


/**
 * A graph is a data structure that holds all the vertices with their edges together.
 */
class Graph {

    /**
     * Creates the graph with an empty map of vertices.
     * 
     * The key of the map is the node as a JSON string.
     * The value is the vertex, which contains the node.
     */
    constructor() {
        this.vertices = new Map();
    }

    /**
     * Gets a vertex given the node that should be inside of it.
     * 
     * @param {Node} node The node inside the Vertex,
     * @returns {Vertex | undefined}  The vertex when found, otherwise false.
     */
    getVertex(node) {
        const key = JSON.stringify(node);

        if (this.vertices.has(key)) {
            return this.vertices.get(key);
        }

        return undefined;
    }

    /**
     * Adds a new vertex to the grid.
     * 
     * @param {Node} node The node to be placed inside the vertex. 
     */
    addVertex(node) {
        // Create the vertex itself.
        const vertex = new Vertex(node);

        // Set the key for the map accessor (Which is the node as a JSON string).
        const key = JSON.stringify(node);

        // Set the vertex.
        this.vertices.set(key, vertex);
    }

    /**
     * Adds an edge to the graph between 2 vertices.
     * 
     * @param {Node} source The node in the source vertex.
     * @param {Node} destination The node in the destination vertex.
     * @param {Number} cost The cost for the travelling between the vertices.
     */
    addEdge(source, destination, cost) {
        // Create the source and destination keys
        const sourceKey = JSON.stringify(source);
        const destinationKey = JSON.stringify(destination);

        // If one of the vertices doesn't exists, we cannot add the edge.
        if (!this.vertices.has(sourceKey) || !this.vertices.has(destinationKey)) {
            throw new Error("You tried to set an edge between 1 or 2 non existing vertices");
        }

        // Get source and destination vertices.
        const sourceVertex = this.vertices.get(sourceKey);
        const destinationVertex = this.vertices.get(destinationKey);

        // Add the edge
        sourceVertex.addEdge(destinationVertex, cost);
    }

    /**
     * Prints the contents of the graph to the console.
     */
    print() {
        let string = 'Graph Start\n';
        string += '--------------\n'

        for (let [_, vertex] of this.vertices) {
            string += `Vertex ${JSON.stringify(vertex.node, null, 2).replaceAll('\n', '')} \n`;

            for (let edge of vertex.edges) {
                string += `    Edge ${JSON.stringify( { ...edge.destination.node, cost: edge.cost, direction: edge.getDirection() }, null, 2).replaceAll('\n', '')} \n`;
            }
        }

        string += '--------------\n'
        string += 'Graph End'
        console.log(string);
    }
}


/**
 * A factory class for creating a graph based on the input text given by AoC.
 */
class GraphFactory {

    /**
     * Creates the graph.
     * 
     * @param {String} inputText The input text of AoC.
     * @returns {Graph} A fully filled graph with all vertices and edges.
     */
    static create(inputText) {
        // Create the graph
        const graph = new Graph();

        // Parse input
        const lines = inputText.split('\r\n').map(x => x.trim());

        // Add the vertices to the graph.
        for (let row = 0; row < lines.length; row++) {
            for (let column = 0; column < lines[row].length; column++) {
                const node = new Node(row, column, lines[row][column]);
                graph.addVertex(node);
            }
        }

        // Add the edges between the vertices of the graph.
        for (let row = 0; row < lines.length; row++) {
            for (let column = 0; column < lines[row].length; column++) {

                // Get the node at the current row/column.
                const node = new Node(row, column, lines[row][column]);

                // Find neighbouring nodes (make them undefined is row/column is out-of-bounds).
                const aboveNode = ((row - 1) < 0) ? undefined : new Node(row - 1, column, lines[row - 1][column]);
                const bottomNode = ((row + 1) > lines.length - 1) ? undefined : new Node(row + 1, column, lines[row + 1][column]);
                const leftNode = ((column - 1) < 0) ? undefined : new Node(row, column - 1, lines[row][column - 1]);
                const rightNode = ((column + 1) > lines[row].length - 1) ? undefined : new Node(row, column + 1, lines[row][column + 1]);

                // For every node that is not out of bound, add an edge from the current node the the neighbouring node.
                if (aboveNode) graph.addEdge(node, aboveNode, aboveNode.cityBlockNumber);
                if (leftNode) graph.addEdge(node, leftNode, leftNode.cityBlockNumber);
                if (rightNode) graph.addEdge(node, rightNode, rightNode.cityBlockNumber);
                if (bottomNode) graph.addEdge(node, bottomNode, bottomNode.cityBlockNumber);
            }
        }

        // Return the filled graph
        return graph;
    }
}


/**
 * A wrapper around the Javascript Map object that allows classes as keys
 * and uses the JSON comparison between the classes for comparison.
 */
class ObjectMap {

    /**
     * Create a new ObjectMap with a Javascript Map inside.
     */
    constructor() {
        this.map = new Map();
    }

    /**
     * Sets a key-value pair inside the ObjectMap
     * 
     * @param {Object} key Any javascript object.
     * @param {*} value Any value to place in the map entry.
     */
    set(key, value) {
        this.map.set(JSON.stringify(key), value);
    }

    /**
     * Checks if the ObjectMap contains a given object key.
     * 
     * @param {Object} key Any javascript object.
     * @returns {boolean} True if the object is present, otherwise false.
     */
    has(key) {
        return this.map.has(JSON.stringify(key));
    }

    /**
     * Gets a value from the ObjectMap by a given object key.
     * 
     * @param {Object} key Any javascript object.
     * @returns {*} The value with the associated key, if none existings returns undefined.
     */
    get(key) {
        return this.map.get(JSON.stringify(key));
    }
}


/**
 * The PathNode is an object used specifically in the Dijksta Pathfinding algorithm.
 * 
 * It contains information about a specific node in the path followed by Dijkstra.
 */
class PathNode {

    /**
     * Contains a node in the path for shortest path with dijksta.
     * 
     * @param {Node} value The value of the node
     * @param {Node} parentValue The parent node, the node we were on before entering this node.
     * @param {Number} distanceToRoot The distance from this node to the starting point.
     * @param {Direction} lastMoveDirection The direction we moved in to get to this node.
     * @param {Number} consecutiveMoveCount The amount of consequetive moves we made in this direction.
     */
    constructor(value, parentValue, distanceToRoot, lastMoveDirection, consecutiveMoveCount ) {
        this.value = value;
        this.parentValue = parentValue;
        this.distanceToRoot = distanceToRoot;
        this.lastMoveDirection = lastMoveDirection;
        this.consecutiveMoveCount = consecutiveMoveCount;
    }
}  


/**
 * The priority queue is a regular queue where each element has a priority associated with it.
 * 
 * This data structure will make sure that when you call pop() the element with the highest priority
 * is returned.
*/
class PriorityQueue {

    /**
     * Creates the priority queue with a custom comparison function to note the priority.
     * 
     * @param {Function} comparisonFunction A function taking 2 elements for comparison.
     */
    constructor(comparisonFunction = (a, b) => a > b) {
        this.heap = [];
        this.comparisonFunction = comparisonFunction;
    }

    parent = (index) => {
        return ((index + 1) >>> 1) - 1;
    }

    left = (index) => {
        return (index << 1) + 1
    }

    right = (index) => {
        return (index + 1) << 1
    }

    /**
     * Returns the size of the current queue.
     * 
     * @returns {Number} The length of the queue. 
     */
    size() {
        return this.heap.length;
    }

    /**
     * Checks if the queue is empty.
     * 
     * @returns {Boolean} True if the queue is empty, otherwise false. 
     */
    isEmpty() {
        return this.size() === 0;
    }

    /**
     * Adds one or more elements to the priority queue.
     * 
     * @param  {...any} values One or more items to be added to the queue.
     */
    push(...values) {
        for (let value of values) {
            this.heap.push(value);
            this.#siftUp();
        }
    }

    /**
     * Returns the top element of the queue, without removing it.
     * 
     * @returns The top element of the queue. 
     */
    peek() {
        return this.heap[0];
    }

    /**
     * Removes the first element in the queue and returns it.
     * 
     * @returns The first element in the queue.
     */
    pop() {
        const entryToPop = this.peek();
        const lastIndex = this.size() - 1;

        if (lastIndex > 0) {
            this.#swap(0, lastIndex);
        }   

        this.heap.pop();
        this.#siftDown();

        return entryToPop;
    }

    /**
     * Uses the comparison function to check the priority of two items in the queue by index.
     * 
     * @param {Number} i The first index.
     * @param {Number} j The second index.
     * @returns {Boolean} True if the comparison function says the first index item is greater, otherwise false.
     */
    #greater(i, j) {
        return this.comparisonFunction(this.heap[i], this.heap[j]);
    }

    /**
     * Swaps to items in the heap by index.
     * 
     * @param {Number} i The first item's index to swap.
     * @param {Number} j The second item's index to swap.
     */
    #swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    /**
     * After adding a new element to the back of the priority queue it must
     * be bubbled up to where it should be in the priority queue, based on the
     * priority of the item added.
     * 
     * This method will do the bubbling up.
     */
    #siftUp() {
        let node = this.size() - 1;

        while (node > 0 && this.#greater(node, this.parent(node))) {
            this.#swap(node, this.parent(node));
            node = this.parent(node);
        }
    }

    /**
     * After removing the first element of the priority queue, the queue could
     * be violated in priority, this fixes the queue if needed from the highest priority
     * down towards the least priority of the node.
     */
    #siftDown() {
        let node = 0;

        while(
            (this.left(node) < this.size() && this.#greater(this.left(node), node)) ||
            (this.right(node) < this.size() && this.#greater(this.right(node), node))
        ) {
            let maxChild = (this.right(node) < this.size() && this.#greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
            this.#swap(node, maxChild);
            node = maxChild;
        }
    }
} 


/**
 * An implementation of Dijksta's Pathfinding algorithm.
 * 
 * Given a graph and a start/end node, this will find the shortest path.
 */
class Dijkstra {

    /**
     * Creates the Dijstra algorithm class.
     * 
     * @param {Graph} graph The graph to be traversed.
     * @param {Node} start The start node.
     * @param {Node} end The end node.
     */
    constructor(graph, start, end) {
        this.graph = graph;
        this.start = start;
        this.end = end;

        this.visited = new ObjectMap();
        this.parents = new ObjectMap();
        this.queue = new PriorityQueue((a, b) => a.distanceToRoot < b.distanceToRoot);
    }

    /**
     * Traverses the graph from start to end
     * 
     * @returns The shortest path and the total distance of the path. 
     */
    traverse() {
        // Add the starting node to the priority queue.
        this.queue.push(new PathNode(this.start, null, 0, null, 0));

        // Variable for storing the node.
        let currentNode = null;

        // Keep going through the queue.
        while(!this.queue.isEmpty()) {
            // Take the first item from the queue.
            currentNode = this.takeFirstNodeFromQueue();  

            // Check if node is not already visited
            if (!this.isNodeVisited(currentNode)) {

               // Mark the parent of the node.
               this.setParent(currentNode);

               // Mark the node as visited
               this.setNodeAsVisited(currentNode);
   
               // Break the loop if we are at the end.
               if (this.isEndNode(currentNode, this.end)) {
                   break;
               }
   
               // Evaluate the most optimal path to take.
               // const optimalPath = this.lookaheadAndEvaluate(currentNode);
               // const optimalNode = optimalPath.path[0];
   
   
               // Add new edges to the priority queue for processing.
               for (let edge of this.getEdges(currentNode)) {
                   this.updateQueue(currentNode, edge);
               }
            }
        }

        // Return the shortest path.
        if (this.isEndNode(currentNode, this.end)) {
            return currentNode.distanceToRoot
        } 

        // If we somehow end up somewhere else than the end.
        throw Error('Failed and got stuck')
    }


    /**
     * Looks ahead 4 moves to determine any issues in the path, that would lead to a less effective path.
     * 
     * @param {PathNode} currentNode the current node being visited.
     * @param {Number} depth The current depth of the look ahead search.
     * 
     * @returns An objects containing the total cost of the path being look at and the path itself.
     */
    lookaheadAndEvaluate(pathNode, depth = 0) {
        // Base case: Depth of 4 has been reached, no more lookahead required so return.
        if (depth === 4) {
            return { totalCost: pathNode.distanceToRoot, path: [pathNode] };
        }
    
        let bestPath = null;
        let lowestCost = Infinity;

        // Loop over the valid edges for this pathnode.
        for (let edge of this.getEdges(pathNode)) {
            // Calculate the distance to root.
            const distanceToRoot = Number(pathNode.distanceToRoot) + Number(edge.cost);

            // Calculate the amount of consecutive moves in a single direction when moving along this edge.
            const consecutiveMoveCount = (edge.getDirection() === pathNode.lastMoveDirection) ? pathNode.consecutiveMoveCount + 1 : 1

            // Create a temporary path node for this potential travel
            const tempPathNode = new PathNode(edge.destination.node, pathNode.parentValue, distanceToRoot, edge.getDirection(), consecutiveMoveCount);

            // Recursively call this function again
            const pathEvaluation = this.lookaheadAndEvaluate(tempPathNode, depth + 1);

            if (pathEvaluation.totalCost < lowestCost) {
                bestPath = [tempPathNode, ...pathEvaluation.path];
                lowestCost = pathEvaluation.totalCost;
            }
        }
    
        return { totalCost: lowestCost, path: bestPath };
    }

    /**
     * Adds a new edge to the queue for traversal.
     * 
     * @param {PathNode} pathNode The current path node we are at.
     * @param {Edge} edge The edge it should cross.
     */
    updateQueue(pathNode, edge) {
        // Get the destination vertex and the cost for travelling to it.
        const destinationVertex = edge.destination;
        const cost = pathNode.distanceToRoot + edge.cost;
   
        // Get the direction in which the edge moves.
        const moveDirection = edge.getDirection();

        // // Check if the direction is not opposite of where we came from.
        // // So no backwards movement allowed back on the queue.
        // if (this.isOppositeDirection(moveDirection, pathNode.lastMoveDirection)) {
        //     return;
        // }

        // Calculate the amount of consecutive moves in a single direction when moving along this edge.
        const consecutiveMoveCount = (moveDirection === pathNode.lastMoveDirection) ? pathNode.consecutiveMoveCount + 1 : 1

        // // If we make more than 3 consecutive moves, don't add to the queue.
        // if(consecutiveMoveCount > 3) {
        //     return;
        // }

        // Create the next path node and add it to the queue.
        const nextPathNode = new PathNode(destinationVertex.node, pathNode.value, cost, moveDirection, consecutiveMoveCount);
        this.queue.push(nextPathNode);   
    }

    /**
     * Returns all the valid edges for a given path node.
     * 
     * The valid edges are all edges the given node has except:
     *      1. The edge that points back to the node it came from.
     *      2. The edge that points in the same direction when already moving in that direction for 3 steps.
     * 
     * @param {PathNode} pathNode The path node to get the edges for.
     * @returns {Edge[]} An array of edges that are valid for this path node.
     */
    getEdges(pathNode) {
        // First retrieve all the possible edges for the current vertrex.
        const allEdges = this.graph.getVertex(pathNode.value).edges;

        // Filter out the edge we came from.
        let validEdges = allEdges.filter(edge => {
            return !this.isOppositeDirection(edge.getDirection(), pathNode.lastMoveDirection);
        });

        // Filter out the edge that allows for more than 3 consecutive moves.
        validEdges = validEdges.filter(edge => {
            if (edge.getDirection() === pathNode.lastMoveDirection) {
                return pathNode.consecutiveMoveCount < 3;
            }


            return true;
        })

        // Return the valid edges.
        return validEdges
    }

    /**
     * Given two directions, returns if they are opposite values of each other.
     * 
     * @param {Direction} direction1 The first direction.
     * @param {Direction} direction2 The second direction
     * @returns {Boolean} True if the directions are opposite, otherwise false.
     */
    isOppositeDirection(direction1, direction2) {
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };

        return opposites[direction1] === direction2;
    }

    /**
     * Takes the first node from the priority queue.
     * 
     * @returns {Node} The node on top of the priority queue.
     */
    takeFirstNodeFromQueue() {
        return this.queue.pop();
    }

    /**
     * Checks if the node is already visited.
     * 
     * @param {PathNode} pathNode The pathNode to check for visits.
     * @returns {Boolean} True if the node has been visited, otherwise false.
     */
    isNodeVisited(pathNode) {
        return this.visited.has({ value: pathNode.value, direction: pathNode.lastMoveDirection, distanceToRoot: pathNode.distanceToRoot });
    }

    getVisitedNode(pathNode) {
        return this.visited.get({ value: pathNode.value, direction: pathNode.lastMoveDirection, distanceToRoot: pathNode.distanceToRoot });
    }

    /**
     * Marks a given path node as visited.
     * 
     * @param {PathNode} pathNode The pathnode to mark as visited.
     */
    setNodeAsVisited(pathNode) {
        this.visited.set({ value: pathNode.value, direction: pathNode.lastMoveDirection, distanceToRoot: pathNode.distanceToRoot }, pathNode);
    }

    /**
     * Checks if a given path node has a parent.
     * 
     * @param {PathNode} pathNode The path node to check for a parent.
     * @returns {Boolean} True if the path node has a parent, otherwise false.
     */
    hasParent(pathNode) {
        return pathNode.parentValue !== null;
    }

    /**
     * Sets the path node as a parent for backtracking the path.
     * 
     * @param {PathNode} pathNode The path node to mark as a parent.
     */
    setParent(pathNode) {
        if (!this.hasParent(pathNode)) {
            return;
        }

        this.parents.set(pathNode.value, pathNode.parentValue);
    }

    /**
     * Checks if a given pathnode is the final node for the path.
     * 
     * @param {PathNode} node The path node to check for.
     * @param {Node} end The end node to check against.
     * @returns {Boolean} True if it's the end node, otherwise false.
     */
    isEndNode(pathNode, end) {
        return JSON.stringify(pathNode.value) === JSON.stringify(end);
    }

    /**
     * Given the end node and the distance from the starting node, traverse the route back.
     * 
     * @param {Node} end The node we ended on.
     * @param {Number} distance The distance it is from the start.
     * @returns The distance and a list of PathNodes that lead from start to finish following the shortest path.
     */
    traversePath(end, distance) {
        const shortestPath = [];
        let lastVisitedNode = end;

        while (this.parents.has(lastVisitedNode)) {
            shortestPath.push(lastVisitedNode);
            const parent = this.parents.get(lastVisitedNode);
            lastVisitedNode = parent;

            if (!this.parents.has(lastVisitedNode)) {
                shortestPath.push(lastVisitedNode);
            }
        }

        shortestPath.reverse();

        return { shortestPath, distance };
    }
}


const main = async () => {
    // Read the input.
    const inputFilePath = path.join(__dirname, 'input.txt');
    const inputFileText = fs.readFileSync(inputFilePath, 'utf-8');

    // Create graph from input text.
    const graph = GraphFactory.create(inputFileText);

    // Get the grid and it's dimensions.
    const grid =  inputFileText.split('\r\n').map(x => x.trim())
    const rowCount = grid.length - 1;
    const colCount = grid[0].length - 1;

    // Define the start node (top left) and end node (bottom right).
    const start = new Node(0, 0, grid[0][0]);
    const end = new Node(rowCount, colCount, grid[rowCount][colCount])
    
    // Run dijkstra's shortest path.
    const dijkstra = new Dijkstra(graph, start, end);
    return dijkstra.traverse();
}


const t0 = performance.now();
main().then(solution => {
    const t1 = performance.now();
    console.log(`The solution is ${solution}`);
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
});
