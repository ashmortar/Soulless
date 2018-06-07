import Cell from "../data/Cell";

export default class BoardGenerator {
  constructor() {
    this.assignCacheCounter = 0;
    this.assignMonsterCounter = 0;
    this.elements = [];
    this.humanSpace = null;
    this.monsterSpace = null;
    this.cacheTotal = 13;
    this.cellsInRow = 40;
    this.cellsTotal = 1600;
    this.allowedLengthOfWhiteLine = 14 //density
    
  }

  generateBoard() {
    this.createMap();
    this.assignMonsterEdges();
    this.assignHumanStart();
    this.assignMonsterStart();
    this.assignCacheLocations();
    this.echoLocate('initial');
    this.assignImageKeys();
    this.assignImageDecorKeys();
    this.assignImageFogKeys();

    return this.elements;
  }

  createMap = () => {
    this.getGridLayout();
    while (!this.detectClosedLoops()) {
      this.resetWalls();
    }
    this.adjustGrid();
  }

  getGridLayout = () => {
    this.createWalls();
    this.fillAngles();

    for (let i=0; i<this.cellsTotal; i++) {
      if (this.elements[i].value === 0) {
        this.fillGaps(i);
      }
    }
    this.addValuesToCells();
  }

  adjustGrid = () => {
    for (let i=0; i<this.cellsTotal; i++) {
      if (this.elements[i].value === 0) {
        this.fillGaps(i);
      }
    }

    this.addValuesToCells();
  }

  resetWalls = () => {
    this.elements = [];
    this.getGridLayout();
  }

  createWalls = () => {
    for (let i = 0; i < this.cellsTotal; i++) {
      this.elements.push(new Cell(i));
    }

    // creating straight lines of walls
    for (let i = 0; i < 30; i++) { // bug: block goes beyond boundaries
      let randWallType = Math.floor(Math.random() * 2);
      let randStartingPoint = Math.floor(Math.random() * this.cellsTotal);
      let randLength = Math.floor(Math.random() * 4) + 2;

      switch (randWallType) {
        case 0:
          this.createWall_straightVertical(randStartingPoint, randLength);
          break;
        case 1:
          this.createWall_straightHorizontal(randStartingPoint, Math.floor(randLength - 1));
          break;
        default:
          // console.log('');
      }
    }

    this.fillWhiteGaps();
    this.fillWhiteVertLines();
    this.fillWhiteHorLines();

    this.createBorderWalls();
  }

  createBorderWalls = () => {
    this.createWall_straightHorizontal(80, this.cellsInRow / 2);
    this.createWall_straightHorizontal(this.cellsTotal - this.cellsInRow, this.cellsInRow / 2);

    this.createWall_straightVertical(80, this.cellsInRow - 2);
    this.createWall_straightVertical(80 + this.cellsInRow - 1, this.cellsInRow - 2);
  }

  fillGaps = (i) => {
    let counter = 0;
    let counterForExtraGreyCells = 0;
    i += this.cellsInRow;
    while (true) {
      if (this.elements[i].value === 0) {
        for (let c = 0; c < counter; c++) {
          i -= this.cellsInRow;
          this.elements[i].value = 0;
        }
        break;
      }
      else if ((this.elements[i].value === -1) && (i + this.cellsInRow < this.cellsTotal)) {
        i += this.cellsInRow;
        counter++;
        counterForExtraGreyCells++;
      }
      else {
        // white
        if (counterForExtraGreyCells > 2) {
          let j = i;
          while (counterForExtraGreyCells != 2) {
            j -= this.cellsInRow;
            counterForExtraGreyCells--;
            this.elements[j].value = 1;
          }
        }
        else if (counterForExtraGreyCells < 2) {
          let k = i;
          // go back to black
          while (this.elements[k].value != 0) {
            k -= this.cellsInRow;
          }
          if (this.elements[k + this.cellsInRow].value != 0) {
            this.elements[k + this.cellsInRow].value = -1;
          }
          if (this.elements[k + 2 * this.cellsInRow].value != 0) {
            this.elements[k + 2 * this.cellsInRow].value = -1;
          }

        }
        break;
      }
    }
  }

  fillWhiteGaps = () => {
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - 10*this.cellsInRow + 9; i++) {
      if (this.elements[i].value > 0) {


        // square spaces with columns
        let flag = true;
        for (let j=0; j<8; j++) {
          for (let k=0; k<8; k++) {
            if (this.elements[i + j*this.cellsInRow + k].value <= 0) {
              flag = false;
              // break;
            }
          }
        }
        if (flag) {
          // white space 9x9 detected
          this.createWall_squareColumn(i + 4 + 5 * this.cellsInRow);
          // break;
        }

      }
    }
  }

  fillWhiteHorLines = () => {
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - 2*this.cellsInRow - this.allowedLengthOfWhiteLine; i++) {
      if (this.elements[i].value > 0) {

        // horizontal white lines
        let flag = true;
        for (let k = 0; k < this.allowedLengthOfWhiteLine + 1; k++) {
          if (this.elements[i + k].value <= 0) {
            flag = false;
            // break;
          }
        }

        if (flag) {
          // white hor line detected
          this.createWall_straightVertical(i + this.allowedLengthOfWhiteLine + 2 * this.cellsInRow, 2);
        }
      }
    }
  }

  fillWhiteVertLines = () => {
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - this.allowedLengthOfWhiteLine*this.cellsInRow; i++) {
      if (this.elements[i].value > 0) {

        // horizontal white lines
        let flag = true;
        for (let j=0; j<this.allowedLengthOfWhiteLine + 1; j++) {
          if (this.elements[i + j*this.cellsInRow].value <= 0) {
            flag = false;
          }
        }
        if (flag) {
          // white space 9x9 detected
          this.createWall_straightHorizontal(i + this.allowedLengthOfWhiteLine * this.cellsInRow, 1);
        }
      }
    }
  }

  detectClosedLoops = () => {
    let amountOfLoops = 0;
    let loopIndexes = [];
    let cellAmounts = [];
    let cellIndexesInLoops = [];
    // copy gamefield without borders to a separate array
    let gamefield = [];
    let c = 0;
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - 3 * this.cellsInRow - 1; i++) {
      if ((i % 40 != 0) && (i % 40 != 39)) {
        let copy = Object.assign({}, this.elements[i]);
        copy.name = c;
        gamefield.push(copy);
        c++;
      }
    }

    let row = this.cellsInRow - 2;
    let col = this.cellsInRow - 6;
    let thereAreNewItemsInQueue;
    let queue;
    let current_cell;
    let current_zone = 10;
    let cellsInThisLoop = [];
    let cellAmountInThisLoop;

    current_cell = this.findFirstTopLeftCorner(gamefield);

    while (current_cell) {
      loopIndexes.push(this.convertIndex(current_cell.name));
      cellAmountInThisLoop = 1;
      cellsInThisLoop = [];
      amountOfLoops++;
      current_cell.value = current_zone;
      // change values of all empty cells around it to current_zone------------------------------------
      queue = [];
      queue.push(current_cell);

      thereAreNewItemsInQueue = true;

      while (thereAreNewItemsInQueue) {// adding new items in queue; changing their values to current_zone
        thereAreNewItemsInQueue = false;

        queue.forEach((cellInAQueue) => {
          let availableCells = [];
          let index = cellInAQueue.name;
          availableCells = this.getIndexesOfAvailableCellsAround(index, this.cellsInRow - 2, gamefield.length, false);

          availableCells.forEach((availableCellIndex) => {
            if ((gamefield[availableCellIndex].value > 0) && (gamefield[availableCellIndex].value < 10)) {
              gamefield[availableCellIndex].value = current_zone;
              cellAmountInThisLoop++;
              cellsInThisLoop.push(this.convertIndex(availableCellIndex));
              queue.push(gamefield[availableCellIndex]);
              thereAreNewItemsInQueue = true;
            }
          });
        });
      }

      cellAmounts.push(cellAmountInThisLoop);
      cellIndexesInLoops.push(cellsInThisLoop);

      current_zone++;//---------------------------------------------------------------------------------
      current_cell = this.findFirstTopLeftCorner(gamefield);
    }

    // console.log(amountOfLoops);
    // console.log(loopIndexes);
    // console.log(cellAmounts);
    // console.log(cellIndexesInLoops);

    let output = 1;
    if (amountOfLoops > 1) {
      output = this.fillLoops(amountOfLoops, loopIndexes, cellAmounts, cellIndexesInLoops);
    }
    return output;
  }

  fillLoops = (amountOfLoops, loopIndexes, cellAmounts, cellIndexesInLoops) => {
    let max = 0;
    let k;
    for (let i = 0; i < amountOfLoops; i++) {
      if (cellAmounts[i] > max) {
        max = cellAmounts[i];
        k = i;
      }
    }

    let loopIndexes2 = [];
    let cellAmounts2 = [];
    let cellIndexesInLoops2 = [];
    for (let i = 0; i < amountOfLoops; i++) {
      if (i < k) {
        loopIndexes2[i] = loopIndexes[i];
        cellAmounts2[i] = cellAmounts[i];
        cellIndexesInLoops2.push(cellIndexesInLoops[i]);
      }
      else if (i > k) {
        loopIndexes2[i - 1] = loopIndexes[i];
        cellAmounts2[i - 1] = cellAmounts[i];
        cellIndexesInLoops2.push(cellIndexesInLoops[i]);
      }
    }
    amountOfLoops--;


    for (let loop = 0; loop < amountOfLoops; loop++) {
      if (cellAmounts2[loop] > 30) {
        return 0;
      }
      else {
        cellIndexesInLoops2[loop].unshift(loopIndexes2[loop]);
        cellIndexesInLoops2[loop].forEach((cellToFill) => {
          this.elements[cellToFill].value = 0;
        });
      }
    }
    return 1;
  }

  getIndexesOfAvailableCellsAround = (index, row, total, monsterFlag) => {
    let result = [];

    let left = false;
    let right = false;
    let up = false;
    let down = false;

    if (index % row != 0) {
      result.push(index - 1);
      left = true;
    }
    if (index % row != row - 1) {
      result.push(index + 1);
      right = true;
    }
    if (index - row >= 0) {
      result.push(index - row);
      up = true;
    }
    if (index + row < total) {
      result.push(index + row);
      down = true;
    }
    if (monsterFlag) {
      if (left && up) {
        result.push(index - 1 - row);
      }
      if (left && down) {
        result.push(index - 1 + row);
      }
      if (right && up) {
        result.push(index + 1 - row);
      }
      if (right && down) {
        result.push(index + 1 + row);
      }
    }
    return result;
  }

  convertIndex = (i) => {
    return 3 * this.cellsInRow + i + 2 * Math.floor(i/(this.cellsInRow - 2)) + 1;
  }

  findFirstTopLeftCorner = (gamefield) => {
    let row = this.cellsInRow - 2;

    for (let i = 0; i < gamefield.length; i++) {
      if ((gamefield[i].value > 0) && (gamefield[i].value < 10)) {
        if (i === 0) {
          return gamefield[i];
        }
        else if (i % row === 0) {
          if (gamefield[i - row].value <= 0) {
            return gamefield[i];
          }
        }
        else if (i - row < 0) {
          if (gamefield[i - 1].value <= 0) {
            return gamefield[i];
          }
        }
        else {
          if ((gamefield[i - 1].value <= 0) && (gamefield[i - row].value <= 0)) {
            return gamefield[i];
          }
        }
      }
    }
    return null;
  }

  fillAngles = () => {
    for (var i = 0; i < this.cellsTotal; i++) {
      if ((i - 1 >= 0) && (i + 3 * this.cellsInRow < this.cellsTotal)) {
        if (this.elements[i].value === 0) {
          if (this.elements[i - 1].value > 0) {
            if (this.elements[i + this.cellsInRow].value === -1) {

              if (this.elements[i + 3*this.cellsInRow - 1].value === 0) {
                this.elements[i + 3*this.cellsInRow].value = 0;
              }
              if (this.elements[i + 2*this.cellsInRow - 1].value === 0) {
                this.elements[i + 2*this.cellsInRow].value = 0;
              }
              if (this.elements[i + this.cellsInRow - 1].value === 0) {
                this.elements[i + this.cellsInRow].value = 0;
              }
            }
          }
        }
      }

      if ((i + 1 % this.cellsInRow != 0) && (i + 3 * this.cellsInRow < this.cellsTotal)) {
        if (this.elements[i].value === 0) {
          if (this.elements[i + 1].value > 0) {
            if (this.elements[i + this.cellsInRow].value === -1) {

              if (this.elements[i + 3*this.cellsInRow + 1].value === 0) {
                this.elements[i + 3*this.cellsInRow].value = 0;
              }
              if (this.elements[i + 2*this.cellsInRow + 1].value === 0) {
                this.elements[i + 2*this.cellsInRow].value = 0;
              }
              if (this.elements[i + this.cellsInRow + 1].value === 0) {
                this.elements[i + this.cellsInRow].value = 0;
              }
            }
          }
        }
      }
    }
  }

  addValuesToCells = () => {
    // adding values to white cells
    for (let i = 0; i < this.cellsTotal; i++) {
      if (this.elements[i].value > 0) {
        let adjacent = 0;
        let cellsAround = this.getIndexesOfAvailableCellsAround(i, this.cellsInRow, this.cellsTotal, false);

        for (let j = 0; j < cellsAround.length; j++) {
          if (this.elements[cellsAround[j]].value > 0) {
            adjacent++;
          }
        }
        this.elements[i].value = adjacent;
      }
    }
  }

  assignMonsterEdges = () => {
    // TODO comment up code? also try and simplify
    // console.log('assign monster edges');
    for (let i = 0; i < this.cellsTotal; i++) {
      let cell = this.elements[i];
      if (cell.value > 0) {
        let { topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight } = this.getNeighboringCells(i);
        if (topLeft && topLeft.value > 0) {
          cell.monsterEdges.push(topLeft.name);
        }
        if (top && top.value > 0) {
          cell.monsterEdges.push(top.name);
        }
        if (topRight && topRight.value > 0) {
          cell.monsterEdges.push(topRight.name);
        }
        if (left && left.value > 0) {
          cell.monsterEdges.push(left.name);
        }
        if (right && right.value > 0) {
          cell.monsterEdges.push(right.name);
        }
        if (bottomLeft && bottomLeft.value > 0) {
          cell.monsterEdges.push(bottomLeft.name);
        }
        if (bottom && bottom.value > 0) {
          cell.monsterEdges.push(bottom.name);
        }
        if (bottomLeft && bottomLeft.value > 0) {
          cell.monsterEdges.push(bottomLeft.name);
        }
        if (bottomRight && bottomRight.value > 0) {
          cell.monsterEdges.push(bottomRight.name);
        }
      }
    }
  }

  createWall_straightHorizontal = (i, length) => {

    let a = i - 2 * this.cellsInRow;
    let b = i + length * 2 - 1;
    let c = i - 2 * this.cellsInRow + length * 2 - 1;
    let total = this.cellsTotal;

    if ((i >= 0) && (i < total) && (a >= 0) && (a < total) && (b >= 0) && (b < total) && (c >= 0) && (c < total)) {
    // if ((i - 2 * this.cellsInRow >= 0) && ((i + 1) % this.cellsInRow != 0)) {
      for (let j=0; j<length; j++) {
        k = i + 2 * j;
        if (this.elements[k].value != 0) {
          this.elements[k].value = -1;//starting cell
        }
        if (this.elements[k - this.cellsInRow].value != 0) {
          this.elements[k - this.cellsInRow].value = -1;//top first
        }

        this.elements[k - 2 * this.cellsInRow].value = 0;//top second
        if (this.elements[k + 1].value != 0) {
          this.elements[k + 1].value = -1;//right cell
        }
        if (this.elements[k - this.cellsInRow + 1].value != 0) {
          this.elements[k - this.cellsInRow + 1].value = -1;//right top first
        }
        this.elements[k - 2 * this.cellsInRow + 1].value = 0;//right top second
      }
    }
  }

  createWall_straightVertical = (i, length) => {

    if (i + this.cellsInRow * length > this.cellsTotal) {
      length = Math.floor((this.cellsTotal - i) / this.cellsInRow);
    }

    if ((i - 2 * this.cellsInRow >= 0)) {
      for (let j=0; j<length; j++) {
        k = i + 40 * j;
        if (this.elements[k].value != 0) {
          this.elements[k].value = -1;// starting cell
        }
        if (this.elements[k - this.cellsInRow].value != 0) {
          this.elements[k - this.cellsInRow].value = -1;// top first
        }
        this.elements[k - 2 * this.cellsInRow].value = 0;// top second
      }
    }
  }

  createWall_squareColumn = (i) => {
    if ((i - 3 * this.cellsInRow >= 0) && (i+1 % this.cellsInRow != 0) && (i+1 < this.cellsTotal)) {

      for (let j=0; j<2; j++) {
        k = i + j;
        if (this.elements[k].value != 0) {
          this.elements[k].value = -1;// starting cell
        }
        if (this.elements[k - this.cellsInRow].value != 0) {
          this.elements[k - this.cellsInRow].value = -1;// top first
        }
        this.elements[k - 2 * this.cellsInRow].value = 0;// top second
        this.elements[k - 3 * this.cellsInRow].value = 0;// top third
      }
    }
  }

  findShortestPath(start, end) {
    if (start.value < 1 || end.value < 1) {
      return -1;
    }
    let queue = [];
    let visited = [];
    visited.push(start);
    queue.push(start);
    while (queue.length > 0) {
      let cell = queue.shift();
      if (cell === end) {
        break;
      }
      let neighbors = [];
      for (i = 0; i < cell.monsterEdges.length; i++) {
        neighbors.push(this.elements[cell.monsterEdges[i]]);
      }
      for ( let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (!visited.includes(neighbor)) {
          neighbor.parent = cell;
          visited.push(neighbor);
          queue.push(neighbor);
        }
      }
    }
    let path = [];
    let next = end;
    while (next != null) {
      path.push(next);
      next = next.parent;
    }
    this.resetParents()
    return (path.length - 1);
  }

  resetParents = () => {
    for (i = 0; i < this.elements.length; i++) {
      this.elements[i].parent = null;
    }
  }

  resetParents = () => {
    for (i = 0; i < this.elements.length; i++) {
      this.elements[i].parent = null;
    }
  }

  assignHumanStart = () => {
    if (this.humanSpace) {
      this.humanSpace.isRevealed = false;
    }
    let cell = this.getRandomCell();
    while (cell.value < 1) {
      cell = this.getRandomCell();
    }
    cell.hasHuman = true;
    this.humanSpace = cell;
    cell.isRevealed = true;
  }

  assignMonsterStart = () => {
    let cell = this.getRandomCell();
    let distance = this.findShortestPath(cell, this.humanSpace);
    while (distance < 25) {
      // console.log(`assign monster counter: ${this.assignMonsterCounter}`);
      this.assignMonsterCounter++;
      cell = this.getRandomCell();
      distance = this.findShortestPath(cell, this.humanSpace);
      if (this.assignMonsterCounter % 5 === 0) {
        this.assignHumanStart();
      }
    }
    cell.hasMonster = true;
    this.monsterSpace = cell;
  }

  assignCacheLocations = () => {
    let cacheArray = [this.humanSpace, this.monsterSpace];
    for (let i = 1; i <= this.cacheTotal; i++) {
      let cell = this.getRandomCell();
      while (cell.value < 1 || cell.hasHuman || cell.hasMonster || cell.hasCache || this.compareToCacheArray(cell, cacheArray)) {
        cell = this.getRandomCell();
      }
      cell.hasCache = true;
      cell.isRevealed = true;
      cacheArray.push(cell);
    }
  }

  compareToCacheArray = (cell, cacheArray) => {
    this.assignCacheCounter++;
    if (cacheArray.length > 0 ) {
      for (let i = 0; i < cacheArray.length; i++) {
        let distance = this.findShortestPath(cell, cacheArray[i]);
        if (distance < 6) {
          return true;
        }
      }
    }
    return false;
  }

  getNeighboringCells = (i) => {
    let top = null;
    let left = null;
    let right = null;
    let bottom = null;
    let bottomLeft = null;
    let bottomRight = null;
    let topLeft = null;
    let topRight = null;

    if((i - (this.cellsInRow + 1) >= 0) && (i % this.cellsInRow !== 0)) {
      topLeft = this.elements[i - (this.cellsInRow + 1)];
    }
    if (i - this.cellsInRow >= 0) {
      top = this.elements[i - this.cellsInRow];
    }
    if ((i - (this.cellsInRow - 1) >= 0) && (i % this.cellsInRow !== (this.cellsInRow - 1))) {
      topRight = this.elements[i - (this.cellsInRow - 1)];
    }
    if ((i - 1 >= 0) && (i % this.cellsInRow !== 0)) {
      left = this.elements[i - 1];
    }
    if ((i + 1 <= this.cellsTotal) && (i % this.cellsInRow !== (this.cellsInRow - 1))) {
      right = this.elements[i + 1];
    }
    if ((i + (this.cellsInRow - 1) <= this.cellsTotal) && ((i % this.cellsInRow !== 0))) {
      bottomLeft = this.elements[i + (this.cellsInRow - 1)];
    }
    if (i + this.cellsInRow <= this.cellsTotal) {
      bottom = this.elements[i + this.cellsInRow];
    }
    if ((i + (this.cellsInRow + 1) <= this.cellsTotal) && (i % this.cellInRow !== (this.cellsInRow - 1))) {
      bottomRight = this.elements[i + (this.cellsInRow + 1)];
    }
    return ({ top, left, right, bottom, bottomLeft, bottomRight, topLeft, topRight})
  }

  getProbability() {
    return (Math.floor(Math.random() * 1000))
  }

  assignImageKeys = () => {
    for (let i = 0; i < this.elements.length; i++) {
      const { topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight } = this.getNeighboringCells(i);
      let cell = this.elements[i];
      // wall top tiles
      if (cell.value === 0) {
        cell.imageKey = 0;
        // non edge cases
        if (left && top && right && bottom) {
          // wall top northwest
          if (left.value !== 0 && top.value !== 0 && right.value === 0 && bottom.value === 0) {
            cell.imageKey = 1;
          }
          // wall top north
          if (left.value === 0 && top.value !== 0 && right.value === 0 && bottom.value === 0) {
            cell.imageKey = 2;
          }
          // wall top northeast
          if (left.value === 0 && top.value !== 0 && right.value !== 0 && bottom.value === 0) {
            cell.imageKey = 3;
          }
          // wall top west
          if (left.value !== 0 && top.value === 0 && right.value === 0 && bottom.value === 0) {
            cell.imageKey = 4;
          }
          // wall top east
          if (left.value === 0 && top.value === 0 && right.value !== 0 && bottom.value === 0) {
            cell.imageKey = 5;
          }
          // wall top southwest
          if (left.value !== 0 && top.value === 0 && right.value === 0 && bottom.value !== 0) {
            cell.imageKey = 6;
          }
          // wall top south
          if (left.value === 0 && top.value === 0 && right.value === 0 && bottom.value !== 0) {
            cell.imageKey = 7;
          }
          // wall top southeast
          if (left.value === 0 && top.value === 0 && right.value !== 0 && bottom.value !== 0) {
            cell.imageKey = 8;
          }
          // wall top north/south
          if(left.value === 0 && top.value !== 0 && right.value === 0 && bottom.value !== 0) {
            cell.imageKey = 23;
          }
          // wall top east/west
          if (left.value !== 0 && top.value === 0 && right.value !== 0 && bottom.value === 0) {
            cell.imageKey = 24;
          }
          // wall top cap north/south/west
          if (left.value !== 0 && top.value !== 0 && right.value === 0 && bottom.value !== 0) {
            cell.imageKey = 25;
          }
          // wall top cap north/south/east
          if (left.value === 0 && top.value !== 0 && right.value !== 0 && bottom.value !== 0) {
            cell.imageKey = 26;
          }
          // wall top cap north/east/west
          if (left.value !== 0 && top.value !== 0 && right.value !== 0 && bottom.value === 0) {
            cell.imageKey = 27;
          }
          // wall top cap east/south/west
          if (left.value !== 0 && top.value === 0 && right.value !== 0 && bottom.value !== 0) {
            cell.imageKey = 28;
          }
        }
        // top row
        else if (top === null && left && right && bottom) {
          if (bottom.value === 0) {
            cell.imageKey = 9;
          }
          else {
            cell.imageKey = 7;
          }
        }
        // left side
        else if (left === null && top && right && bottom) {
          cell.imageKey = 5;
          if (right.value === 0) {
            cell.imageKey = 9;
          }
          if (bottom.value !== 0) {
            cell.imageKey = 7;
          }
        }
        // right side
        else if (right === null && top && left && bottom) {
          cell.imageKey = 4;
          if (left.value === 0) {
            cell.imageKey = 9;
          }
          if (bottom.value !== 0) {
            cell.imageKey = 7;
          }
          }
      }
      // wall front tiles
      if (cell.value < 0) {
        // cell.imageKey = 14;
      // non edge cases
        if (left && top && right && bottom) {
          // wall front northwest
          if (left.value >= 0 && top.value >= 0 && right.value < 0 && bottom.value < 0) {
            cell.imageKey = 10;
          }
          // wall front north
          if ((left.value < 0 && top.value >= 0 && right.value < 0 && bottom.value < 0) || (left.value >= 0 && top.value >= 0 && right.value >= 0 && bottom.value < 0)) {
            cell.imageKey = 11;
            if (bottomLeft) {
              if (bottomLeft.value !== cell.value) {
                cell.imageKey = 10;
              }
            }
            if (bottomRight) {
              if (bottomRight.value !== cell.value) {
                cell.imageKey = 12;
              }
            }
          }
          // wall front northeast
          if (left.value < 0 && top.value >= 0 && right.value >= 0 && bottom.value < 0) {
            cell.imageKey = 12;
          }
          // wall front southwest
          if (left.value >= 0 && top.value < 0 && right.value < 0 && bottom.value >= 0) {
            cell.imageKey = 13;
          }
          // wall front south
          if ((left.value < 0 && top.value < 0 && right.value < 0 && bottom.value >= 0) || (left.value >= 0 && top.value < 0 && right.value >= 0 && bottom.value >= 0)) {
            cell.imageKey = 14;
            if (topLeft) {
              if (topLeft.value !== cell.value) {
                cell.imageKey = 13;
              }
            }
            if (topRight) {
              if (topRight.value !== cell.value) {
                cell.imageKey = 15;
              }
            }
          }
          // wall front southeast
          if (left.value < 0 && top.value < 0 && right.value >= 0 && bottom.value >= 0) {
            cell.imageKey = 15;
          }
        }
        // bottom row
        else if (bottom === null && left && right) {
          cell.imageKey = 14;
        }
        // left side
        else if (left === null) {
          cell.imageKey = 10;
          if (bottom == null) {
            cell.imageKey = 13;
          }
        }
        // right side
        else if (right === null) {
          cell.imageKey = 12;
          if (bottom == null) {
            cell.imageKey = 15;
          }
        }
      }
      // floor tiles
      if (cell.value > 0) {
        // floor tile northwest
        if (left.value < 1 && top.value < 1 && right.value > 0) {
          cell.imageKey = 17;
        }
        // // floor tile north
        else if (left.value > 0 && top.value < 1 && right.value > 0) {
          let randomValue = this.getProbability();
          if (randomValue < 800) {
            cell.imageKey = 18;
          } else if (randomValue < 900) {
            cell.imageKey = 29;
          } else {
            cell.imageKey = 30;
          }
        }
        // // floor tile northeast
        else if (left.value > 0 && top.value < 1 && right.value < 1) {
          cell.imageKey = 19;
        }
        // // floor tile west
        else if (left.value < 1 && top.value > 0 && right.value > 0) {
          let randomValue = this.getProbability();
          if (randomValue < 900) {
            cell.imageKey = 20;
          } else {
            cell.imageKey = 31;
          }
        }
        // floor tile east
        else if (left.value > 0 && top.value > 0 && right.value < 1) {
          let randomValue = this.getProbability();
          if (randomValue < 900) {
            cell.imageKey = 21;
          } else {
            cell.imageKey = 32;
          }
        }

        else {
          let probability = this.getProbability();
          if (probability < 80) {
            cell.imageKey = 22;
          }
          else if (probability < 160) {
            cell.imageKey = 17;
          }
          else if (probability < 240) {
            cell.imageKey = 38;
          }
          else if (probability < 320) {
            cell.imageKey = 33;
          }
          else if (probability < 400) {
            cell.imageKey = 34;
          }
          else if (probability < 480) {
            cell.imageKey = 35;
          }
          else if (probability < 643) {
            cell.imageKey = 31;
          }
          else if (probability < 679) {
            cell.imageKey = 21;
          }
          else if (probability < 715) {
            cell.imageKey = 18;
          }
          else if (probability < 751) {
            cell.imageKey = 20;
          }
          else if (probability < 787) {
            cell.imageKey = 30;
          }
          else if (probability < 823) {
            cell.imageKey = 29;
          }
          else if (probability < 859) {
            cell.imageKey = 32;
          }
          else if (probability < 895) {
            cell.imageKey = 17;
          }
          else if (probability < 988) {
            cell.imageKey = 19;
          }
          else if (probability < 991) {
            cell.imageKey = 40;
          }
          else if (probability < 994) {
            cell.imageKey = 39;
          }
          else if (probability < 996) {
            cell.imageKey = 36;
          }
          else if (probability < 999) {
            cell.imageKey = 41;
          }
          else {
            cell.imageKey = 42;
          }
        }
      }
    }

  }

  isACacheIsland = (element) => {
    let res = false;
    let cellsAround = this.getIndexesOfAvailableCellsAround(element.name, this.cellsInRow, this.cellsTotal, true);
    if ((element.isRevealed) && (element.hasCache)) {
      res = true;
      for (let i = 0; i < cellsAround.length; i++) {
        if (this.elements[cellsAround[i]].isRevealed) {
          res = false;
          break;
        }
      }
      return res;
    }
    else {
      return res;
    }
  }

  assignImageFogKeys = () => {

    for (let i = 0; i < this.elements.length; i++) {
      if ((this.elements[i].isRevealed)) {

        if (this.elements[i].imageFogKey) { this.elements[i].imageFogKey = 0; }

        if ((i % this.cellsInRow > 0) && (i - this.cellsInRow >= 0)) {
          if ((!this.elements[i - 1].isRevealed) && (!this.elements[i - this.cellsInRow].isRevealed)) {
              this.elements[i - this.cellsInRow - 1].imageFogKey = 1;//nw
          }
          if ((this.elements[i - 1].isRevealed) && (this.elements[i - this.cellsInRow].isRevealed) && (!this.elements[i - 1 - this.cellsInRow].isRevealed)) {
              this.elements[i - 1 - this.cellsInRow].imageFogKey = 9;
          }
        }

        if ((i + 1 < this.cellsTotal) && (i + 1 % this.cellsInRow != 0) && (i - this.cellsInRow >= 0)) {
          if ((!this.elements[i + 1].isRevealed) && (!this.elements[i - this.cellsInRow].isRevealed)) {
              this.elements[i - this.cellsInRow + 1].imageFogKey = 3;//ne
          }
          if ((this.elements[i + 1].isRevealed) && (this.elements[i - this.cellsInRow].isRevealed) && (!this.elements[i + 1 - this.cellsInRow].isRevealed)) {
              this.elements[i + 1 - this.cellsInRow].imageFogKey = 9;
          }
        }

        if ((i % this.cellsInRow > 0) && (i + this.cellsInRow < this.cellsTotal)) {
          if ((!this.elements[i - 1].isRevealed) && (!this.elements[i + this.cellsInRow].isRevealed)) {
              this.elements[i + this.cellsInRow - 1].imageFogKey = 7;//sw
          }
          if ((this.elements[i - 1].isRevealed) && (this.elements[i + this.cellsInRow].isRevealed) && (!this.elements[i - 1 + this.cellsInRow].isRevealed)) {
              this.elements[i - 1 + this.cellsInRow].imageFogKey = 9;
          }
        }

        if ((i + 1 < this.cellsTotal) && (i + 1 % this.cellsInRow != 0) && (i + this.cellsInRow < this.cellsTotal)) {
          if ((!this.elements[i + 1].isRevealed) && (!this.elements[i + this.cellsInRow].isRevealed)) {
              this.elements[i + this.cellsInRow + 1].imageFogKey = 5;//se
          }
          if ((this.elements[i + 1].isRevealed) && (this.elements[i + this.cellsInRow].isRevealed) && (!this.elements[i + 1 + this.cellsInRow].isRevealed)) {
              this.elements[i + 1 + this.cellsInRow].imageFogKey = 9;
          }
        }

        if (i % this.cellsInRow > 0) {
          if ((!this.elements[i - 1].isRevealed) && (this.elements[i - 1].imageFogKey != 9)) {//w
              this.elements[i - 1].imageFogKey = 8;
          }
        }
        if ((i + 1 < this.cellsTotal) && (i + 1 % this.cellsInRow != 0)) {
          if ((!this.elements[i + 1].isRevealed) && (this.elements[i + 1].imageFogKey != 9)) {//e
              this.elements[i + 1].imageFogKey = 4;
          }
        }
        if (i - this.cellsInRow >= 0) {
          if ((!this.elements[i - this.cellsInRow].isRevealed) && (this.elements[i - this.cellsInRow].imageFogKey != 9)) {//n
              this.elements[i - this.cellsInRow].imageFogKey = 2;
          }
        }
        if (i + this.cellsInRow < this.cellsTotal) {
          if ((!this.elements[i + this.cellsInRow].isRevealed) && (this.elements[i + this.cellsInRow].imageFogKey != 9)) {//s
              this.elements[i + this.cellsInRow].imageFogKey = 6;
          }
        }
      }
    }

    for (let i = 0; i < this.cellsTotal; i++) {
      if (this.elements[i].imageFogKey > 0) {
        this.elements[i].isSemiRevealed = true;
      }
    }
  }

  adjustFog = () => {
    let cellsAround;
    let toReveal = false;
    for (let i = 0; i < this.cellsTotal; i++) {
      toReveal = true;
      if (this.elements[i].imageFogKey > 0) {
        cellsAround = this.getIndexesOfAvailableCellsAround(i, this.cellsInRow, this.cellsTotal, false);
        for (let j = 0; j < cellsAround.length; j++) {
          if ((!this.elements[cellsAround[j]].isRevealed) && (!this.elements[cellsAround[j]].isSemiRevealed)) {
            toReveal = false;
            break;
          }
        }
        if (toReveal) {
          this.elements[i].isRevealed = true;
        }
      }
    }
    this.assignImageFogKeys();
  }

  assignImageDecorKeys = () => {
    let greyBottomWalls = [];
    for (let i = 0; i < this.elements.length; i++) {
      if (i < this.cellsTotal - 3 * this.cellsInRow) {
        if (this.elements[i].value === -1) {
          if ((i - this.cellsInRow > 0) && (i - 1 >= 0) && (i + 1 < this.cellsTotal)) {
            if ((this.elements[i - this.cellsInRow].value === -1) && (this.elements[i - 1].value === -1) && (this.elements[i + 1].value === -1)) {
              greyBottomWalls.push(i);
              // this.elements[i].isHighlighted = true;
            }
          }
        }
      }
    }
    let numberOfTubes1 = 3;
    let numberOfTubes2 = 4;
    for (let i = 0; i < numberOfTubes1; i++) {
      this.elements[greyBottomWalls[Math.floor(Math.random() * greyBottomWalls.length)]].imageDecorKey = 1;
    }

    for (let i = 0; i < numberOfTubes2 / 2; i++) {
      let rand = Math.floor(Math.random() * (greyBottomWalls.length / 2));
      while ((this.elements[greyBottomWalls[rand]].imageDecorKey != 0) || (this.elements[greyBottomWalls[rand] + 1].imageDecorKey != 0) || (this.elements[greyBottomWalls[rand] - 1].imageDecorKey != 0)) {
        rand = Math.floor(Math.random() * (greyBottomWalls.length / 2));
      }
      this.elements[greyBottomWalls[rand]].imageDecorKey = 2;
    }

    for (let i = numberOfTubes2 / 2; i < numberOfTubes2; i++) {
      let rand = Math.floor(Math.random() * (greyBottomWalls.length / 2)) + Math.floor(greyBottomWalls.length / 2);
      while ((this.elements[greyBottomWalls[rand]].imageDecorKey != 0) || (this.elements[greyBottomWalls[rand] + 1].imageDecorKey != 0) || (this.elements[greyBottomWalls[rand] - 1].imageDecorKey != 0)) {
        rand = Math.floor(Math.random() * (greyBottomWalls.length / 2)) + Math.floor(greyBottomWalls.length / 2);
      }
      this.elements[greyBottomWalls[rand]].imageDecorKey = 2;
    }
  }

  getRandomCell = () => (this.elements[Math.floor(Math.random() * this.cellsTotal)])

  resetHighlighted = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].isHighlighted = false;
    }
  }

  resetWasPounced = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].wasPounced = false;
    }
  }

  resetWasEchoed = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].wasEchoed = false;
    }
  }

  echoLocate = (direction) => {
    const splashScreenTimer = 500;
    const index = this.humanSpace.name;
    let { topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight } = this.getNeighboringCells(index);
    switch (direction) {

      case 'initial' :

        topLeft.isRevealed = true;
        top.isRevealed = true;
        topRight.isRevealed = true;
        left.isRevealed = true;
        right.isRevealed = true;
        bottomLeft.isRevealed = true;
        bottom.isRevealed = true;
        bottomRight.isRevealed = true;
        break;

      default:
        break; 
    }
    this.assignImageFogKeys();
    // this.adjustFog();
  }
}