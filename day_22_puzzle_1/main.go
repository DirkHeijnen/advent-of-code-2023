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

// Function to print the grid from the X or Y view
func printGrid(bricks []Brick, view string) {
	maxX, maxY, maxZ := 0, 0, 0
	for _, brick := range bricks {
		if brick.End.X > maxX {
			maxX = brick.End.X
		}
		if brick.End.Y > maxY {
			maxY = brick.End.Y
		}
		if brick.End.Z > maxZ {
			maxZ = brick.End.Z
		}
	}

	for z := maxZ; z >= 0; z-- {
		fmt.Printf("Level %d: ", z)
		var gridLine string

		if view == "X" {
			gridLine = strings.Repeat(" ", (maxX+1)*2) // Initialize with spaces for empty bricks
			for _, brick := range bricks {
				if z >= brick.Start.Z && z <= brick.End.Z {
					brickLength := brick.End.X - brick.Start.X + 1
					brickRepresentation := strings.Repeat("==", brickLength)
					position := brick.Start.X * 2
					gridLine = gridLine[:position] + brickRepresentation + gridLine[position+len(brickRepresentation):]
				}
			}
		} else { // view == "Y"
			gridLine = strings.Repeat(" ", (maxY+1)*2) // Initialize with spaces for empty bricks
			for _, brick := range bricks {
				if z >= brick.Start.Z && z <= brick.End.Z {
					brickWidth := brick.End.Y - brick.Start.Y + 1
					brickRepresentation := strings.Repeat("==", brickWidth)
					position := brick.Start.Y * 2
					gridLine = gridLine[:position] + brickRepresentation + gridLine[position+len(brickRepresentation):]
				}
			}
		}

		fmt.Println("[" + gridLine + "]")
	}
}

func replaceAt(str string, replacement string, index int) string {
	return str[:index] + replacement + str[index+len(replacement):]
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
	Start *Coordinate
	End   *Coordinate
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
		bricks = append(bricks, Brick{Start: &startCoordinate, End: &endCoordinate})
	}

	// Handle file reading error.
	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading from file:", err)
	}

	return bricks
}

// getCoveredPoints returns an array of (x, y) points covered by the given brick
func getCoveredPoints(brick Brick) []Point {
	var points []Point

	for x := brick.Start.X; x <= brick.End.X; x++ {
		for y := brick.Start.Y; y <= brick.End.Y; y++ {
			points = append(points, Point{X: x, Y: y})
		}
	}

	return points
}

// Given two bricks, on upper (a higher z brick) and the lower (a lower z brick)
// Check if the upper brick is supported by the lower brick.
func isSupportedBy(upper, lower Brick) bool {
	upperBrickPoints := getCoveredPoints(upper)
	lowerBrickPoints := getCoveredPoints(lower)

	// Check if the upper brick is directly above the lower brick in the Z dimension
	directlyAbove := upper.Start.Z-1 == lower.End.Z

	if directlyAbove {
		for _, upperPoint := range upperBrickPoints {
			for _, lowerPoint := range lowerBrickPoints {
				if upperPoint.X == lowerPoint.X && upperPoint.Y == lowerPoint.Y {
					return true
				}
			}
		}
	}
	return false
}

// simulateFall processes the bricks to allow them to fall if they are not supported
func simulateFall(bricks []Brick) []Brick {
	// Sort bricks by their startZ in ascending order
	sort.SliceStable(bricks, func(i, j int) bool {
		return bricks[i].Start.Z < bricks[j].Start.Z
	})

	for i := range bricks {
		for bricks[i].Start.Z > 0 {
			supported := false

			for j := range bricks {
				if i != j && bricks[j].Start.Z < bricks[i].Start.Z {
					if isSupportedBy(bricks[i], bricks[j]) {
						supported = true
						break
					}
				}
			}
			if supported {
				break
			} else {
				bricks[i].Start.Z--
				bricks[i].End.Z--
			}
		}
	}

	return bricks
}

// isSupporting checks if the lower brick supports the upper brick
func isSupporting(lower, upper Brick) bool {
	return isSupportedBy(upper, lower)
}

// canBeSafelyRemoved checks if a brick can be safely removed
func canBeSafelyRemoved(brick Brick, bricks []Brick) bool {
	for _, otherBrick := range bricks {
		if otherBrick.Start.Z > brick.Start.Z && isSupporting(brick, otherBrick) {
			// Check if otherBrick is supported by any brick other than the current brick
			supportedByAnother := false
			for _, potentialSupport := range bricks {
				if potentialSupport != brick && isSupporting(potentialSupport, otherBrick) {
					supportedByAnother = true
					break
				}
			}
			if !supportedByAnother {
				return false // otherBrick would fall if brick is removed
			}
		}
	}
	return true // No bricks would fall if brick is removed
}

// countSafelyRemovableBricks counts the number of bricks that can be safely removed
func countSafelyRemovableBricks(bricks []Brick) int {
	count := 0
	for _, brick := range bricks {
		if canBeSafelyRemoved(brick, bricks) {
			count++
		}
	}
	return count
}

func solve() int {
	// Input bricks.
	bricks := parseInput()

	// Bricks after they all found support
	settledBricks := simulateFall(bricks)

	// Count how many bricks could safely be removed.
	return countSafelyRemovableBricks(settledBricks)
}

func main() {
	startTime := time.Now()
	solution := solve()
	elapsedTime := time.Since(startTime)

	fmt.Printf("The solution is %d\n", solution)
	fmt.Printf("Execution time: %s\n", elapsedTime)
}
