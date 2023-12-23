package main

import (
	"bufio"
	"fmt"
	"os"
	"slices"
	"time"
)

type Direction int

const (
	Up    Direction = 0
	Down  Direction = 1
	Left  Direction = 2
	Right Direction = 3
)

type PathNode struct {
	row             int
	col             int
	direction       Direction
	distanceToStart int
	visited         map[string]bool
}

type PriorityQueue struct {
	queue      *[]PathNode
	comparator func(a PathNode, b PathNode) bool
}

func heapifyUp(pq *PriorityQueue, index int) {
	for index > 0 {
		parentIndex := (index - 1) / 2
		if pq.comparator((*pq.queue)[parentIndex], (*pq.queue)[index]) {
			break
		}
		(*pq.queue)[index], (*pq.queue)[parentIndex] = (*pq.queue)[parentIndex], (*pq.queue)[index]
		index = parentIndex
	}
}

func (pq *PriorityQueue) heapifyDown(index int) {
	lastIndex := len((*pq.queue)) - 1
	for {
		leftChildIndex := 2*index + 1
		rightChildIndex := 2*index + 2
		var smallestChildIndex int

		if leftChildIndex <= lastIndex && pq.comparator((*pq.queue)[leftChildIndex], (*pq.queue)[index]) {
			smallestChildIndex = leftChildIndex
		} else {
			smallestChildIndex = index
		}

		if rightChildIndex <= lastIndex && pq.comparator((*pq.queue)[rightChildIndex], (*pq.queue)[smallestChildIndex]) {
			smallestChildIndex = rightChildIndex
		}

		if smallestChildIndex == index {
			break
		}

		(*pq.queue)[index], (*pq.queue)[smallestChildIndex] = (*pq.queue)[smallestChildIndex], (*pq.queue)[index]
		index = smallestChildIndex
	}
}

func (pq *PriorityQueue) Enqueue(node PathNode) {
	*pq.queue = append(*pq.queue, node)
	heapifyUp(pq, len(*pq.queue)-1)
}

func (pq *PriorityQueue) Dequeue() PathNode {
	if len(*pq.queue) == 0 {
		return PathNode{} // or some kind of error indication
	}
	root := (*pq.queue)[0]
	last := (*pq.queue)[len((*pq.queue))-1]
	(*pq.queue)[0] = last
	(*pq.queue) = (*pq.queue)[:len((*pq.queue))-1]
	pq.heapifyDown(0)
	return root
}

func (pq *PriorityQueue) Length() int {
	return len((*pq.queue))
}

func parseInput() [][]string {
	file, err := os.Open("input.txt")
	if err != nil {
		fmt.Println("Error opening file", err)
		panic(err)
	}

	defer file.Close()

	grid := [][]string{}

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		currentRow := []string{}

		for _, char := range line {
			currentRow = append(currentRow, string(char))
		}

		grid = append(grid, currentRow)
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading from file:", err)
	}

	return grid
}

func comparePathNodes(a PathNode, b PathNode) bool {
	return a.distanceToStart > b.distanceToStart
}

func isValidPosition(grid [][]string, currentPosition PathNode, nextPosition PathNode) bool {
	// Check if the position is within the grid boundary
	if nextPosition.row < 0 || nextPosition.row >= len(grid) {
		return false
	}

	// Check if the position is within the grid boundary
	if nextPosition.col < 0 || nextPosition.col >= len(grid[0]) {
		return false
	}

	// Check if the position is a part of the forest ('#')
	if grid[nextPosition.row][nextPosition.col] == "#" {
		return false
	}

	// Check if we are not moving in the direction we just came from.
	if currentPosition.direction == Up && nextPosition.direction == Down {
		return false
	}
	if currentPosition.direction == Down && nextPosition.direction == Up {
		return false
	}
	if currentPosition.direction == Left && nextPosition.direction == Right {
		return false
	}
	if currentPosition.direction == Right && nextPosition.direction == Left {
		return false
	}

	// All checks passed and this is a valid position.
	return true
}

func getNeighboringPosition(currentPosition PathNode, direction Direction) PathNode {
	switch direction {
	case Up:
		return PathNode{row: currentPosition.row - 1, col: currentPosition.col, direction: Up, visited: make(map[string]bool)}
	case Down:
		return PathNode{row: currentPosition.row + 1, col: currentPosition.col, direction: Down, visited: make(map[string]bool)}
	case Left:
		return PathNode{row: currentPosition.row, col: currentPosition.col - 1, direction: Left, visited: make(map[string]bool)}
	case Right:
		return PathNode{row: currentPosition.row, col: currentPosition.col + 1, direction: Right, visited: make(map[string]bool)}
	}

	panic("Something went wrong with the direction check, got an invalid direction value")
}

func getValidNeighboringPositions(grid [][]string, currentPosition PathNode) []PathNode {
	valid := []PathNode{}

	for _, direction := range [4]Direction{Up, Down, Left, Right} {
		neighborPosition := getNeighboringPosition(currentPosition, direction)

		if isValidPosition(grid, currentPosition, neighborPosition) {
			valid = append(valid, neighborPosition)
		}
	}

	return valid
}

func markAsVisited(current *PathNode, nextNode *PathNode) {
	for key, _ := range current.visited {
		nextNode.visited[key] = true
	}

	key := fmt.Sprintf("%d,%d", current.row, current.col)
	nextNode.visited[key] = true
}

func isVisited(current *PathNode, next *PathNode) bool {
	key := fmt.Sprintf("%d,%d", next.row, next.col)
	return current.visited[key]
}

func findLongestPath(grid [][]string, start PathNode, end PathNode) int {
	lengths := []int{}

	queue := PriorityQueue{queue: &[]PathNode{}, comparator: comparePathNodes}
	queue.Enqueue(start)

	for queue.Length() > 0 {
		fmt.Print()
		current := queue.Dequeue()

		if current.row == end.row && current.col == end.col {
			lengths = append(lengths, current.distanceToStart)
			continue
		}

		for _, next := range getValidNeighboringPositions(grid, current) {
			if isVisited(&current, &next) {
				continue
			}
			next.distanceToStart = current.distanceToStart + 1
			markAsVisited(&current, &next)
			queue.Enqueue(next)
		}
	}

	return slices.Max(lengths)
}

func solve() int {
	// Get grid and start/end positions.
	grid := parseInput()
	start := PathNode{}
	end := PathNode{}

	// Get start (set direction as down because it's out-of-bounds so we don't miss a position)
	firstRowIndex := 0
	for i := 0; i < len(grid[firstRowIndex]); i++ {
		if grid[firstRowIndex][i] == "." {
			start = PathNode{row: firstRowIndex, col: i, direction: Down, visited: make(map[string]bool)}
		}
	}

	// Get end (set direction as up because it's out-of-bounds so we don't miss a position)
	lastRowIndex := len(grid) - 1
	for i := 0; i < len(grid[lastRowIndex]); i++ {
		if grid[lastRowIndex][i] == "." {
			end = PathNode{row: lastRowIndex, col: i, direction: Up}
		}
	}

	// Return 0 for now
	return findLongestPath(grid, start, end)
}

func main() {
	startTime := time.Now()
	solution := solve()
	elapsedTime := time.Since(startTime)

	fmt.Printf("The solution is %d\n", solution)
	fmt.Printf("Execution time: %s\n", elapsedTime)
}
