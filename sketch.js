// CONFIG
var speed = 1, speedP;
var confirmedRGB = { r: 58, g: 144, b: 39 }, confirmedRGBS = [];
var searchingRGB = { r: 44, g: 138, b: 217 }, searchingRGBS = [];
var backgroundRGB = { r: 51, g: 51, b: 51 }, backgroundRGBS = [];
var wallRGB = { r: 255, g: 255, b: 255 }, wallRGBS = [];
var rgbOptions = ['confirmed', 'searching', 'background', 'wall'];
var cellSize = 20, cellSizeSlider, cellSizeP;
var gridWidth = 500, gridHeight = 500, gridWidthSlider, gridHeightSlider, gridSizeP;
var showUnvisitedWalls = false;
var cellSize = 20;
// CONFIG

var startingRow = 0;
var startingCol = 0;
var cells = [];
var numRows;
var numCols;
var stack = [];

function updateColors() {
  for (var rgbOption of rgbOptions) {
    let rgbObj = window[rgbOption + "RGB"];
    for (var i = 0; i < 3; i++) {
      let attr = (i == 0 ? "r" : (i == 1 ? "g" : "b"));
      rgbObj[attr] = window[rgbOption + "RGBS"][i].value();
    }
    window[rgbOption + "RGBP"].html(`${rgbOption.charAt(0).toUpperCase() + rgbOption.substr(1)} Color: rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`);
  }
}

function setup() {
  createCanvas(gridWidth, gridHeight);

  // config

  createButton("Restart").mousePressed(() => {
    setupMazeGrid();
  }).addClass("spacing");

  speedP = createP("Speed: " + speed);
  createSlider(1, 100, speed).changed((e) => {
    speed = e.target.value;
    speedP.html("Speed: " + speed);
  });

  // create rgb color options for all in one convenient loop
  for (var rgbOption of rgbOptions) {
    let rgbObj = window[rgbOption + "RGB"];
    // store current object as defaults for reset button
    window[rgbOption + 'RGBD'] = Object.assign({}, rgbObj);
    // create p element and store it in a global variable
    window[rgbOption + 'RGBP'] = createP(`${rgbOption.charAt(0).toUpperCase() + rgbOption.substr(1)} Color: rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`);
    // create a slider for each value
    for (var c of ['r', 'g', 'b']) {
      window[rgbOption + 'RGBS'].push(createSlider(0, 255, rgbObj[c]).changed(updateColors));
    }
    createButton("Reset").mousePressed((e) => {
      let rgbOpt = e.target.classList[0];
      // set color object to copy of default
      window[rgbOpt + 'RGB'] = Object.assign({}, window[rgbOpt + 'RGBD']);
      // change label
      let rgbOptObj = window[rgbOpt + 'RGB'];
      window[rgbOpt + "RGBP"].html(`${rgbOpt.charAt(0).toUpperCase() + rgbOpt.substr(1)} Color: rgb(${rgbOptObj.r}, ${rgbOptObj.g}, ${rgbOptObj.b})`);
      // loop through and update sliders
      for (var i = 0; i < 3; i++) {
        let attr = (i == 0 ? "r" : (i == 1 ? "g" : "b"));
        window[rgbOpt + "RGBS"][i].value(rgbOptObj[attr]);
      }
    }).addClass(rgbOption);
  }

  cellSizeP = createP("Cell Size: " + cellSize);
  createSlider(1, 100, cellSize).changed((e) => {
    cellSize = parseInt(e.target.value);
    cellSizeP.html("Cell Size: " + cellSize);
    // make width and height multiple of cell size by subtracting remainder
    gridWidth -= (gridWidth % cellSize);
    gridWidthSlider.value(gridWidth);
    gridHeight -= (gridHeight % cellSize);
    gridHeightSlider.value(gridHeight);
    gridSizeP.html(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
    // remake grid
    setupMazeGrid();
  });

  gridSizeP = createP(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
  gridWidthSlider = createSlider(100, 3000, gridWidth).changed((e) => {
    gridWidth = e.target.value;
    // make width and height multiple of cell size by subtracting remainder
    gridWidth -= (gridWidth % cellSize);
    gridWidthSlider.value(gridWidth);
    gridHeight -= (gridHeight % cellSize);
    gridHeightSlider.value(gridHeight);
    gridSizeP.html(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
    // remake grid
    setupMazeGrid();
  });
  gridHeightSlider = createSlider(100, 3000, gridHeight).changed((e) => {
    gridHeight = e.target.value;
    // make width and height multiple of cell size by subtracting remainder
    gridWidth -= (gridWidth % cellSize);
    gridWidthSlider.value(gridWidth);
    gridHeight -= (gridHeight % cellSize);
    gridHeightSlider.value(gridHeight);
    gridSizeP.html(`Grid Size (must be multiple of cell size, will automatically adjust if not): ${gridWidth}px X ${gridHeight}px`);
    // remake grid
    setupMazeGrid();
  });

  createCheckbox("Show Unvisited Walls", showUnvisitedWalls).changed((e) => {
    showUnvisitedWalls = e.target.checked;
  }).addClass("spacing");

  createButton("Save Image of Maze").mousePressed(() => {
    saveCanvas(`generated_maze_${Math.floor(new Date() / 1000)}.jpg`);
  }).addClass("spacing");

  setupMazeGrid();
}

function setupMazeGrid() {
  cells = [];
  numRows = gridHeight / cellSize;
  numCols = gridWidth / cellSize;
  for (var i = 0; i < numRows; i++) {
    let cellCol = [];
    for (var j = 0; j < numCols; j++) {
      cellCol.push(new Cell(i, j));
    }
    cells.push(cellCol);
  }
  let firstCell = cells[startingRow][startingCol];
  firstCell.visited = true;
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
