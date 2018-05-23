import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Picker, View, Animated, TouchableOpacity, Alert, Dimensions, ActivityIndicator, BackAndroid } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid, AnimatedGrid } from '../components/Grid';
import WallTemplate from '../data/WallTemplate';
import Cell from '../data/Cell';
import Engine from './Engine';
import Menu from './Menu';
import AnimatedSplashScreen from './AnimatedSplashScreen';
import Bar from './Bar';
import SideMenu from 'react-native-side-menu';
import Modal from "react-native-modal";

class Game extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  constructor() {
    // TODO remove unused items and pull back all possible params/states from children
    super();

    this.assignCacheCounter = 0;
    this.assignMonsterCounter = 0;

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
    this.cellsPerScreen = 15;
    this.scrollOffset = Math.floor(this.cellsPerScreen / 2);
    let { width, height } = Dimensions.get("window");
    this.viewPortWidth = width;
    this.viewPortHeight = height;
    this.zoomedInValue = 50;
    this.zoomedOutValue = Math.ceil(this.viewPortHeight / this.cellsInRow);
    this.fullGameDimension = this.zoomedInValue * this.cellsInRow;
    this.zoom = 'close';
    this.allowedLengthOfWhiteLine = 14; // density

    this.state = {
      redraw: false,
      isHuman: true,
      tileWidth: this.zoomedOutValue,
      playerSpace: { name: 0 },
      boardFinished: false,
      animationType: 'hands',
      animationTouchable: true,
      animationVisible: true,
      modal: 0,
      modalLeft: 0,
      modalDialogOnly: 0,
      modalPounce: 0,
      modalAlert: 0,
      turnCounter: 0,
      outOfMoves: false,
      shrinesUnclaimed: this.cacheTotal,
      shrinesHumanClaimed: 0,
      shrinesMonsterClaimed: 0,
    };
  }

  // TODO figure out difference between generation in component will mount versus component did mount etc

  componentWillMount() {
    this.createMap();
    this.assignMonsterEdges();
    this.assignHumanStart();
    this.assignMonsterStart();
    this.assignCacheLocations();
    this.echoLocate('initial');
    // this.showHumanMoves();
    this.assignImageKeys();
  }

  // componentDidMount() {
  // }

  componentWillUnmount() {
    this.setState({ modal: 0 });
    this.setState({ modalLeft: 0 });
    this.setState({ modalDialogOnly: 0 });
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
      // left: i+1
      // right: i-1
      // top: i-20
      // bottom: i+20
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
          cell.monsterEdges.push(topLeft);
        }
        if (top && top.value > 0) {
          cell.monsterEdges.push(top);
        }
        if (topRight && topRight.value > 0) {
          cell.monsterEdges.push(topRight);
        }
        if (left && left.value > 0) {
          cell.monsterEdges.push(left);
        }
        if (right && right.value > 0) {
          cell.monsterEdges.push(right);
        }
        if (bottomLeft && bottomLeft.value > 0) {
          cell.monsterEdges.push(bottomLeft);
        }
        if (bottom && bottom.value > 0) {
          cell.monsterEdges.push(bottom);
        }
        if (bottomLeft && bottomLeft.value > 0) {
          cell.monsterEdges.push(bottomLeft);
        }
        if (bottomRight && bottomRight.value > 0) {
          cell.monsterEdges.push(bottomRight);
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

    // TODO cleanup and possibly refactor
    if (start.value < 1 || end.value < 1) {
      // console.log('shortest path error: start or end was a wall');
      return -1;
    }
    // array of cells to be checked
    let queue = [];
    // all cells already checked
    let visited = [];
    // shortest path from end to beginning following parents
    // add starting square to the queue
    visited.push(start);
    queue.push(start);
    // process the queue
    while (queue.length > 0) {
      // remove the first item
      let cell = queue.shift();
      if (cell === end) {
        // console.log("shortest path: found target")
        break;
      }
      let neighbors = cell.monsterEdges;
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
    // console.log(`shortest path: ${path.length - 1}`, path)
    return (path.length - 1);
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
    if (this.state.isHuman) {
      this.setState({ playerSpace: cell });
    }
  }

  assignMonsterStart = () => {
    let cell = this.getRandomCell();
    let distance = this.findShortestPath(cell, this.humanSpace);
    while (distance < 25) {
      console.log(`assign monster counter: ${this.assignMonsterCounter}`);
      this.assignMonsterCounter++;
      cell = this.getRandomCell();
      distance = this.findShortestPath(cell, this.humanSpace);
      if (this.assignMonsterCounter % 5 === 0) {
        this.assignHumanStart();
      }
    }
    // console.log('cell and distance', cell, distance);
    cell.hasMonster = true;
    this.monsterSpace = cell;
    if (!this.state.isHuman) {
      this.setState({ playerSpace: cell });
    }
  }

  assignCacheLocations = () => {
    // TODO make caches more evenly spaced out
    let cacheArray = [this.humanSpace, this.monsterSpace];
    for (let i = 0; i <= this.cacheTotal; i++) {
      let cell = this.getRandomCell();
      while (cell.value < 1 || cell.hasHuman || cell.hasMonster || cell.hasCache || this.compareToCacheArray(cell, cacheArray)) {
        cell = this.getRandomCell();
      }
      cell.hasCache = true;
      cell.isRevealed = true;
      cacheArray.push(cell);
    }
    //debug:
    this.elements[this.monsterSpace.name + 1].hasCache = true;
    this.elements[this.monsterSpace.name + 1].isRevealed = true;
    cacheArray.push(this.elements[this.monsterSpace.name + 1]);

    this.elements[this.humanSpace.name + 1].hasCache = true;
    this.elements[this.humanSpace.name + 1].isRevealed = true;
    cacheArray.push(this.elements[this.humanSpace.name + 1]);
  }

  compareToCacheArray = (cell, cacheArray) => {
    // console.log('cache boolean counter: ', this.assignCacheCounter);
    this.assignCacheCounter++;
    if (cacheArray.length > 0 ) {
      for (let i = 0; i < cacheArray.length; i++) {
        let distance = this.findShortestPath(cell, cacheArray[i]);
        if (distance < 5) {
          return true;
        }
      }
    }
   return false;
  }

  getNeighboringCells = (i) => {
    // TODO simplify
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
    // TODO simplify decision tree
    for (let i = 0; i < this.elements.length; i++) {
      const { topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight } = this.getNeighboringCells(i);
      let cell = this.elements[i];
      // wall top tiles
      if (cell.value === 0) {
        cell.imageKey = 9;
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
        // seems like it may be better to leave out the corridor function and let the random distribution handle them.
        // corridor
        // else if (left.value < 1 && right.value < 1 ) {
        //   let randomValue = this.getProbability();
        //   if (randomValue < 300) {
        //     cell.imageKey = 37;
        //   } else if (randomValue < 600) {
        //     cell.imageKey = 38;
        //   } else if (randomValue < 900) {
        //     cell.imageKey = 40;
        //   } else if (randomValue < 950) {
        //     cell.imageKey = 33;
        //   } else {
        //     cell.imageKey = 39;
        //   }
        // }
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

    // console.log('echolocate');
    // TODO fix all cases to reveal wall tiles but not beyond them
    // TODO fix restrictions to check for wall instead of edge
    // direction = "north";
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
      case 'north':
        if (index - this.cellsInRow < 0 || this.elements[index - this.cellsInRow].value < 1) {
          this.setState({ modalAlert: 1 });
          // Alert.alert(
          //   'Uh-Oh',
          //   'Cannot Echo-locate North from here..',
          // );
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false);
          let cell = this.elements[index - this.cellsInRow];
          while (cell.value !== 0) {
            cell.isRevealed = true;
            cell.wasEchoed = true;
            if (cell.name - this.cellsInRow > 0) {
              cell = this.elements[cell.name - this.cellsInRow];
            } else {
              break;
            }
          }
          cell.isRevealed = true;
          cell.wasEchoed = true;
        }
        break;

      case 'east':
        if (index % this.cellsInRow === (this.cellsInRow - 1) || this.elements[index + 1].value < 1) {
          this.setState({ modalAlert: 1 });
          // Alert.alert(
          //   'Uh-Oh',
          //   'Cannot Echo-locate East from here..',
          // );
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false);
          let cell = this.elements[index + 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            cell.wasEchoed = true;
            if ((cell.name + 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name + 1];
            }
          }
          cell.isRevealed = true;
          cell.wasEchoed = true;
        }
        break;

      case 'south':
        if (index + this.cellsInRow > this.cellsTotal || this.elements[index + this.cellsInRow].value < 1) {
          this.setState({ modalAlert: 1 });
          // Alert.alert(
          //   'Uh-Oh',
          //   'Cannot Echo-locate South from here..',
          // );
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false);
          let cell = this.elements[index + this.cellsInRow];
          while (cell.value !== 0) {
            cell.isRevealed = true;
            cell.wasEchoed = true;
            if (cell.name + this.cellsInRow < this.cellsTotal) {
              cell = this.elements[cell.name + this.cellsInRow];
            } else {
              break;
            }
          }
          cell.isRevealed = true;
          cell.wasEchoed = true;
        }
        break;

      case 'west':
        if (index % this.cellsInRow === 0 || (this.elements[index-1].value < 1)) {
          this.setState({ modalAlert: 1 });
          // Alert.alert(
          //   'Uh-Oh',
          //   'Cannot Echo-locate West from here..',
          // );
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false);
          let cell = this.elements[index - 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            cell.wasEchoed = true;
            if ((cell.name - 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name - 1];
            }
          }
          cell.isRevealed = true;
          cell.wasEchoed = true;
        }
        break;

      case 'radius':
        if (topLeft.isRevealed && top.isRevealed && topRight.isRevealed && left.isRevealed && right.isRevealed && bottomLeft.isRevealed && bottom.isRevealed && bottomRight.isRevealed) {
          this.setState({ modalAlert: 1 });
          // Alert.alert(
          //   'Uh-Oh',
          //   'nothing to reveal',
          // );
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false);
          topLeft.isRevealed = true;
          topLeft.wasEchoed = true;
          top.isRevealed = true;
          top.wasEchoed = true;
          topRight.isRevealed = true;
          topRight.wasEchoed = true;
          left.isRevealed = true;
          left.wasEchoed = true;
          right.isRevealed = true;
          right.wasEchoed = true;
          bottomLeft.isRevealed = true;
          bottomLeft.wasEchoed = true;
          bottom.isRevealed = true;
          bottom.wasEchoed = true;
          bottomRight.isRevealed = true;
          bottomRight.wasEchoed = true;
          break;
        }

      default:
        break;
    }
    this.setState({ redraw: !this.state.redraw });
  }

  generateCustomAlert = () => {
    let text1 = "Uh-oh."
    let text2 = "Can't echo locate in that direction."
    return (
      <View style={{

        borderWidth: 2,
        borderColor: "#000",

        alignItems: 'center',
        justifyContent: 'center',
        padding: 22,
        backgroundColor: '#212121',
      }}>
        <Text style={{color:'#fff'}}>{text1}</Text>
        <Text style={{color:'#fff'}}>{text2}</Text>
        <NavButton onPress={() => {this.setState({ modalAlert: 0 }); }} text='OK' />
      </View>
    );
  }

  onItemSelected = (item) => {
    console.log('onItemSelected', item);
    switch (item) {
      case 'endTurn':
        if (this.state.outOfMoves) {
          if (this.state.isHuman) {
            this.resetWasPounced();
          } else {
            this.resetWasEchoed();
          }
          this.resetHighlighted();
          this.changePlayerMode();
        }
        break;
      case 'move':
        if (this.state.isHuman) {
          this.showHumanMoves();
          this.setState({ redraw: !this.state.redraw });
        } else {
          this.showMonsterMoves();
          this.setState({ redraw: !this.state.redraw });
        }
        break;
      case 'sniff':
        // this.setState({ modalDialogOnly: 1 });
        this.setState({ modal: 3 });
        break;
      case 'listen':
        this.resetHighlighted();
        if (this.state.isHuman) {
          this.setState({ modalDialogOnly: 3 });
        }
        else {
          this.setState({ modal: 4 });
        }
        break;
      case 'echo':
        this.resetHighlighted();
        this.setState({ modal: 1 });
        break;
      case 'pounce':
        // this.setState({ modalPounce: 1 });
        this.resetHighlighted();
        this.monsterProcessPounce();
        // this.setState({ modalPounce: 0 });
        break;
      case 'home':
        this.resetHighlighted();
        this.setState({ modalLeft: 2 });
        break;
      case 'zoom':
        this.resetHighlighted();
        this.alterZoom();
        break;
      case 'exit':
        this.resetHighlighted();
        this.setState({ modalLeft: 1 });
        break;
      default:
        // console.log('');
    }
  }

  alterZoom = () => {
    if(this.state.tileWidth === this.zoomedInValue) {
      this.setState({
        tileWidth: this.zoomedOutValue,
      })
      this.showSplashScreen('hands', false);
    } else {
      this.setState({
        tileWidth: this.zoomedInValue,
      })
      this.showSplashScreen('hands', false);
    }
  }

  incrementTurnCounter = () => {
    this.setState({ turnCounter: this.state.turnCounter + 1 });
    console.log('--------------------------');
    console.log(this.state.turnCounter);
    if (this.state.turnCounter >= 1) {
      this.setState({ outOfMoves: true });
    }
  }

  decrementTurnCounter = () => {
    this.setState({ turnCounter: this.state.turnCounter - 1});
    if (this.state.turnCounter < 1) {
      this.setState({ outOfMoves: false });
    }
  }

  changePlayerMode = () => {
    this.showSplashScreen('hands', true);
    this.handleChangePlayer();
    // this.setState({ boardFinished: !this.state.boardFinished });
  }


  renderModalContent = () => {
    if (this.state.modalDialogOnly === 1) {//SNIFF FOR HUMAN
      let cell1;
      let cell2;
      if (this.state.isHuman) {
        cell1 = this.humanSpace.name;
        cell2 = this.monsterSpace.name;
      } else {
        cell1 = this.monsterSpace.name;
        cell2 = this.humanSpace.name;
      }
      let direction = '';
      if (cell2 / this.cellsInRow > cell1 / this.cellsInRow) {
        direction += 'S';
      } else if (cell2 / this.cellsInRow < cell1 / this.cellsInRow) {
        direction += 'N';
      }
      if (cell2 % this.cellsInRow > cell1 % this.cellsInRow) {
        direction += 'E';
      } else if (cell2 % this.cellsInRow < cell1 % this.cellsInRow) {
        direction += 'W';
      }

      let text1 = 'You sniffed.';
      let text2 = `Opponent is in ${direction} direction from you.`;

      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>{text1}</Text>
          <Text style={{color:'#fff'}}>{text2}</Text>
          <NavButton onPress={() => this.closeModalDialogOnly()} text='OK' />
        </View>
      )
    }
    // <NavButton onPress={() => {this.setState({ modal: 0 }); this.incrementTurnCounter();}} text='OK' />
    else if (this.state.modalDialogOnly === 3) {//LISTEN FOR HUMAN
      let distance = this.findShortestPath(this.monsterSpace, this.humanSpace);
      let text1 = 'You listened.';
      let text2 = `Opponent is ${distance} cells away`;
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>{text1}</Text>
          <Text style={{color:'#fff'}}>{text2}</Text>
          <NavButton onPress={() => this.closeModalDialogOnly()} text='OK' />
        </View>
      );
    }
    else if (this.state.modalPounce === 1) {//POUNCE
      let text1;
      let text2;
      text1 = 'You pounced.';
      text2 = 'There is nothing here.';
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>{text1}</Text>
          <Text style={{color:'#fff'}}>{text2}</Text>
          <NavButton onPress={() => {
            this.setState({ modalPounce: 0 });
          }} text='OK' />
        </View>
      );
    }
    else if (this.state.modal === 1) {//ECHO
      let text1 = 'Choose echo direction:';
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>{text1}</Text>
          <NavButton onPress={() => {this.echoLocate('north'); this.setState({ modal: 0 });}} text='North' />
          <NavButton onPress={() => {this.echoLocate('south'); this.setState({ modal: 0 });}} text='South' />
          <NavButton onPress={() => {this.echoLocate('east'); this.setState({ modal: 0 });}} text='East' />
          <NavButton onPress={() => {this.echoLocate('west'); this.setState({ modal: 0 });}} text='West' />
          <NavButton onPress={() => {this.echoLocate('radius'); this.setState({ modal: 0 });}} text='Burst' />
        </View>
      );
    }
    else if (this.state.modal === 3) {//sniff
      let text1 = 'Sniff:';
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>{text1}</Text>
          <NavButton onPress={() => {this.setState({ modal: 0 }); this.setState({ modalDialogOnly: 1 }); }} text='player' />
          <NavButton onPress={() => {this.setState({ modal: 0 }); this.setState({ modalDialogOnly: 2 }); }} text='shrine' />
        </View>
      );
    }
    else if (this.state.modal === 4) {//listen
      if (!this.state.isHuman) {
        let text1 = 'Listen:';
        return (
          <View style={{

            borderWidth: 2,
            borderColor: "#000",

            alignItems: 'center',
            justifyContent: 'center',
            padding: 22,
            backgroundColor: '#212121',
          }}>
            <Text style={{color:'#fff'}}>{text1}</Text>
            <NavButton onPress={() => {this.setState({ modal: 0 }); this.setState({ modalDialogOnly: 3 }); }} text='player' />
            <NavButton onPress={() => {this.setState({ modal: 0 }); this.setState({ modalDialogOnly: 4 }); }} text='shrine' />
          </View>
        );
      }
    }
    // else if (this.state.modal === 2) {//uh-oh
    //   if (this.state.isHuman) {
    //     let text1 = "You can't echo in that direction";
    //     return (
    //       <View style={{
    //
    //         borderWidth: 2,
    //         borderColor: "#000",
    //
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //         padding: 22,
    //         backgroundColor: '#212121',
    //       }}>
    //         <Text style={{color:'#fff'}}>{text1}</Text>
    //         <NavButton onPress={() => {this.setState({ modal: 0 }); this.setState({ modalDialogOnly: 3 }); }} text='OK' />
    //       </View>
    //     );
    //   }
    // }
    else if (this.state.modalLeft === 1) {//EXIT
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>Are you sure you want to exit?</Text>
          <NavButton onPress={() => BackAndroid.exitApp()} text='Yes' />
          <NavButton onPress={() => this.setState({ modalLeft: 0 })} text='No' />

        </View>
      );
    }
    else if (this.state.modalLeft === 2) {//HOME
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff'}}>Are you sure you want to exit?</Text>
          <NavButton onPress={() => {this.setState({ modalLeft: 0 }); this.props.navigation.navigate('Home');}} text='Yes' />
          <NavButton onPress={() => this.setState({ modalLeft: 0 })} text='No' />

        </View>
      );
    }
  }

  monsterProcessPounce = () => {
    // let text1;
    // let text2;
    let cellsAround = this.getIndexesOfAvailableCellsAround(this.monsterSpace.name, this.cellsInRow, this.cellsTotal, true);
    let human = false;
    let shrine = false;
    let index = this.monsterSpace.name;
    cellsAround.forEach((i) => {
      if (this.elements[i].hasHuman) {
        human = true;
        // break;
      }
      else if (this.elements[i].hasCache) {
        shrine = true;
        index = i;
      }
    });
    if (human) {
      //end game
    } else if (shrine) {
      this.collectShrine(this.elements[index]);
    } else {
      this.setState({ modalPounce: 1 });
    }

    this.incrementTurnCounter();

  }

  collectShrine = (item) => {
    if (this.state.isHuman) {
      this.setState({ shrinesHumanClaimed: this.state.shrinesHumanClaimed + 1 });
      this.setState({ shrinesUnclaimed: this.state.shrinesUnclaimed - 1 });
    }
    else {
      this.setState({ shrinesMonsterClaimed: this.state.shrinesMonsterClaimed + 1 });
      this.setState({ shrinesUnclaimed: this.state.shrinesUnclaimed - 1 });
    }
    item.hasCache = false;
    this.showSplashScreen('shrine', false);

  }


  showMonsterMoves = () => {
    let index = this.monsterSpace.name;
    let indexesOfAvailableCellsAround = this.getIndexesOfAvailableCellsAround(index, this.cellsInRow, this.cellsTotal, true);
    let cells = [];
    indexesOfAvailableCellsAround.forEach((i) => {
      if (this.elements[i].value > 0) {
        cells.push(this.elements[i]);
        this.elements[i].isHighlighted = true;
      }
    });
  }

  moveMonster = (item) => {
    if (item.isHighlighted) {
      this.elements[this.monsterSpace.name].hasMonster = false;
      item.hasMonster = true;
      this.monsterSpace = item;
      this.setState({ playerSpace: item });
      this.resetHighlighted();
    } else {
      Alert.alert(
        'Uh-Oh',
        'Please select a highlighted space',
      );
    }
    // this.setState({ redraw: !this.state.redraw });
  }

  showHumanMoves = () => {
    // console.log('show human moves', this.humanSpace.name, this.state.playerSpace.name)
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
    // console.log('move human')
    if (item.isHighlighted) {
      // player moves to the space
      // clear previous cell
      this.elements[this.humanSpace.name].hasHuman = false;
      // put human in new cell,
      item.hasHuman = true;
      // check if the space has a cache
      if (item.hasCache) {
        //take the cache
        // item.hasCache = false;
        // this.setState({
        //   shrinesUnclaimed: this.state.shrinesUnclaimed - 1,
        //   shrinesHumanClaimed: this.state.shrinesHumanClaimed + 1,
        // });
        this.collectShrine(item);
        // this.showSplashScreen('shrine', false);
        console.log('shrine collected: ', this.state.shrinesHumanClaimed, this.state.shrinesMonsterClaimed, this.state.shrinesUnclaimed);
      }
      this.humanSpace = item;
      this.resetHighlighted();
      this.setState({ playerSpace: item });
    } else {
      Alert.alert(
        'Uh-Oh',
        'Please select a highlighted space',
      );
    }
  }

  // handlePressNavButton = () => {
  //   this.props.navigation.navigate('Home');
  // };

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
    this.setState({ turnCounter: 0 });
    this.setState({ outOfMoves: false });
  }

  // renderHeader = () => {
  //   return (
  //     <View style={{ marginBottom: 20, marginTop: 40 }}>
  //       <Text>Game screen</Text>
  //
  //       <TouchableOpacity onPress={this.onPressZoomIn} style={{ width: 20 }}>
  //         <View style={{
  //           backgroundColor: '#fff',
  //           alignItems: 'center',
  //           marginTop: 15,
  //           borderRadius: 10,
  //           borderColor: '#000',
  //           borderWidth: 1,
  //           }}
  //         >
  //           <Text style={{ fontWeight: 'bold' }}>+</Text>
  //         </View>
  //       </TouchableOpacity>
  //
  //
  //       <TouchableOpacity onPress={this.onPressZoomOut} style={{ width: 20 }}>
  //         <View style={{
  //           backgroundColor: '#fff',
  //           alignItems: 'center',
  //           marginTop: 5,
  //           borderRadius: 10,
  //           borderColor: '#000',
  //           borderWidth: 1,
  //         }}>
  //           <Text style={{ fontWeight: 'bold' }}>-</Text>
  //         </View>
  //       </TouchableOpacity>
  //
  //     </View>
  //   );
  // };

  // renderFooter = () => {
  //   return (
  //     <View style={{ marginBottom: 20, marginTop: 0, flex: 1, flexDirection: 'row' }}>
  //       <NavButton onPress={this.handleChangePlayer} text={`human? ${this.state.isHuman}`} />
  //       <Picker
  //         selectedValue={this.state.echoDirection}
  //         style={{ height: 50, width: 100 }}
  //         onValueChange={(itemValue, itemIndex) => this.setState({ echoDirection: itemValue })}
  //       >
  //         <Picker.Item label="radius" value="radius" />
  //         <Picker.Item label="north" value="north" />
  //         <Picker.Item label="east" value="east" />
  //         <Picker.Item label="south" value="south" />
  //         <Picker.Item label="west" value="west" />
  //       </Picker>
  //       <NavButton onPress={this.echoLocate} text="echo-locate" />
  //       <NavButton onPress={this.showHumanMoves} text="move human" />
  //       <NavButton onPress={this.handlePressNavButton} text="go to home screen" />
  //     </View>

  //   );
  // };

  renderBar = () => {
    return(
      <View style={{backgroundColor:'#555', padding: 10}}>
        <Text style={{alignItems: 'flex-end'}}>HEY</Text>

        <TouchableOpacity style={{alignItems: 'flex-end'}} onPress={()=>{console.log('pressed');}}>
          <View style={{    padding: 10,
              borderRadius: 15,
              borderColor: '#d94400',
              borderWidth: 2,
              backgroundColor: '#000' }}>
            <Text style={{ color: '#fff' }}>hey</Text>
          </View>
        </TouchableOpacity>

      </View>
    );
  }


  boardFinishedCallback = () => (
    this.setState({
      boardFinished: true,
    })
  )

  showAnimationCallback = () => (
    this.setState({
      animationVisible: false,
    })
  )

  showSplashScreen = (image, touchable) => {
    this.setState({
      animationType: image,
      animationTouchable: touchable,
      animationVisible: true,
      boardFinished: false,
    })
  }

  renderAnimator = () => {
    if (this.state.animationVisible) {
      return(
        <View style={{ backgroundColor: '#000', flex: 1, zIndex: 2 }}>
          <AnimatedSplashScreen boardFinishedCallback={this.boardFinishedCallback} showAnimationCallback={this.showAnimationCallback} animationType={this.state.animationType} touchable={this.state.animationTouchable} />
        </View>
      )
    }
  }

  closeModalDialogOnly = () => {
    this.setState({ modalDialogOnly: 0 });
    this.incrementTurnCounter();
  }

  renderEngine1 = () => {
    let disableGestures = this.state.outOfMoves;
    const menuRight = <Menu mode={this.state.isHuman ? 1 : 2} onItemSelected={this.onItemSelected}/>;
    const menuLeft = <Menu mode={0} onItemSelected={this.onItemSelected}/>;
    const bar = <Bar
      outOfMoves={this.state.outOfMoves}
      isHuman={this.state.isHuman}
      onItemSelected={this.onItemSelected}
      shrineAmount={this.state.isHuman ? this.state.shrinesHumanClaimed : this.state.shrinesMonsterClaimed}
      shrinesUnclaimed={this.state.shrinesUnclaimed}
    />;
    if (this.state.boardFinished) {
      return (
        <SideMenu
        menu={menuRight}
        menuPosition='right'
        disableGestures={disableGestures}
      >
      <SideMenu
        menu={menuLeft}
        menuPosition='left'
      >
        <Engine
          gameBoard={this.elements}
          tilesInRow={this.cellsInRow}
          boardFinished={this.state.boardFinished}
          isHuman={this.state.isHuman}
          playerSpace={this.state.playerSpace}
          move={this.state.isHuman ? this.moveHuman : this.moveMonster}
          echolocate={this.echoLocate}
          tileWidth={this.state.tileWidth}
          zoomedInValue={this.zoomedInValue}
          zoomedOutValue={this.zoomedOutValue}
          incrementTurnCounter={this.incrementTurnCounter}
        />
        <Modal
          isVisible={this.state.modal != 0}
          onBackdropPress={() => this.setState({ modal: 0 })}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          onSwipe={() => this.setState({ modal: 0 })}
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>

        <Modal
          isVisible={this.state.modalAlert != 0}
          onBackdropPress={() => this.setState({ modalAlert: 0 })}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          onSwipe={() => this.setState({ modalAlert: 0 })}
          swipeDirection="right"
        >
          {this.generateCustomAlert()}
        </Modal>

        <Modal
          isVisible={this.state.modalDialogOnly != 0}
          onBackdropPress={() => this.closeModalDialogOnly()}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          onSwipe={() => this.closeModalDialogOnly()}
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>

        <Modal
          isVisible={this.state.modalPounce != 0}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>


        <Modal
          isVisible={this.state.modalLeft != 0}
          onBackdropPress={() => this.setState({ modalLeft: 0 })}
          animationIn="slideInRight"
          animationOut="slideOutLeft"
          onSwipe={() => this.setState({ modalLeft: 0 })}
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>

        {bar}
      </SideMenu>
      </SideMenu>
      )
    }
  }

  render() {
    const finished = this.state.boardFinished;

      return (
        <View style={{flex:1}}>

          {this.renderAnimator()}
          {this.renderEngine1()}
        </View>
      )
    }
  }

export default Game;


// node needs to know its "value" and its edges
