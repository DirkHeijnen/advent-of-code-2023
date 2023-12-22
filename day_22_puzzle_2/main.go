package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

// Helper function to parse a string to an integer.
func atoi(str string) int {
	num, err := strconv.Atoi(str)
	if err != nil {
		panic(err)
	}
	return num
}

func replaceAt(str string, replacement string, index int) string {
	return str[:index] + replacement + str[index+len(replacement):]
}

func parseInput() []Brick {
	// Open file
	file, err := os.Open("input.txt")
	if err != nil {
		fmt.Println("Error opening file", err)
		panic(err)
	}

	defer file.Close()

	// Keep a list of bricks.
	var bricks []Brick
	var nextID int = 1

	// Handle lines
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		// Read the line and split on "~"
		line := scanner.Text()
		parts := strings.Split(line, "~")

		// Read part 1 to get start position and part 2 to get end position.
		startPosition := strings.Split(parts[0], ",")
		endPosition := strings.Split(parts[1], ",")

		// Create the coordinate instances
		startCoordinate := Coordinate{X: atoi(startPosition[0]), Y: atoi(startPosition[1]), Z: atoi(startPosition[2])}
		endCoordinate := Coordinate{X: atoi(endPosition[0]), Y: atoi(endPosition[1]), Z: atoi(endPosition[2])}

		// Append the brick.
		bricks = append(bricks, Brick{Id: nextID, Start: &startCoordinate, End: &endCoordinate})
		nextID++
	}

	// Handle file reading error.
	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading from file:", err)
	}

	return bricks
}

type Coordinate struct {
	X int
	Y int
	Z int
}

type Point struct {
	X int
	Y int
}

type Brick struct {
	Id    int
	Start *Coordinate
	End   *Coordinate
}

func (this *Brick) ToString() string {
	return fmt.Sprintf("%d,%d,%d~%d,%d,%d", this.Start.X, this.Start.Y, this.Start.Z, this.End.X, this.End.Y, this.End.Z)
}

func (this *Brick) MoveDown() {
	this.Start.Z--
	this.End.Z--
}

func (this *Brick) GetCoveredPoints() []Point {
	var points []Point

	for x := this.Start.X; x <= this.End.X; x++ {
		for y := this.Start.Y; y <= this.End.Y; y++ {
			points = append(points, Point{X: x, Y: y})
		}
	}

	return points
}

func (this *Brick) IsSupportedBy(other *Brick) bool {
	// Check if the upper brick is directly above the lower brick in the Z dimension
	directlyAbove := this.Start.Z-1 == other.End.Z

	if directlyAbove {
		for _, thisPoint := range this.GetCoveredPoints() {
			for _, otherPoint := range other.GetCoveredPoints() {
				if thisPoint.X == otherPoint.X && thisPoint.Y == otherPoint.Y {
					return true
				}
			}
		}
	}

	return false
}

func simulateFall(bricks []Brick) ([]Brick, int) {
	// Order the settled brick by their Z axis.
	sort.Slice(bricks, func(i, j int) bool {
		return bricks[i].Start.Z < bricks[j].Start.Z
	})

	fallenBricks := make(map[int]int)

	for i := 0; i < len(bricks); i++ {
		// Only check for support if it's not already on the floor.
		for bricks[i].Start.Z > 1 {
			supported := false

			// Check if the brick has found support at this position.
			for j := 0; j < len(bricks); j++ {
				if i != j {
					if bricks[i].IsSupportedBy(&bricks[j]) {
						supported = true
						break
					}
				}
			}
			if supported {
				break
			}

			bricks[i].MoveDown()
			fallenBricks[bricks[i].Id]++
		}
	}

	return bricks, len(fallenBricks)
}

func solve() int {
	// Input bricks.
	bricks := parseInput()

	// Bricks after they all found support
	settledBricks, _ := simulateFall(bricks)

	// Count the falls after removing 1 block at a time.
	totalFallCount := 0

	for i := 0; i < len(settledBricks); i++ {
		// Copy the settled bricks and remove 1.
		bricksCopy := make([]Brick, len(settledBricks))
		copy(bricksCopy, settledBricks)
		bricksCopy = append(bricksCopy[:i], bricksCopy[i+1:]...)

		// Calculate the bricks that have fallen this simulation.
		_, fallCount := simulateFall(bricksCopy)
		totalFallCount += fallCount
	}

	return totalFallCount
}

func main() {
	startTime := time.Now()
	solution := solve()
	elapsedTime := time.Since(startTime)

	fmt.Printf("The solution is %d\n", solution)
	fmt.Printf("Execution time: %s\n", elapsedTime)
}
