//adjust fog disabled
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, ImageBackground, Dimensions, BackAndroid, StatusBar } from 'react-native';
import { NavButton } from '../components/Button';
import Cell from '../data/Cell';
import Engine from './Engine';
import WideButton from '../components/Button/WideButton'
import Menu from './Menu';
import AnimatedSplashScreen from './AnimatedSplashScreen';

import Modal from "react-native-modal";

class Game extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  constructor() {
    super();

    this.assignCacheCounter = 0;
    this.assignMonsterCounter = 0;

    this.elements = [];
    this.humanSpace = null;
    this.monsterSpace = null;
    this.cacheTotal = 13;
    this.cellsInRow = 40;
    this.cellsTotal = 1600;
    this.viewPortHeight = Dimensions.get("window").height;
    this.zoomedInValue = 64;
    this.zoomedOutValue = 25;
    this.allowedLengthOfWhiteLine = 14; // density
    this.userWon = null;
    this.humanShrinesToWin = 7;
    this.monsterShrinesToWin = 7;
    this.animationCallback = this.showAnimationCallback;

    this.state = {
      redraw: false,
      isHuman: true,
      tileWidth: this.zoomedInValue,
      playerSpace: { name: 0 },
      boardFinished: false,
      animationType: 'hands',
      animationTouchable: true,
      animationVisible: true,
      animationTimer: 1000,
      modal: 0,
      modalLeft: 0,
      modalDialogOnly: 0,
      modalPounce: 0,
      modalAlert: 0,
      turnCounter: 0,
      outOfMoves: false,
      shrinesUnclaimed: this.cacheTotal,
      shrinesBlessed: 0,
      shrinesDesecrated: 0,
      monsterSanityLevel: 100,
      heartBeatTimer: 8,
      opponentVisible: false,
      monsterFeedback: false,
      humanFeedback: false,
      feedbackSquare: null,
      highlightFeedback: true,
      shrineIndexAdjustment: true,
    };
  }

  highlightFeedbackCallback = () => {
    this.setState({
      highlightFeedback: false,
    });
  }

  componentWillMount() {
    this.gameInit();
  }

  gameInit = () => {
    console.log('gameInit from Game');
    this.createMap();
    this.assignMonsterEdges();
    this.assignHumanStart();
    this.assignMonsterStart();
    this.assignCacheLocations();
    this.echoLocate('initial');
    this.assignImageKeys();
    this.assignImageDecorKeys();
    this.assignImageFogKeys();
    // this.adjustFog();
    this.setHeartRate();
  }

  componentDidMount() {
    StatusBar.setHidden(true);
  }

  setHeartRate = () => {
    const distanceMin = 0;
    const distanceMax = 40;
    const heartRateMin = 0;
    const heartRateMax = 8;
    let distance = this.findShortestPath(this.monsterSpace, this.humanSpace);
    let heartRate = heartRateMin + (((heartRateMax - heartRateMin) * (distance - distanceMin)) / (distanceMax-distanceMin));
    this.setState({
      heartBeatTimer: Math.floor(heartRate),
    });
  }

  componentWillUnmount() {
    this.setState({
      modal: 0,
      modalLeft: 0,
      modalDialogOnly: 0,
      modalPounce: 0,
      modalAlert: 0,
    });
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
    if (!this.state.isHuman) {
      this.setState({ playerSpace: cell });
    }


    // // DEBUG:
    // let cell = this.humanSpace;
    // cell.hasMonster = true;
    // this.monsterSpace = cell;
    // if (!this.state.isHuman) {
    //   this.setState({ playerSpace: cell });
    // }
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
      let hadFog = false;
      if ((this.elements[i].isRevealed)) {

        if ((this.elements[i].imageFogKey > 0) && (this.elements[i].imageFogKey < 9)) {
          hadFog = true;
        }

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
      if (this.elements[i].imageFogKey === 9) {
        this.elements[i].isRevealed = true;
      }
    }
  }

  adjustFog = () => {
    for (let i = 0; i < this.cellsTotal; i++) {
      if (this.elements[i].imageFogKey > 0) {
        if ((i - 1 >= 0) && (i + 1 % this.cellsInRow > 0)) {
          if ((this.elements[i - 1].isRevealed) && (this.elements[i + 1].isRevealed)) {
            this.elements[i].imageFogKey = 0;
            this.elements[i].isRevealed = true;
          }
        }
        if ((i - this.cellsInRow >= 0) && (i + this.cellsInRow < this.cellsTotal)) {
          if ((this.elements[i - this.cellsInRow].isRevealed) && (this.elements[i + this.cellsInRow].isRevealed)) {
            this.elements[i].imageFogKey = 0;
            this.elements[i].isRevealed = true;
          }
        }
      }
    }
    this.assignImageFogKeys();
  }

  adjustFog_old = () => {
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
    let numberOfTubes1 = 3;//3
    let numberOfTubes2 = 4;//4
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
    const index = this.humanSpace.name;
    let { topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight } = this.getNeighboringCells(index);
    switch (direction) {

      case 'initial':

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
        } else {
          this.setState({
            monsterFeedback: true,
            feedbackSquare: this.humanSpace,
          });
          for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].hasHuman) {
              this.elements[i].wasEchoed = true;
              console.log("was echoed set");
            }
          }
          this.incrementTurnCounter();
          // this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index - this.cellsInRow];
          while (cell.value !== 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if (cell.name - this.cellsInRow > 0) {
              cell = this.elements[cell.name - this.cellsInRow];
            } else {
              break;
            }
          }
          cell.isRevealed = true;
          if (cell.hasMonster) {
            this.setState({
              opponentVisible: true,
            });
          }
        }
        break;

      case 'east':

        if (index % this.cellsInRow === (this.cellsInRow - 1) || this.elements[index + 1].value < 1) {
          this.setState({ modalAlert: 1 });
        } else {
          this.setState({
            monsterFeedback: true,
            feedbackSquare: this.humanSpace,
          });
          for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].hasHuman) {
              this.elements[i].wasEchoed = true;
              console.log("was echoed set");
            }
          }
          this.incrementTurnCounter();
          // this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index + 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if ((cell.name + 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name + 1];
            }
          }
          cell.isRevealed = true;
          if (cell.hasMonster) {
            this.setState({
              opponentVisible: true,
            });
          }
        }
        break;

      case 'south':

        if (index + this.cellsInRow > this.cellsTotal || this.elements[index + this.cellsInRow].value < 1) {
          this.setState({ modalAlert: 1 });
        } else {
          this.setState({
            monsterFeedback: true,
            feedbackSquare: this.humanSpace,
          });
          for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].hasHuman) {
              this.elements[i].wasEchoed = true;
              console.log("was echoed set");
            }
          }
          this.incrementTurnCounter();
          // this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index + this.cellsInRow];
          while (cell.value !== 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if (cell.name + this.cellsInRow < this.cellsTotal) {
              cell = this.elements[cell.name + this.cellsInRow];
            } else {
              break;
            }
          }
          cell.isRevealed = true;
          if (cell.hasMonster) {
            this.setState({
              opponentVisible: true,
            });
          }
        }
        break;

      case 'west':

        if (index % this.cellsInRow === 0 || (this.elements[index-1].value < 1)) {
          this.setState({ modalAlert: 1 });
        } else {
          this.setState({
            monsterFeedback: true,
            feedbackSquare: this.humanSpace,
          });
          for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].hasHuman) {
              this.elements[i].wasEchoed = true;
              console.log("was echoed set");
            }
          }
          this.incrementTurnCounter();
          // this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index - 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if ((cell.name - 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name - 1];
            }
          }
          cell.isRevealed = true;
          if (cell.hasMonster) {
            this.setState({
              opponentVisible: true,
            });
          }
        }
        break;

      case 'radius':

        if (topLeft.isRevealed && top.isRevealed && topRight.isRevealed && left.isRevealed && right.isRevealed && bottomLeft.isRevealed && bottom.isRevealed && bottomRight.isRevealed) {
          this.setState({ modalAlert: 1 });
        } else {
          this.setState({
            monsterFeedback: true,
            feedbackSquare: this.humanSpace,
          });
          for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].hasHuman) {
              this.elements[i].wasEchoed = true;
              console.log("was echoed set");
            }
          }
          this.incrementTurnCounter();
          // this.showSplashScreen('hands', false, splashScreenTimer);
          topLeft.isRevealed = true;
          top.isRevealed = true;
          topRight.isRevealed = true;
          left.isRevealed = true;
          right.isRevealed = true;
          bottomLeft.isRevealed = true;
          bottom.isRevealed = true;
          bottomRight.isRevealed = true;
          break;
        }

      default:
        break;
    }
    this.assignImageFogKeys();
    // this.adjustFog();
    this.setState({ redraw: !this.state.redraw });
  }

  generateCustomAlert = () => {
    let text1 = "Uh-oh."
    let text2 = "Can't echo locate in that direction."
    return (
        <View style={{
          width: Dimensions.get("window").width*0.8,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 15}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10}}>{text2}</Text>
            <WideButton onPress={() => this.setState({ modalAlert: 0})} text='OK' />
          </ImageBackground>
        </View>
    );
  }

  onItemSelected = (item) => {
    // console.log('onItemSelected', item);
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
          this.setState({ highlightFeedback: true })
          this.showSplashScreen('hands', true, 1000);
        }
        break;
      case 'menu':
        this.resetHighlighted();
        this.setState({ modalLeft: 3 });
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
      });
    } else {
      this.setState({
        tileWidth: this.zoomedInValue,
      });
    }
  }

  incrementTurnCounter = () => {
    this.setState({ turnCounter: this.state.turnCounter + 1 });
    if (this.state.turnCounter >= 1) {
      this.setState({ outOfMoves: true });
    }
  }

  // decrementTurnCounter = () => {
  //   this.setState({ turnCounter: this.state.turnCounter - 1});
  //   if (this.state.turnCounter < 1) {
  //     this.setState({ outOfMoves: false });
  //   }
  // }

  changePlayerMode = () => {
    // this.showSplashScreen('hands', true, 1000);
    this.handleChangePlayer();
  }

  findClosestShrine = () => {
    // note: this returns an object containing both the closest {shrine} as a cell object and the {distance} as an int
    let shrines = [];
    let distance = 400;
    let closest = null;
    for (let i = 0; i < this.elements.length; i++) {
      if(this.elements[i].hasCache) {
        shrines.push(this.elements[i]);
      }
    }
    for (let j = 0; j < shrines.length; j++) {
      let dist = this.findShortestPath(this.monsterSpace, shrines[j]);
      if (dist < distance) {
        distance = dist;
        closest = shrines[j];
      }
    }
    return {shrine: closest, distance: distance};
  }

  focus = (target) => {
    if (target === 'human') {
      this.setState({
        modalDialogOnly: 1,
      });
    } else {
      this.setState({
        modalDialogOnly: 2,
      })
    }
  }

  renderModalContent = () => {
    if (this.state.modalDialogOnly === 1) { // focus on young priest
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
      if (Math.floor(cell2 / this.cellsInRow) > Math.floor(cell1 / this.cellsInRow)) {
        direction += 'S';
      } else if (Math.floor(cell2 / this.cellsInRow) < Math.floor(cell1 / this.cellsInRow)) {
        direction += 'N';
      }
      if (cell2 % this.cellsInRow > cell1 % this.cellsInRow) {
        direction += 'E';
      } else if (cell2 % this.cellsInRow < cell1 % this.cellsInRow) {
        direction += 'W';
      }
      let distance = this.findShortestPath(this.elements[cell1], this.elements[cell2]);

      let text1 = 'You focus on the Priest.';
      let text2 = `He is ${distance} squares away to the ${direction}`;

      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 20}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',padding: 10,}}>{text2}</Text>
            <WideButton onPress={() => this.closeModalDialogOnly()} text='OK' />>
          </ImageBackground>
        </View>
      )
    }
    else if (this.state.modalDialogOnly === 2) {//focus on closest shrine
      let monsterIndex = this.monsterSpace.name;
      let { shrine, distance } = this.findClosestShrine();
      let shrineIndex = shrine.name;
      let direction = '';
      if (Math.floor(shrineIndex / this.cellsInRow) > Math.floor(monsterIndex / this.cellsInRow)) {
        direction += 'S';
      } else if (Math.floor(shrineIndex / this.cellsInRow) < Math.floor(monsterIndex / this.cellsInRow)) {
        direction += 'N';
      }
      if (shrineIndex % this.cellsInRow > monsterIndex % this.cellsInRow) {
        direction += 'E';
      } else if (shrineIndex % this.cellsInRow < monsterIndex % this.cellsInRow) {
        direction += 'W';
      }

      let text1 = 'You focus on the nearest Shrine.';
      let text2 = `It is ${distance} spaces away to the ${direction}.`;

      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 20}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',padding: 10,}}>{text2}</Text>
            <WideButton onPress={() => this.closeModalDialogOnly()} text='OK' />
          </ImageBackground>
        </View>
      )
    }
    else if (this.state.modalPounce === 1) {//POUNCE
      let text1;
      let text2;
      text1 = 'You pounced.';
      text2 = 'There is nothing here.';
      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 20}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',padding: 10,}}>{text2}</Text>
            <WideButton onPress={() => this.closeModalDialogOnly()} text='OK' />
          </ImageBackground>
        </View>
      );
    }
    else if (this.state.modalLeft === 1) {//EXIT
      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>

          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
          >

          <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 15}}>Are you sure you want to exit?</Text>
          <WideButton onPress={() => {this.setState({ modalLeft: 0 }); this.props.navigation.navigate('Home');}} text='Yes' />
          <WideButton onPress={() => this.setState({ modalLeft: 0 })} text='No' />
          </ImageBackground>
        </View>
      );
    }
    else if (this.state.modalLeft === 2) {//HOME
      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>

          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
          >
          <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 15}}>Are you sure you want to exit?</Text>
          <WideButton onPress={() => {this.setState({ modalLeft: 0 }); this.props.navigation.navigate('Home');}} text='Yes' />
          <WideButton onPress={() => this.setState({ modalLeft: 0 })} text='No' />
          </ImageBackground>
        </View>
      );
    }
    else if (this.state.modalLeft === 3) {//MENU
      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 300,
        }}>

          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
          >
          <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437', padding: 10, marginTop: 15}}>Menu</Text>
          <WideButton onPress={() => this.setState({ modalLeft: 2 })} text='Home' />
          <WideButton onPress={() => this.setState({ modalLeft: 1 })} text='Exit' />
          <WideButton onPress={() => this.setState({ modalLeft: 0 })} text='Cancel' />
          </ImageBackground>
        </View>
      );
    }
  }

  monsterProcessPounce = () => {
    this.resetHighlighted();
    let cellsAround = this.getIndexesOfAvailableCellsAround(this.monsterSpace.name, this.cellsInRow, this.cellsTotal, true);
    cellsAround.push(this.monsterSpace.name);
    let human = false;
    let shrine = false;
    let index = this.monsterSpace.name;
    cellsAround.forEach((i) => {
      if (this.elements[i].hasHuman) {
        human = true;
        // break;
      }
      else if (this.elements[i].hasCache) {
        this.elements[i].wasPounced = true;
        shrine = true;
        index = i;
      }
    });
    if (human) {
      //end game
      this.userWon = 'monster';
      this.gameOver();
    } else if (shrine) {
      this.collectShrine(this.elements[index]);
    }
  }


  gameOver = () => {
    this.animationCallback = () => {
      this.props.navigation.navigate('GameOver');
    }
    if (this.userWon === 'human') {
      this.showSplashScreen('priestWon', false, 2000);
    }
    else if (this.userWon === 'monster') {
      this.showSplashScreen('evilWon', false, 2000);
    }
  }

  collectShrine = (item) => {
    this.setState({ feedbackSquare: item });
    if (this.state.isHuman) {
      if (this.state.shrinesBlessed + 1 >= this.humanShrinesToWin) {
        this.userWon = 'human';
        this.gameOver();
      }

      item.hasBlessedCache = true;
      item.wasEchoed = true;
      console.log("hasBlessedShrine");
      this.setState({ shrinesBlessed: this.state.shrinesBlessed + 1 });
      this.setState({ shrinesUnclaimed: this.state.shrinesUnclaimed - 1 });
      this.setState({ monsterFeedback: true })
    }
    else {
      if (this.state.shrinesDesecrated + 1 >= this.monsterShrinesToWin) {
        this.userWon = 'monster';
        this.gameOver();
      }

      item.hasDesecratedCache = true;
      this.state.monsterSanityLevel -= 15;
      this.setState({ shrinesDesecrated: this.state.shrinesDesecrated + 1 });
      this.setState({ shrinesUnclaimed: this.state.shrinesUnclaimed - 1 });
      this.setState({ humanFeedback: true });
    }

    if (!this.userWon) {
      item.hasCache = false;
      // this.showSplashScreen('shrine', false, 2000);
    }

  }


  showMonsterMoves = () => {
    let index = this.monsterSpace.name;
    let indexesOfAvailableCellsAround = this.getIndexesOfAvailableCellsAround(index, this.cellsInRow, this.cellsTotal, true);
    let cells = [];
    let cells2 = [];
    let cellsAll = [];
    let distance = null;
    cells.push(this.elements[index]);
    let monsterMoveLength;
    if (this.state.shrinesDesecrated > 2) {
      monsterMoveLength = 2;
    }
    else {
      monsterMoveLength = this.state.shrinesDesecrated;
    }
    for (let s = 0; s < monsterMoveLength + 1; s++) {
      cells.forEach((cell) => {
        indexesOfAvailableCellsAround = this.getIndexesOfAvailableCellsAround(cell.name, this.cellsInRow, this.cellsTotal, true);
        indexesOfAvailableCellsAround.forEach((i) => {
          if (!cellsAll.includes(this.elements[i])) {
            distance = this.findShortestPath(this.monsterSpace, this.elements[i]);
            if (this.elements[i].value > 0 && distance <= (this.state.shrinesDesecrated + 1)) {
              this.elements[i].isHighlighted = true;
            }
            cells2.push(this.elements[i]);
            cellsAll.push(this.elements[i]);
          }
        });
      })
      cells = cells2.slice();
    }


    this.setState({ redraw: !this.state.redraw })
  }

  moveMonster = (item) => {
    this.elements[this.monsterSpace.name].hasMonster = false;
    item.hasMonster = true;
    this.monsterSpace = item;
    this.setState({ playerSpace: item });
    this.resetHighlighted();
    this.setHeartRate();
    this.monsterProcessPounce();
    this.checkForVisiblePriest();
    this.checkForShrineZIndex(item)
  }

  checkForShrineZIndex = (space) => {
    let { top } = this.getNeighboringCells(space.name);
    let tippyTop = this.elements[top.name - 40];
    if (
      top.hasCache || tippyTop.hasCache ||
      top.hasBlessedCache || tippyTop.hasBlessedCache ||
      top.hasDesecratedCache || tippyTop.hasDesecratedCache) {
        this.setState({
          shrineIndexAdjustment: true,
        });
      } else if (this.state.shrineIndexAdjustment) {
        this.setState({
          shrineIndexAdjustment: false,
        });
      }
  }

  checkForVisiblePriest = () => {
    if (this.monsterSpace.name % this.cellsInRow === this.humanSpace.name % this.cellsInRow) {
      // they are in the same column, check to see if view is obstructed
      if (this.monsterSpace.name > this.humanSpace.name) {
        // north
        let cell = this.elements[this.monsterSpace.name - this.cellsInRow];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name - this.cellsInRow];
          }
        }
      } else if (this.monsterSpace.name < this.humanSpace.name) {
        // south
        let cell = this.elements[this.monsterSpace.name + this.cellsInRow];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name + this.cellsInRow];
          }
        }
      }
  } else if (Math.floor(this.monsterSpace.name / this.cellsInRow) === Math.floor(this.humanSpace.name / this.cellsInRow)) {
      // they are in the same row, check to see if view is obstructed
      if (this.monsterSpace.name > this.humanSpace.name) {
        // west
        let cell = this.elements[this.monsterSpace.name - 1];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name - 1];
          }
        }
      } else if (this.monsterSpace.name < this.humanSpace.name) {
        // east
        let cell = this.elements[this.monsterSpace.name + 1];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name + 1];
          }
        }
      }
    } else {
      this.setState({ opponentVisible: false });
    }
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
    this.setState({ redraw: !this.state.redraw})
  }

  moveHuman = (item) => {
    // player moves to the space
    // clear previous cell
    this.elements[this.humanSpace.name].hasHuman = false;
    // put human in new cell,
    item.hasHuman = true;
    // check if the space has a cache
    if (item.hasCache) {
      //take the cache
      this.collectShrine(item);
      // this.showSplashScreen('shrine', false);
      // console.log('shrine collected: ', this.state.shrinesHumanClaimed, this.state.shrinesMonsterClaimed, this.state.shrinesUnclaimed);
    }
    this.humanSpace = item;
    this.resetHighlighted();
    this.checkForShrineZIndex(item);
    this.setState({ playerSpace: item });
    this.setHeartRate();
  }

  handleChangePlayer = () => {
    if (this.state.isHuman) {
      this.setState({
        isHuman: false,
        playerSpace: this.monsterSpace,
        opponentVisible: false,
        humanFeedback: false,
      });
    } else {
      this.setState({
        isHuman: true,
        playerSpace: this.humanSpace,
        opponentVisible: false,
        monsterFeedback: false,
      });
    }
    this.setState({ turnCounter: 0 });
    this.setState({ outOfMoves: false });
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

  showSplashScreen = (image, touchable, duration) => {
    this.setState({
      animationType: image,
      animationTouchable: touchable,
      animationVisible: true,
      boardFinished: false,
      animationTimer: duration,
    })
  }

  renderAnimator = () => {
    if (this.state.animationVisible) {
      return(
        <View style={{ backgroundColor: '#000', flex: 1, zIndex: 2 }}>
          <AnimatedSplashScreen boardFinishedCallback={this.boardFinishedCallback} showAnimationCallback={this.animationCallback} animationType={this.state.animationType} touchable={this.state.animationTouchable} animationTimer={this.state.animationTimer} />
        </View>
      )
    }
  }

  closeModalDialogOnly = () => {
    this.setState({ modalDialogOnly: 0 });
    this.incrementTurnCounter();
  }

  renderEngine = () => {
    let disableGestures = this.state.outOfMoves;
    const menuRight = <Menu mode={this.state.isHuman ? 1 : 2} onItemSelected={this.onItemSelected}/>;
    const menuLeft = <Menu mode={0} onItemSelected={this.onItemSelected}/>;
    // const bar = <Bar
    //   outOfMoves={this.state.outOfMoves}
    //   isHuman={this.state.isHuman}
    //   onItemSelected={this.onItemSelected}
    //   shrineAmount={this.state.isHuman ? this.state.shrinesBlessed : this.state.shrinesDesecrated}
    //   shrinesUnclaimed={this.state.shrinesUnclaimed}
    //   heartBeatTimer={this.state.heartBeatTimer}
    //   humanShrinesToWin={this.humanShrinesToWin}
    //   monsterShrinesToWin={this.monsterShrinesToWin}
    //   monsterSanityLevel={this.state.monsterSanityLevel}
    //   barActive={true}
    // />;
    if (true) {
      return (
      <View>
        <Engine
          alterZoom={this.alterZoom}
          animationVisible={this.state.animationVisible}
          assignImageFogKeys={this.assignImageFogKeys}
          barActive={true}
          boardFinished={true}
          echolocate={this.echoLocate}
          feedbackSquare={this.state.feedbackSquare}
          focus={this.focus}
          gameActive={true}
          gameBoard={this.elements}
          gameBoardWidth={this.zoomedInValue*15}
          heartBeatTimer={this.state.heartBeatTimer}
          highlightFeedback={this.state.highlightFeedback}
          highlightFeedbackCallback={this.highlightFeedbackCallback}
          humanFeedback={this.setHeartRate.humanFeedback}
          humanSpace={this.humanSpace}
          humanShrinesToWin={this.humanShrinesToWin}
          incrementTurnCounter={this.incrementTurnCounter}
          isHuman={this.state.isHuman}
          justZoomed={this.state.justZoomed}
          monsterFeedback={this.state.monsterFeedback}
          monsterProcessPounce={this.monsterProcessPounce}
          monsterSanityLevel={this.state.monsterSanityLevel}
          monsterShrinesToWin={this.monsterShrinesToWin}
          monsterSpace={this.monsterSpace}
          move={this.state.isHuman ? this.moveHuman : this.moveMonster}
          onItemSelected={this.onItemSelected}
          opponentVisible={this.state.opponentVisible}
          outOfMoves={this.state.outOfMoves}
          playerSpace={this.state.playerSpace}
          resetHighlighted={this.resetHighlighted}
          showHumanMoves={this.showHumanMoves}
          tilesInRow={this.cellsInRow}
          shrineAmount={this.state.isHuman ? this.state.shrinesBlessed : this.state.shrinesDesecrated}
          shrineIndexAdjustment={this.state.shrineIndexAdjustment}
          shrinesUnclaimed={this.state.shrinesUnclaimed}
          showMonsterMoves={this.showMonsterMoves}
          tileWidth={this.state.tileWidth}
          turnCounter={this.state.turnCounter}
          zoomedInValue={this.zoomedInValue}
          zoomedOutValue={this.zoomedOutValue}
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
      </View>
      )
    }
  }

  render() {
    const finished = this.state.boardFinished;

      return (
        <View style={{flex:1, backgroundColor: "#212121"}}>

          {this.renderAnimator()}
          {this.renderEngine()}
        </View>
      )
    }
  }

export default Game;
