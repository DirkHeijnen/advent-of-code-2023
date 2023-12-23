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

	// Check if we are facing an uphill slope in the direciton we are moving in.
	if grid[nextPosition.row][nextPosition.col] == "v" && nextPosition.direction == Up {
		return false
	}
	if grid[nextPosition.row][nextPosition.col] == "^" && nextPosition.direction == Down {
		return false
	}
	if grid[nextPosition.row][nextPosition.col] == "<" && nextPosition.direction == Right {
		return false
	}
	if grid[nextPosition.row][nextPosition.col] == ">" && nextPosition.direction == Left {
		return false
	}

	// All checks passed and this is a valid position.
	return true
}

func getNeighboringPosition(currentPosition PathNode, direction Direction) PathNode {
	switch direction {
	case Up:
		return PathNode{row: currentPosition.row - 1, col: currentPosition.col, direction: Up}
	case Down:
		return PathNode{row: currentPosition.row + 1, col: currentPosition.col, direction: Down}
	case Left:
		return PathNode{row: currentPosition.row, col: currentPosition.col - 1, direction: Left}
	case Right:
		return PathNode{row: currentPosition.row, col: currentPosition.col + 1, direction: Right}
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

func findLongestPath(grid [][]string, start PathNode, end PathNode) int {
	// Keep an array of possible lengths of the path.
	lengths := []int{}

	queue := []PathNode{}
	queue = append(queue, start)

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		if current.row == end.row && current.col == end.col {
			lengths = append(lengths, current.distanceToStart)
			continue
		}

		validNeighbors := getValidNeighboringPositions(grid, current)

		for _, next := range validNeighbors {
			next.distanceToStart = current.distanceToStart + 1
			queue = append(queue, next)
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
			start = PathNode{row: firstRowIndex, col: i, direction: Down}
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
