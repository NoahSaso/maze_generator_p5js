// CONFIG
var speed = 1, speedP;
var confirmedRGB = { r: 58, g: 144, b: 39 }, confirmedRGBP;
var searchingRGB = { r: 44, g: 138, b: 217 }, searchingRGBP;
var backgroundRGB = { r: 51, g: 51, b: 51 }, backgroundRGBP;
var cellSize = 20, cellSizeSlider, cellSizeP;
var gridWidth = 800, gridHeight = 800, gridWidthSlider, gridHeightSlider, gridSizeP;
var showUnvisitedWalls = true;
var rgbOptions = ['confirmed', 'searching', 'background'];
var cellSize = 20;
var numRows;
var numCols;
var cells = [];
var startingRow = 0;
var startingCol = 0;
// CONFIG

var stack = [];

function setup() {
  createCanvas(gridWidth, gridHeight);

  // config
  speedP = createP("Speed: " + speed);
  createSlider(1, 100, speed).changed((e) => {
    speed = e.target.value;
    speedP.html("Speed: " + speed);
  });

  // create rgb color options for all in one convenient loop using lots of evals
  for (var rgbOption of rgbOptions) {
    let rgbObj = eval(`${rgbOption}RGB`);
    eval(`${rgbOption}RGBP = createP("${rgbOption.charAt(0).toUpperCase() + rgbOption.substr(1)} Color: rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})")`);
    for (var i = 0; i < 3; i++) {
      let attr = (i == 0 ? "r" : (i == 1 ? "g" : "b"));
      createSlider(0, 255, eval(`${rgbOption}RGB.${attr}`)).changed((e) => {
        eval(`${rgbOption}RGB.${attr} = ${e.target.value}`);
        eval(`${rgbOption}RGBP.html("${rgbOption.charAt(0).toUpperCase() + rgbOption.substr(1)} Color: rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})")`);
      });
    }
    createButton("Reset").mousePressed(() => {
      eval(`${rgbOption}RGB.r = ${rgbObj.r}`);
      eval(`${rgbOption}RGB.g = ${rgbObj.g}`);
      eval(`${rgbOption}RGB.b = ${rgbObj.b}`);
    });
  }

  cellSizeP = createP("Cell Size: " + cellSize);
  createSlider(1, 100, cellSize).changed((e) => {
    cellSize = e.target.value;
    cellSizeP.html("Cell Size: " + cellSize);
    // make width and height multiple of cell size by subtracting remainder
    gridWidth -= (gridWidth % cellSize);
    gridHeight -= (gridHeight % cellSize);
    // remake grid
    setupMazeGrid();
  });

  gridSizeP = createP(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
  createSlider(100, 3000, gridWidth).changed((e) => {
    gridWidth = e.target.value;
    gridSizeP.html(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
    // make width and height multiple of cell size by subtracting remainder
    gridWidth -= (gridWidth % cellSize);
    gridHeight -= (gridHeight % cellSize);
    // remake grid
    setupMazeGrid();
  });
  createSlider(100, 3000, gridHeight).changed((e) => {
    gridHeight = e.target.value;
    gridSizeP.html(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
    // make width and height multiple of cell size by subtracting remainder
    gridWidth -= (gridWidth % cellSize);
    gridHeight -= (gridHeight % cellSize);
    // remake grid
    setupMazeGrid();
  });

  createCheckbox("Show Unvisited Walls", showUnvisitedWalls).changed((e) => {
    showUnvisitedWalls = e.target.checked;
  });

  this.setupMazeGrid();
}

function setupMazeGrid() {
  cells = [];
  numRows = floor(gridHeight / cellSize);
  numCols = floor(gridWidth / cellSize);
  for (var i = 0; i < numRows; i++) {
    let cellCol = [];
    for (var j = 0; j < numCols; j++) {
      cellCol.push(new Cell(i, j));
    }
    cells.push(cellCol);
  }
  let firstCell = cells[startingRow][startingCol];
  firstCell.highlight = true;
  stack = [firstCell];
  resizeCanvas(gridWidth, gridHeight);
}

function draw() {
  background(backgroundRGB.r, backgroundRGB.g, backgroundRGB.b);

  for (var x = 0; x < speed; x++) {
    if (stack.length > 0) {
      let currCell = stack.slice(-1)[0]; // last element of array (stack = LIFO, last in first out)
      currCell.highlight = false;
      let randomUnvisited = currCell.randomUnvisited();
      if (randomUnvisited) {
        let sideIdx = randomUnvisited[0]; // 0 = top, 1 = right, 2 = bottom, 3 = left
        let randomUnvisitedCell = randomUnvisited[1];
        randomUnvisitedCell.highlight = true;
        randomUnvisitedCell.visited = true;
        if (sideIdx == 0) {
          currCell.walls.top = false;
          randomUnvisitedCell.walls.bottom = false;
        } else if (sideIdx == 1) {
          currCell.walls.right = false;
          randomUnvisitedCell.walls.left = false;
        } else if (sideIdx == 2) {
          currCell.walls.bottom = false;
          randomUnvisitedCell.walls.top = false;
        } else if (sideIdx == 3) {
          currCell.walls.left = false;
          randomUnvisitedCell.walls.right = false;
        }
        stack.push(randomUnvisitedCell);
      } else if (stack.length > 0) {
        let cell = stack.pop();
        cell.highlight = true;
        cell.confirmed = true;
      }
    }
  }

  for (var i = 0; i < numRows; i++) {
    for (var j = 0; j < numCols; j++) {
      cells[i][j].show();
    }
  }
}