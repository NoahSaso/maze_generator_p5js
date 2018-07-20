class Cell {

  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.highlight = false;
    this.confirmed = false;
    this.walls = { top: true, right: true, bottom: true, left: true };
  }

  show() {
    stroke(255);
    let xTL = this.col * cellSize;
    let yTL = this.row * cellSize;
    let xTR = xTL + cellSize;
    let yTR = yTL;
    let xBR = xTR;
    let yBR = yTR + cellSize;
    let xBL = xBR - cellSize;
    let yBL = yBR;
    if (this.walls.top && (this.visited || showUnvisitedWalls)) {
      line(xTL, yTL, xTR, yTR);
    }
    if (this.walls.right && (this.visited || showUnvisitedWalls)) {
      line(xTR, yTR, xBR, yBR);
    }
    if (this.walls.bottom && (this.visited || showUnvisitedWalls)) {
      line(xBR, yBR, xBL, yBL);
    }
    if (this.walls.left && (this.visited || showUnvisitedWalls)) {
      line(xBL, yBL, xTL, yTL);
    }
    if (this.highlight || this.confirmed) {
      noStroke();
      if (this.confirmed) {
        fill(confirmedRGB.r, confirmedRGB.g, confirmedRGB.b);
      } else if (this.highlight) {
        fill(searchingRGB.r, searchingRGB.g, searchingRGB.b);
      }
      rect(xTL + 1, yTL + 1, cellSize, cellSize);
    }
  }

  topCell() {
    if (this.row == 0) {
      return false;
    }
    return cells[this.row - 1][this.col];
  }

  rightCell() {
    if (this.col == numCols - 1) {
      return false;
    }
    return cells[this.row][this.col + 1];
  }

  bottomCell() {
    if (this.row == numRows - 1) {
      return false;
    }
    return cells[this.row + 1][this.col];
  }

  leftCell() {
    if (this.col == 0) {
      return false;
    }
    return cells[this.row][this.col - 1];
  }

  randomUnvisited() {
    let cells = [this.topCell(), this.rightCell(), this.bottomCell(), this.leftCell()];
    let idxs = [0, 1, 2, 3];
    // remove false cells (nonexistent) or visited cells from array in place
    for (var i = idxs.length - 1; i >= 0; i--) {
      let cell = cells[i];
      if (!cell || cell.visited) {
        idxs.splice(i, 1);
      }
    }
    // if no unvisited cells around, return false
    if (idxs.length < 1) {
      return false;
    }
    // return random unvisited cell and its index
    let randIdx = random(idxs);
    return [randIdx, cells[randIdx]];
  }

}