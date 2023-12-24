package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
	"time"
)

// ? Might change px/vx to a positon/velocity struct with appropriate methods later
type Hailstone struct {
	px, py, pz int64 // Position.
	vx, vy, vz int64 // Velocity
}

type TestArea struct {
	minX, maxX int64 // X axis range
	minY, maxY int64 // Y axis range
}

type Line struct {
	start Point2D
	end   Point2D
}

type Point2D struct {
	x int64
	y int64
}

// Helper function to parse a string to a 64bit integer.
func atoi64(str string) int64 {
	num, err := strconv.ParseInt(str, 10, 64) // Parse as base-10 and 64 bit.
	if err != nil {
		panic(err)
	}
	return num
}

func parseInput(filePath string) []Hailstone {
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file", err)
		panic(err)
	}

	defer file.Close()

	hailstones := []Hailstone{}

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		parts := strings.Split(line, "@")
		positionParts := strings.Split(parts[0], ",")
		velocityParts := strings.Split(parts[1], ",")

		for i, part := range positionParts {
			positionParts[i] = strings.TrimSpace(part)
		}

		for i, part := range velocityParts {
			velocityParts[i] = strings.TrimSpace(part)
		}

		hailstones = append(hailstones, Hailstone{
			px: atoi64(positionParts[0]), py: atoi64(positionParts[1]), pz: atoi64(positionParts[2]),
			vx: atoi64(velocityParts[0]), vy: atoi64(velocityParts[1]), vz: atoi64(velocityParts[2]),
		})
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading from file:", err)
	}

	return hailstones
}

// This function will calculate the minimum amount of ticks (nanoseconds) that are required
// for a hailstone to reach the end of the test area.
func calculateMinTicks(hailstone Hailstone, area TestArea) int64 {
	// Initialize times to reach each boundary with a very large number.
	ticksToMinX, ticksToMaxX, ticksToMinY, ticksToMaxY := int64(math.MaxInt64), int64(math.MaxInt64), int64(math.MaxInt64), int64(math.MaxInt64)

	if hailstone.vx > 0 {
		ticksToMaxX = (area.maxX - hailstone.px) / hailstone.vx // Time to reach maxX
	} else if hailstone.vx < 0 {
		ticksToMinX = (hailstone.px - area.minX) / -hailstone.vx // Time to reach minX
	}

	if hailstone.vy > 0 {
		ticksToMaxY = (area.maxY - hailstone.py) / hailstone.vy // Time to reach maxY
	} else if hailstone.vy < 0 {
		ticksToMinY = (hailstone.py - area.minY) / -hailstone.vy // Time to reach minY
	}

	// Find the minimum positive time
	times := []int64{ticksToMinX, ticksToMaxX, ticksToMinY, ticksToMaxY}
	minTime := int64(math.MaxInt64)
	for _, t := range times {
		if t >= 0 && t < minTime {
			minTime = t
		}
	}

	if minTime == math.MaxInt64 {
		return -1 // Indicates the hailstone will never reach the boundary
	}
	return minTime
}

// Given the amount of ticks it takes for the hailstone to leave the area, return the final Point it has.
func calculateFinalPoint(hailstone Hailstone, ticks int64) Point2D {
	return Point2D{
		x: hailstone.px + hailstone.vx*ticks,
		y: hailstone.py + hailstone.vy*ticks,
	}
}

func doLinesIntersect(line1 Line, line2 Line, area TestArea) bool {
	// Calculate differences
	dx1 := float64(line1.end.x - line1.start.x)
	dy1 := float64(line1.end.y - line1.start.y)
	dx2 := float64(line2.end.x - line2.start.x)
	dy2 := float64(line2.end.y - line2.start.y)

	// Calculate determinants
	det := dx1*dy2 - dy1*dx2
	if det == 0 {
		// Lines are parallel, no intersection
		return false
	}

	// Calculate the parameters for the intersection point
	det1 := float64(line2.start.x-line1.start.x)*dy2 - float64(line2.start.y-line1.start.y)*dx2
	det2 := float64(line2.start.x-line1.start.x)*dy1 - float64(line2.start.y-line1.start.y)*dx1

	// Check if the intersection point lies on both line segments
	r := det1 / det
	s := det2 / det

	if r >= 0 && r <= 1 && s >= 0 && s <= 1 {
		// Calculate the actual intersection point
		intersectX := float64(line1.start.x) + dx1*r
		intersectY := float64(line1.start.y) + dy1*r

		// Check if the intersection lies within the test area bounds
		if intersectX < float64(area.minX) || intersectX > float64(area.maxX) ||
			intersectY < float64(area.minY) || intersectY > float64(area.maxY) {
			return false
		}

		// Intersection is within the line segments and within the area
		return true
	}

	return false
}

func findAllIntersections(lines []Line, area TestArea) int {
	count := 0

	for i := 0; i < len(lines); i++ {
		for j := i + 1; j < len(lines); j++ {
			if doLinesIntersect(lines[i], lines[j], area) {
				count++
			}
		}
	}

	return count
}

func solve() int {
	isTest := false

	hailstones := []Hailstone{}
	testArea := TestArea{}

	if isTest {
		hailstones = parseInput("test.txt")
		testArea = TestArea{minX: 7, maxX: 27, minY: 7, maxY: 27}
	} else {
		hailstones = parseInput("input.txt")
		testArea = TestArea{minX: 200000000000000, maxX: 400000000000000, minY: 200000000000000, maxY: 400000000000000}
	}

	// Create all the lines (trajectories of the hailstones)
	lines := []Line{}

	for _, hailstone := range hailstones {
		// Calculate the start and end points of the hailstone's trajectory.
		minimumTicks := calculateMinTicks(hailstone, testArea)
		startPoint := Point2D{x: hailstone.px, y: hailstone.py}
		finalPoint := calculateFinalPoint(hailstone, minimumTicks)

		// Form the line (trajectory of the hailstone)
		lines = append(lines, Line{start: startPoint, end: finalPoint})
	}

	return findAllIntersections(lines, testArea)
}

func main() {
	startTime := time.Now()
	solution := solve()
	elapsedTime := time.Since(startTime)

	fmt.Printf("The solution is %d\n", solution)
	fmt.Printf("Execution time: %s\n", elapsedTime)
}
