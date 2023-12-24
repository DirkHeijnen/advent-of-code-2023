package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Vector2D struct {
	x int64
	y int64
}

// ? Might change px/vx to a positon/velocity struct with appropriate methods later
type Hailstone struct {
	position Vector2D
	velocity Vector2D
}

type Area struct {
	minX, maxX int64 // X axis range
	minY, maxY int64 // Y axis range
}

type Line struct {
	start Vector2D
	end   Vector2D
}

// Helper function to parse a string to a 64bit integer.
func atoi64(str string) int64 {
	num, err := strconv.ParseInt(str, 10, 64) // Parse as base-10 and 64 bit.
	if err != nil {
		panic(err)
	}
	return num
}

// Helper function to get the absolute value of a 64bit integer.
func absInt64(x int64) int64 {
	if x < 0 {
		return -x
	}
	return x
}

// Helper function to create hailstones from the input file.
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
			position: Vector2D{x: atoi64(positionParts[0]), y: atoi64(positionParts[1])},
			velocity: Vector2D{x: atoi64(velocityParts[0]), y: atoi64(velocityParts[1])},
		})
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading from file:", err)
	}

	return hailstones
}

// Given a position defined as a vector2D and a velocity, calculate
// how many times the velocity can be applied to the position before it leaves the area.
func calculateTimeToReachEdge(position Vector2D, velocity Vector2D, area Area) int64 {

	// Because we don't know at the start, the hail could leave on the X or the Y axis so we must calculate both.
	var timeToLeaveX int64
	var timeToLeaveY int64

	// Catch early if there is no velocity at all (the hail will remain in it's position forever)
	if velocity.x == 0 && velocity.y == 0 {
		return -1
	}

	// Calculate the time on the X axis (can be to the left or to the right depending on if the velocity applied is positive or negative).
	// Because the area does not start at 0 (Test case starts at x 7 (minX) and ends at x 27 (maxX)) we must take it into account here.
	if velocity.x > 0 {
		timeToLeaveX = (area.maxX - position.x) / absInt64(velocity.x)
	} else {
		timeToLeaveX = (position.x - area.minX) / absInt64(velocity.x)
	}

	// Calculate the time on the Y axis (can be to the top or to the bottom depending on if the velocity applied is positive or negative).
	// Because the area does not start at 0 (Test case starts at y 7 (minY) and ends at y 27 (maxY)) we must take it into account here.
	if velocity.y > 0 {
		timeToLeaveY = (area.maxY - position.y) / absInt64(velocity.y)
	} else {
		timeToLeaveY = (position.y - area.minY) / absInt64(velocity.y)
	}

	// Now we know how much time it take to leave the area in the x and y axis, we return whichever one occured first.
	if timeToLeaveX < timeToLeaveY {
		return timeToLeaveX
	} else {
		return timeToLeaveY
	}
}

// Given a point and the point's velocity and some time, will return where
// the point will end up after applying the velocity to it for the given amount of time.
func calculateFinalPosition(position Vector2D, velocity Vector2D, time int64) Vector2D {
	return Vector2D{
		x: position.x + (velocity.x * time),
		y: position.y + (velocity.y * time),
	}
}

// We need to find out the amount of intersections between the lines created from the hailstones.
// This takes in the trajectory of both hailstones as lines and the original area the lines were drawn in.
// Returns true if the lines cross within the bounds of the area, if not this will return false.
func checkIfLinesIntersect(line1 Line, line2 Line, area Area) bool {

	// Lets say line1 is called A and line2 is called B and the 1 and 2 are their start and end x/y values.
	// The formula is:
	// 	Ax1 + t(Ax2 - Ax1) = Bx1 + u(Bx2 - Bx1)
	//	Ay1 + t(Ay2 - Ay1) = By1 + u(By2 - By1)
	//
	// After solving the formule we will know the "t" and "u" values. If they both are within the range of 0 to 1 we have
	// found an intersection, otherwise we haven't.

	// Extract the formula components from the struct.
	ax1 := float64(line1.start.x)
	ay1 := float64(line1.start.y)
	ax2 := float64(line1.end.x)
	ay2 := float64(line1.end.y)

	bx1 := float64(line2.start.x)
	by1 := float64(line2.start.y)
	bx2 := float64(line2.end.x)
	by2 := float64(line2.end.y)

	// Calculate the denomitor, this represents the difference in slopes between the two lines
	denominator := (ax2-ax1)*(by2-by1) - (ay2-ay1)*(bx2-bx1)

	// If there is no diffence in slopes then the lines are parallel and no intersection can exist.
	if denominator == 0 {
		return false
	}

	// Calculate the "t" and "u" values in from the above equation.
	t := ((bx1-ax1)*(by2-by1) - (by1-ay1)*(bx2-bx1)) / denominator
	u := ((bx1-ax1)*(ay2-ay1) - (by1-ay1)*(ax2-ax1)) / denominator

	// Check if t and u are within the range [0, 1]
	if (t >= 0 && t <= 1) && (u >= 0 && u <= 1) {
		// Calculate intersection point
		intersection := Vector2D{
			x: int64(ax1 + t*(ax2-ax1)),
			y: int64(ay1 + t*(ay2-ay1)),
		}
		// Check if the intersection lies within the test area bounds
		if intersection.x < area.minX || intersection.x > area.maxX || intersection.y < area.minY || intersection.y > area.maxY {
			return false
		}

		return true
	}

	return false
}

// Given a list of lines and an area, find the count of intersections between the lines that happen
// within the bounds of the given area.
func findAllIntersections(lines []Line, area Area) int {
	count := 0

	// The (j := i + 1) is important, if we would start j at 0 we would count each intersection twice.
	for i := 0; i < len(lines); i++ {
		for j := i + 1; j < len(lines); j++ {
			if checkIfLinesIntersect(lines[i], lines[j], area) {
				count++
			}
		}
	}

	return count
}

func solve() int {
	// Get the hailstones from the input and create the test area.
	hailstones := parseInput("input.txt")
	testArea := Area{minX: 200000000000000, maxX: 400000000000000, minY: 200000000000000, maxY: 400000000000000}

	// Create the set of lines (trajectories of the hailstones)
	lines := []Line{}

	// Fill the set of lines
	for _, hailstone := range hailstones {
		timeToLeaveArea := calculateTimeToReachEdge(hailstone.position, hailstone.velocity, testArea)
		finalPosition := calculateFinalPosition(hailstone.position, hailstone.velocity, timeToLeaveArea)

		lines = append(lines, Line{start: hailstone.position, end: finalPosition})
	}

	// Return the count of intersection between the lines in the given area as the solution.
	return findAllIntersections(lines, testArea)
}

func main() {
	startTime := time.Now()
	solution := solve()
	elapsedTime := time.Since(startTime)

	fmt.Printf("The solution is %d\n", solution)
	fmt.Printf("Execution time: %s\n", elapsedTime)
}
