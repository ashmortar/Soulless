import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Picker, View, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid, AnimatedGrid } from '../components/Grid';
import WallTemplate from '../data/WallTemplate';
import Cell from '../data/Cell';
import Engine from './Engine';

class Game extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  constructor() {
    super();
    this.scale = 0;
    this.elements = [];
    this.start = null;
    this.end = null;
    this.counter = 0;
    this.humanSpace = null;
    this.monsterSpace = null;
    this.cacheTotal = 13;
    this.cellsInRow = 40;
    this.cellsTotal = 1600;
    // offset should be so that edge walls correspond to scroll bounce
    this.cellsPerScreen = 6;
    this.scrollOffset = Math.floor(this.cellsPerScreen / 2);
    let { width, height } = Dimensions.get("window");
    this.viewPortWidth = width;
    this.viewPortHeight = height;
    this.zoomedInValue = Math.ceil(this.viewPortWidth / this.cellsPerScreen);
    this.zoomedOutValue = Math.ceil(this.viewPortWidth / this.cellsInRow);
    this.fullGameDimension = this.zoomedInValue * this.cellsInRow;
    this.zoom = 'close';
    this.allowedLengthOfWhiteLine = 14;//density

    this.state = {
      redraw: false,
      isHuman: false,
      echoDirection: 'radius',
      playerSpace: { name: 0 },
      boardFinished: false,
    };
  }

  componentDidMount() {

    this.createMap();

    this.assignHumanStart();
    this.assignMonsterStart();
    this.assignCacheLocations();
    this.assignImageKeys();
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

    //creating straight lines of walls
    for (let i = 0; i < 30; i++) {//bug: block goes beyond boundaries
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
          console.log('');
      }
    }

    this.fillWhiteGaps();
    this.fillWhiteVertLines();
    this.fillWhiteHorLines();

    this.createBorderWalls();
  }

  createBorderWalls = () => {
    this.createWall_straightHorizontal(80, this.cellsInRow/2);
    this.createWall_straightHorizontal(this.cellsTotal - this.cellsInRow, this.cellsInRow/2);

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
        //white
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
          //go back to black
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


        //square spaces with columns
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
          //white space 9x9 detected
          this.createWall_squareColumn(i + 4 + 5 * this.cellsInRow);
          // break;
        }

      }
    }
  }

  fillWhiteHorLines = () => {
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - 2*this.cellsInRow - this.allowedLengthOfWhiteLine; i++) {
      if (this.elements[i].value > 0) {

        //horizontal white lines
        let flag = true;
        for (let k = 0; k < this.allowedLengthOfWhiteLine + 1; k++) {
          if (this.elements[i + k].value <= 0) {
            flag = false;
            // break;
          }
        }

        if (flag) {
          //white hor line detected
          this.createWall_straightVertical(i + this.allowedLengthOfWhiteLine + 2 * this.cellsInRow, 2);
        }
      }
    }
  }

  fillWhiteVertLines = () => {
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - this.allowedLengthOfWhiteLine*this.cellsInRow; i++) {
      if (this.elements[i].value > 0) {

        //horizontal white lines
        let flag = true;
        for (let j=0; j<this.allowedLengthOfWhiteLine + 1; j++) {
          if (this.elements[i + j*this.cellsInRow].value <= 0) {
            flag = false;
          }
        }
        if (flag) {
          //white space 9x9 detected
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
    //copy gamefield without borders to a separate array
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
      //change values of all empty cells around it to current_zone------------------------------------
      queue = [];
      queue.push(current_cell);

      thereAreNewItemsInQueue = true;

      while (thereAreNewItemsInQueue) {//adding new items in queue; changing their values to current_zone
        thereAreNewItemsInQueue = false;

        queue.forEach((cellInAQueue) => {
          let availableCells = [];
          let index = cellInAQueue.name;
          availableCells = this.getCellsIndexes(index);

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

  getCellsIndexes = (index) => {
    let row = this.cellsInRow - 2;
    let total = 1292;

    let result = [];
    if (index % row != 0) {
      result.push(index - 1);
    }
    if (index % row != row - 1) {
      result.push(index + 1);
    }
    if (index - row >= 0) {
      result.push(index - row);
    }
    if (index + row < total) {
      result.push(index + row);
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
      // left: i+1
      // right: i-1
      // top: i-20
      // bottom: i+20
      if (this.elements[i].value > 0) {
        let adjacent = 0;
        if ((i % this.cellsInRow != (this.cellsInRow - 1)) && (this.elements[i + 1].value > 0)) {
          adjacent++;
          this.elements[i].humanEdges.push(this.elements[i + 1]);
          this.elements[i].monsterEdges.push(this.elements[i + 1]);
        }
        if ((i % this.cellsInRow > 0) && (this.elements[i - 1].value > 0)) {
          adjacent++;
          this.elements[i].humanEdges.push(this.elements[i - 1]);
          this.elements[i].monsterEdges.push(this.elements[i - 1]);
        }
        if ((i - this.cellsInRow >= 0) && (this.elements[i - this.cellsInRow].value > 0)) {
          adjacent++;
          this.elements[i].humanEdges.push(this.elements[i - this.cellsInRow]);
          this.elements[i].monsterEdges.push(this.elements[i - this.cellsInRow]);
        }
        if ((i + this.cellsInRow < this.cellsTotal) && (this.elements[i + this.cellsInRow].value > 0)) {
          adjacent++;
          this.elements[i].humanEdges.push(this.elements[i + this.cellsInRow]);
          this.elements[i].monsterEdges.push(this.elements[i + this.cellsInRow]);
        }
        if (i % this.cellsInRow != (this.cellsInRow - 1) && (i - (this.cellsInRow - 1) > 0) && this.elements[i - (this.cellsInRow - 1)].value > 0) {
          this.elements[i].monsterEdges.push(this.elements[i - (this.cellsInRow - 1)]);
        }
        if (i % this.cellsInRow != (this.cellsInRow - 1) && (i + (this.cellsInRow + 1) < this.cellsTotal && this.elements[i + (this.cellsInRow + 1)].value > 0)) {
          this.elements[i].monsterEdges.push(this.elements[i + (this.cellsInRow + 1)]);
        }
        if (i % this.cellsInRow != 0 && (i - (this.cellsInRow + 1) > 0) && (this.elements[i - (this.cellsInRow + 1).value > 0])) {
          this.elements[i].monsterEdges.push(this.elements[i - (this.cellsInRow + 1)]);
        }
        if (i % 20 != 0 && (i + (this.cellsInRow - 1) < this.cellsTotal) && (this.elements[i + (this.cellsInRow - 1)].value > 0)) {
          this.elements[i].monsterEdges.push(this.elements[i + (this.cellsInRow - 1)]);
        }
        this.elements[i].value = adjacent;
      }
    }
  }

  createWall_straightHorizontal = (i, length) => {
    if ((i - 2 * this.cellsInRow >= -1) && ((i + 1) % this.cellsInRow != 0)) {
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

    if ((i - 2 * this.cellsInRow >= -1)) {
      for (let j=0; j<length; j++) {
        k = i + 40 * j;
        if (this.elements[k].value != 0){
          this.elements[k].value = -1;//starting cell
        }
        if (this.elements[k - this.cellsInRow].value != 0){
          this.elements[k - this.cellsInRow].value = -1;//top first
        }
        this.elements[k - 2 * this.cellsInRow].value = 0;//top second
      }
    }
  }

  createWall_squareColumn = (i) => {
    if ((i - 3 * this.cellsInRow >= 0) && (i+1 % this.cellsInRow != 0) && (i+1 < this.cellsTotal)) {

      for (let j=0; j<2; j++) {
        k = i + j;
        if (this.elements[k].value != 0){
          this.elements[k].value = -1;//starting cell
        }
        if (this.elements[k - this.cellsInRow].value != 0){
          this.elements[k - this.cellsInRow].value = -1;//top first
        }
        this.elements[k - 2 * this.cellsInRow].value = 0;//top second
        this.elements[k - 3 * this.cellsInRow].value = 0;//top third
      }
    }
  }

  findShortestPath(start, end) {
    // array of cells to be checked
    let queue = [];
    // all cells already checked
    let visited = [];
    // shortest path from end to beginning following parents
    let path = [];

    // add starting square to the queue
    queue.push(start);

    // process the queue
    while (queue.length > 0) {
      // remove the first item
      let cell = queue.shift();
      // see if we have been to this cell before
      if (!visited.includes(cell)) {
        // if not visited check to see if it is the end
        if (cell === end) {
          // if it is the end add it to the path
          // cell.isHighlighted = true;
          path.push(cell);
          // assign the next variable to the parent of the final cell
          let next = cell.parent;
          // continue up the chain of parents until we run out
          while (next) {
            // add to path
            // next.isHighlighted = true;
            path.push(next);
            // reassign next to parent
            next = next.parent;
            if (path.length > 150) {
              break;
            }
          }
          // log the path
          // quit the function
          break;

        // if not the end find edges
        } else {
          // assign connections array as all edges from cell
          let connections = cell.monsterEdges;
          // iterate through the edges and push them into the queue
          for (let i = 0; i < connections.length; i++) {
            let neighbor = connections[i];
            if (neighbor !== start && neighbor.parent === null) {
              neighbor.parent = cell;
            }
            queue.push(neighbor);
          }
          // add our cell to the visited array
          visited.push(cell);
        }
      }
    }
    if (path.length === 0) {
    }
    // this.setState({ redraw: !this.state.redraw });
    setTimeout(this.resetGrid, 50);
    return path.length - 1;
  }

  assignHumanStart = () => {
    let cell = this.getRandomCell();
    while (cell.value < 1) {
      cell = this.getRandomCell();
    }
    cell.hasHuman = true;
    cell.isRevealed = true;
    this.humanSpace = cell;
    if(this.state.isHuman) {
      this.setState({ playerSpace: cell });
    }
  }

  assignMonsterStart = () => {
    let cell = this.getRandomCell();
    let distance = this.findShortestPath(cell, this.humanSpace);
    while (cell.value < 1 || distance < 20) {
      cell = this.getRandomCell();
      distance = this.findShortestPath(cell, this.humanSpace);
    }
    cell.hasMonster = true;
    this.monsterSpace = cell;
    if (!this.state.isHuman) {
      this.setState({ playerSpace: cell });
    }
  }

  assignCacheLocations = () => {
    for (let i = 0; i <= this.cacheTotal; i++) {
      let cell = this.getRandomCell();
      while (cell.value < 1 || cell.hasHuman || cell.hasMonster || cell.hasCache) {
        cell = this.getRandomCell();
      }
      cell.hasCache = true;
      cell.isRevealed = true;
    }
  }

  assignImageKeys = () => {
    for (let i = 0; i < this.elements.length; i++) {
      let topLeft = null;
      let top = null;
      let topRight = null;
      let left = null;
      let right = null;
      let bottomLeft = null;
      let bottom = null;
      let bottomRight = null;
      if (i - (this.cellsInRow + 1) >= 0) {
        topLeft = this.elements[i - (this.cellsInRow + 1)];
      }
      if (i - this.cellsInRow >= 0) {
        top = this.elements[i - this.cellsInRow];
      }
      if (i - (this.cellsInRow - 1) >= 0) {
        topRight = this.elements[i - (this.cellsInRow - 1)];
      }
      if (i - 1 >= 0) {
        left = this.elements[i - 1];
      }
      if (i + 1 <= this.cellsTotal) {
        right = this.elements[i + 1];
      }
      if (i + (this.cellsInRow - 1) <= this.cellsTotal) {
        bottomLeft = this.elements[i + (this.cellsInRow - 1)];
      }
      if (i + this.cellsInRow <= this.cellsTotal) {
        bottom = this.elements[i + this.cellsInRow];
      }
      if (i + (this.cellsInRow + 1)) {
        bottomRight = this.elements[i + (this.cellsInRow + 1)];
      }
      let cell = this.elements[i];
      // wall top tiles
      if (cell.value === 0) {
        // non edge cases
        if (left && top && right && bottom) {
          // wall top northwest
          if (left.value !== 0 && top.value !== 0 && right.value === 0 && bottom.value === 0) {
            cell.imageKey = "wall-t-nw";
          }
          // wall top north
          if (left.value === 0 && top.value !== 0 && right.value === 0 && bottom.value === 0) {
            cell.imageKey = "wall-t-n";
          }
          // wall top northeast
          if (left.value === 0 && top.value !== 0 && right.value !== 0 && bottom.value === 0) {
            cell.imageKey = "wall-t-ne";
          }
          // wall top west
          if (left.value !== 0 && top.value === 0 && right.value === 0 && bottom.value === 0) {
            cell.imageKey = "wall-t-w";
          }
          // wall top east
          if (left.value === 0 && top.value === 0 && right.value !== 0 && bottom.value === 0) {
            cell.imageKey = 'wall-t-e';
          }
          // wall top southwest
          if (left.value !== 0 && top.value === 0 && right.value === 0 && bottom.value !== 0) {
            cell.imageKey = 'wall-t-sw';
          }
          // wall top south
          if (left.value === 0 && top.value === 0 && right.value === 0 && bottom.value !== 0) {
            cell.imageKey = 'wall-t-s';
          }
          // wall top southeast
          if (left.value === 0 && top.value === 0 && right.value !== 0 && bottom.value !== 0) {
            cell.imageKey = 'wall-t-se';
          } else {
            cell.imageKey = 'wall-t-c';
          }
          // top corners
        } else if ((top === null && left === null && right && bottom) || (top === null && right === null && right && bottom)) {
          cell.imageKey = 'wall-t-c';
          // top row
        } else if (top === null && left && right && bottom) {
          if (bottom.value === 0) {
            cell.imageKey = 'wall-t-c';
          } else {
            cell.imageKey = 'wall-t-s';
          }
          // left side
        } else if (left === null && top && right && bottom) {
          if (right.value === 0) {
            cell.imageKey = 'wall-t-c';
          } else {
            cell.imageKey = 'wall-t-e';
          }
          // right side
        } else if (right === null && top && left && bottom) {
          if (left.value === 0) {
            cell.imageKey = 'wall-t-c';
          } else {
            cell.imageKey = 'wall-t-w';
          }
        }
      }
      // wall front tiles
      if (cell.value < 0) {
      // non edge cases
        if (left && top && right && bottom) {
          // wall front northwest
          if (left.value >= 0 && top.value >= 0 && right.value < 0 && bottom.value < 0) {
            cell.imageKey = "wall-f-nw-2";
          }
          // wall front north
          if ((left.value < 0 && top.value >= 0 && right.value < 0 && bottom.value < 0) || (left.value >= 0 && top.value >= 0 && right.value >= 0 && bottom.value < 0)) {
            cell.imageKey = "wall-f-n-1";
          }
          // wall front northeast
          if (left.value < 0 && top.value >= 0 && right.value >= 0 && bottom.value < 0) {
            cell.imageKey = "wall-f-ne-2";
          }
          // wall front southwest
          if (left.value >= 0 && top.value < 0 && right.value < 0 && bottom.value >= 0) {
            cell.imageKey = 'wall-f-sw-2';
          }
          // wall front south
          if ((left.value < 0 && top.value < 0 && right.value < 0 && bottom.value >= 0) || (left.value >= 0 && top.value < 0 && right.value >= 0 && bottom.value >= 0)) {
            cell.imageKey = 'wall-f-s-1';
          }
          // wall front southeast
          if (left.value < 0 && top.value < 0 && right.value >= 0 && bottom.value >= 0) {
            cell.imageKey = 'wall-f-se-2';
          }
          else {
            cell.imageKey = "wall-f-n-3";
          }
        } else {
          cell.imageKey = "wall-f-n-3";
        }
      }
      // floor tiles
      if (cell.value > 0) {
        // floor tile northwest
        if (left.value < 1 && top.value < 1 && right.value > 0 && bottom.value > 0) {
          cell.imageKey = 'floor-nw';
        }
        // floor tile north
        if (left.value > 0 && top.value < 1 && right.value > 0 && bottom.value > 0) {
          cell.imageKey = 'floor-n-1';
        }
        // floor tile northeast
        if (left.value > 0 && top.value < 1 && right.value < 1 && bottom.value > 0) {
          cell.imageKey = 'floor-ne';
        }
        // floor tile west
        if (left.value < 1 && top.value > 0 && right.value > 0 && bottom.value > 0) {
          cell.imageKey = 'floor-w-1';
        }
        // floor tile east
        if (left.value > 0 && top.value > 0 && right.value < 1 && bottom.value > 0) {
          cell.imageKey = 'floor-e-1';
        } else {
          cell.imageKey = 'floor-c-1';
        }
      }
    }
    let imageKeys = [];
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i].imageKey === null) {
        imageKeys.push(this.elements[i].name);
      }
    }
    this.setState({ boardFinished: true });
    console.log(this.elements, imageKeys);
  }

  getRandomCell = () => (this.elements[Math.floor(Math.random() * this.cellsTotal)])

  resetGrid = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].isHighlighted = false;
      this.elements[i].parent = null;
    }
  }

  echoLocate = () => {
    const item = this.humanSpace;
    const direction = this.state.echoDirection;
    switch (direction) {
      case 'north':
        if (item.name - this.cellsInRow < 0) {
          Alert.alert(
            'Uh-Oh',
            'Cannot Echo-locate North from here..',
          );
        } else {
          let cell = this.elements[item.name - this.cellsInRow];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if (cell.name - this.cellsInRow > 0) {
              cell = this.elements[cell.name - this.cellsInRow];
            } else {
              break;
            }
          }
        }
        break;

      case 'east':
        if (item.name % this.cellsInRow === (this.cellsInRow - 1)) {
          Alert.alert(
            'Uh-Oh',
            'Cannot Echo-locate East from here..',
          );
        } else {
          let cell = this.elements[item.name + 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if ((cell.name + 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name + 1];
            }
          }
        }
        break;

      case 'south':
        if (item.name + this.cellsInRow > this.cellsTotal) {
          Alert.alert(
            'Uh-Oh',
            'Cannot Echo-locate South from here..',
          );
        } else {
          let cell = this.elements[item.name + this.cellsInRow];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if (cell.name + this.cellsInRow < this.cellsTotal) {
              cell = this.elements[cell.name + this.cellsInRow];
            } else {
              break;
            }
          }
        }
        break;

      case 'west':
        if (item.name % this.cellsInRow === 0) {
          Alert.alert(
            'Uh-Oh',
            'Cannot Echo-locate West from here..',
          );
        } else {
          let cell = this.elements[item.name - 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if ((cell.name - 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name - 1];
            }
          }
        }
        break;

      case 'radius':
        const i = item.name;
        if ((i % this.cellsInRow != 0) && (i - (this.cellsInRow + 1) > 0) && (this.elements[i - (this.cellsInRow + 1)].value != 0)) {
          this.elements[i - (this.cellsInRow + 1)].isRevealed = true;
        }
        if ((i - this.cellsInRow > 0) && (this.elements[i - this.cellsInRow].value != 0)) {
          this.elements[i - this.cellsInRow].isRevealed = true;
        }
        if ((i % this.cellsInRow != (this.cellsInRow - 1)) && (i - (this.cellsInRow - 1) > 0 && this.elements[i - (this.cellsInRow - 1)].value != 0)) {
          this.elements[i - (this.cellsInRow - 1)].isRevealed = true;
        }
        if ((i % this.cellsInRow != (this.cellsInRow - 1)) && (this.elements[i + 1].value != 0)) {
          this.elements[i + 1].isRevealed = true;
        }
        if ((i % this.cellsInRow != (this.cellsInRow - 1)) && (i + (this.cellsInRow + 1) < this.cellsTotal && this.elements[i + (this.cellsInRow + 1)].value != 0)) {
          this.elements[i + (this.cellsInRow + 1)].isRevealed = true;
        }
        if ((i + this.cellsInRow < this.cellsTotal) && (this.elements[i + this.cellsInRow].value != 0)) {
          this.elements[i + this.cellsInRow].isRevealed = true;
        }
        if ((i % this.cellsInRow != 0) && (i + (this.cellsInRow - 1) < this.cellsTotal && this.elements[i + (this.cellsInRow - 1)].value != 0)) {
          this.elements[i + (this.cellsInRow - 1)].isRevealed = true;
        }
        if ((i % this.cellsInRow != 0) && (this.elements[i - 1].value != 0)) {
          this.elements[i - 1].isRevealed = true;
        }
        break;

      default:
        break;
    }
    this.setState({ redraw: !this.state.redraw });
  }

  showHumanMoves = () => {
    let i = this.humanSpace.name;
    // north
    if (i - this.cellsInRow > 0) {
      let cell = this.elements[i - this.cellsInRow];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if (cell.name - this.cellsInRow > 0) {
          cell = this.elements[cell.name - this.cellsInRow];
        } else {
          break;
        }
      }
    }
    // east
    if (i % this.cellsInRow !== (this.cellsInRow - 1)) {
      let cell = this.elements[i + 1];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if ((cell.name + 1) % this.cellsInRow === 0) {
          break;
        } else {
          cell = this.elements[cell.name + 1];
        }
      }
    }
    // south
    if (i + this.cellsInRow < this.cellsTotal) {
      let cell = this.elements[i + this.cellsInRow];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if (cell.name + this.cellsInRow < this.cellsTotal) {
          cell = this.elements[cell.name + this.cellsInRow];
        } else {
          break;
        }
      }
    }
    // west
    if (i % this.cellsInRow !== 0) {
      let cell = this.elements[i - 1];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if ((cell.name - 1) % this.cellsInRow === (this.cellsInRow - 1)) {
          break;
        } else {
          cell = this.elements[cell.name - 1];
        }
      }
    }
    this.setState({ redraw: !this.state.redraw });
  }

  moveHuman = (item) => {
    if (item.isHighlighted) {
      this.elements[this.humanSpace.name].hasHuman = false;
      item.hasHuman = true;
      this.humanSpace = item;
      this.setState({ playerSpace: item });
      this.resetGrid();
    } else {
      Alert.alert(
        'Uh-Oh',
        'Please select a highlighted space',
      );
    }
    this.setState({ redraw: !this.state.redraw });
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  handlePressGridItem = (item) => {
    if (this.counter === 0) {
      this.start = item;
      this.counter = 1;
    } else if (this.counter === 1) {
      this.end = item;
      this.findShortestPath(this.start, this.end);
      this.counter = 0;
    }
  };

  handleChangePlayer = () => {
    if (this.state.isHuman) {
      this.setState({
        isHuman: false,
        playerSpace: this.monsterSpace,
      });
    } else {
      this.setState({
        isHuman: true,
        playerSpace: this.humanSpace,
      });
    }
  }

  renderHeader = () => {
    return (
      <View style={{ marginBottom: 20, marginTop: 40 }}>
        <Text>Game screen</Text>

        <TouchableOpacity onPress={this.onPressZoomIn} style={{ width: 20 }}>
          <View style={{
            backgroundColor: '#fff',
            alignItems: 'center',
            marginTop: 15,
            borderRadius: 10,
            borderColor: '#000',
            borderWidth: 1,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>+</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={this.onPressZoomOut} style={{ width: 20 }}>
          <View style={{
            backgroundColor: '#fff',
            alignItems: 'center',
            marginTop: 5,
            borderRadius: 10,
            borderColor: '#000',
            borderWidth: 1,
          }}>
            <Text style={{ fontWeight: 'bold' }}>-</Text>
          </View>
        </TouchableOpacity>

      </View>
    );
  };

  renderFooter = () => {
    return (
      <View style={{ marginBottom: 20, marginTop: 0, flex: 1, flexDirection: 'row' }}>
        <NavButton onPress={this.handleChangePlayer} text={`human? ${this.state.isHuman}`} />
        <Picker
          selectedValue={this.state.echoDirection}
          style={{ height: 50, width: 100 }}
          onValueChange={(itemValue, itemIndex) => this.setState({ echoDirection: itemValue })}
        >
          <Picker.Item label="radius" value="radius" />
          <Picker.Item label="north" value="north" />
          <Picker.Item label="east" value="east" />
          <Picker.Item label="south" value="south" />
          <Picker.Item label="west" value="west" />
        </Picker>
        <NavButton onPress={this.echoLocate} text="echo-locate" />
        <NavButton onPress={this.showHumanMoves} text="move human" />
        <NavButton onPress={this.handlePressNavButton} text="go to home screen" />
      </View>

    );
  };

  render() {
    return (
      <Engine
        gameBoard={this.elements}
        tilesInRow={this.cellsInRow}
        boardFinished={this.state.boardFinished}
      />
    );
  }
}


export default Game;


// node needs to know its "value" and its edges
