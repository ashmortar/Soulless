import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Picker, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid } from '../components/Grid';
import WallTemplate from '../data/WallTemplate';
import Cell from '../data/Cell';

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


    let gridItemWidth_default = 10;
    let gridWidth_default = gridItemWidth_default * this.cellsInRow;

    this.state = {
      gridItemWidth: gridItemWidth_default,
      gridWidth: gridWidth_default,
      redraw: false,
      isHuman: false,
      echoDirection: 'radius',
    };
  }

  componentWillMount() {
    console.log("component Will Mount");
    this.getGridLayout();
  }

  onPressZoomIn = () => {
    console.log('ZOOM pressed');
    if (this.scale < 3) {
      let gridItemWidth_new = this.state.gridItemWidth * 2;
      let gridWidth_new = gridItemWidth_new * this.cellsInRow;
      this.scale++;
      console.log(this.state.gridItemWidth);
      this.setState({
        gridItemWidth: gridItemWidth_new,
        gridWidth: gridWidth_new,
      });
    }
  };

  onPressZoomOut = () => {
    console.log('ZOOM pressed');
    if (this.scale > 0) {
      let gridItemWidth_new = this.state.gridItemWidth / 2;
      let gridWidth_new = gridItemWidth_new * this.cellsInRow;
      this.scale--;
      console.log(this.state.gridItemWidth);
      this.setState({
        gridItemWidth: gridItemWidth_new,
        gridWidth: gridWidth_new,
      });
    }
  };


  getGridLayout = () => {
    this.createWalls();

    this.fillAngles();

    for (let i=0; i<this.cellsTotal; i++) {
      if (this.elements[i].value === 0) {
        this.fillGaps(i);
      }
    }

    //adding values to white cells
    this.addValuesToCells();
    // console.log("final elements: ", this.elements);
    this.assignHumanStart();
    this.assignMonsterStart();
    this.assignCacheLocations();

    for (let i=0; i<this.cellsTotal; i++) {
      if (this.elements[i].value === 0) {
        this.fillGaps(i);
      }
    }

    // this.fixClosedLoops();
    this.setState({ redraw: !this.state.redraw });
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
          // this.createWall_straightHorizontal(randStartingPoint, Math.floor(randLength));
          this.createWall_straightVertical(randStartingPoint, randLength);
          break;
        case 1:
          // this.createWall_straightVertical(randStartingPoint, randLength);
          this.createWall_straightHorizontal(randStartingPoint, Math.floor(randLength - 1));
          break;
        default:
          console.log('');
      }
    }

    // // columns
    // let randColAmount = Math.floor(Math.random() * 3);
    // for (let i=0; i < randColAmount; i++) {
    //   let randStartingPoint = Math.floor(Math.random() * this.cellsTotal);
    //   this.createWall_squareColumn(randStartingPoint);
    // }

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
        // console.log("black");
        for (let c = 0; c < counter; c++) {
          i -= this.cellsInRow;
          this.elements[i].value = 0;
        }
        break;
      }
      else if ((this.elements[i].value === -1) && (i + this.cellsInRow < this.cellsTotal)) {
        // console.log("grey");
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
          this.elements[k + this.cellsInRow].value = -1;
          this.elements[k + 2 * this.cellsInRow].value = -1;

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
          console.log('white space at:');
          console.log(i);
          this.createWall_squareColumn(i + 4 + 5 * this.cellsInRow);
          // break;
        }

      }
    }
  }

  fillWhiteHorLines = () => {
    console.log('fillWhiteHorLines called');
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - 2*this.cellsInRow - 11; i++) {
      // if ((this.elements[i].value > 0) && (i + 10 % this.cellsInRow != 0)) {
      if (this.elements[i].value > 0) {

        //horizontal white lines
        let flag = true;
        for (let k=0; k<11; k++) {
          if (this.elements[i + k].value <= 0) {
            flag = false;
            // break;
          }
        }

        if (flag) {
          //white hor line detected
          console.log('white line at:');
          console.log(i);
          this.createWall_straightVertical(i + 10 + 2 * this.cellsInRow, 2);
          // this.createWall_squareColumn(i + 4 + 5 * this.cellsInRow);
          // break;
        }
      }
    }
  }


  fillWhiteVertLines = () => {
    for (let i = 3 * this.cellsInRow + 1; i < this.cellsTotal - 10*this.cellsInRow; i++) {


      if (this.elements[i].value > 0) {

        //horizontal white lines
        let flag = true;
        for (let j=0; j<10; j++) {
          if (this.elements[i + j*this.cellsInRow].value <= 0) {
            flag = false;
            // break;
          }
        }
        if (flag) {
          //white space 9x9 detected
          // console.log('white space at:');
          // console.log(i);
          this.createWall_straightHorizontal(i + 10 * this.cellsInRow, 1);
          // break;
        }
      }
    }
  }


  fixClosedLoops = () => {
    // cellsInLoop.push(currentItem);
    let prevDirection;

    for (let j = this.cellsInRow + 1; j < this.cellsTotal - this.cellsInRow - 1; j++) {
      let i = j;
      let cellsInLoop = [];
      let firstCellIndex = i;
      if (this.elements[i].value > 0) {
        // console.log(i);
        // console.log('----------------------');


        while(true) {
          // console.log(i);
          // console.log('size:');
          // console.log(cellsInLoop.length);
          cellsInLoop.push(this.elements[i]);

          if ((cellsInLoop.length > 1) && (i === firstCellIndex)) {
            this.elements[i].isHighlighted = true;
            console.log('LOOP. at:');
            console.log(i);
            console.log('size:');
            console.log(cellsInLoop.length);
            console.log('in loop:--------------');
            for (let z = 0; z < cellsInLoop.length; z++) {
              console.log(cellsInLoop[z].name);
            }

            break;
          }

          if (cellsInLoop.length > 80) {
            break;
          }

          if ((i - 1 < 0) || (i - this.cellsInRow < 0) || (i + 1 > this.cellsTotal) || (i + this.cellsInRow > this.cellsTotal)) {
            continue;
          }



          if (this.elements[i].value <= 0) {
            break;
          }
          else if ((this.elements[i].value === 1) && (cellsInLoop.length != 1)) {
            switch (prevDirection) {
              case 0://->
                i--;//<-
                prevDirection = 3;
                break;
              case 1://^
                i += this.cellsInRow;//v
                prevDirection = 2;
                break;
              case 2://v
                i -= this.cellsInRow;//^
                prevDirection = 1;
                break;
              case 3://<-
                i++;//->
                prevDirection = 0;
                break;
              default:
                console.log('');
            }
          }
          else if ((this.elements[i - 1].value <= 0) && (this.elements[i - this.cellsInRow].value <= 0) && (this.elements[i + 1].value > 0)) {
            //  0
            //0 w
            if ((prevDirection === 1) || (cellsInLoop.length === 1)) {
              //->
              prevDirection = 0;
              i++;
            }
            else if (prevDirection === 3) {
              //v
              prevDirection = 2;
              i += this.cellsInRow;
            }

          }
          else if ((this.elements[i - 1].value <= 0) && (this.elements[i + this.cellsInRow].value <= 0) && (this.elements[i + 1].value > 0)) {
            if (cellsInLoop.length === 1) {
              break;
            }
            // 0 w
            //   0
            if (prevDirection === 3) {
              //^
              prevDirection = 1;
              i -= this.cellsInRow;
            }
            else if (prevDirection === 2) {
              //->
              prevDirection = 0;
              i++;
            }

          }
          else if ((this.elements[i + 1].value <= 0) && (this.elements[i - this.cellsInRow].value <= 0) && (this.elements[i - 1].value > 0)) {
            if (cellsInLoop.length === 1) {
              break;
            }
            //0
            //w 0
            if (prevDirection === 0) {
              //v
              prevDirection = 2;
              i += this.cellsInRow;
            }
            else if (prevDirection === 1) {
              //<-
              prevDirection = 3;
              i--;
            }

          }
          else if ((this.elements[i + 1].value <= 0) && (this.elements[i + this.cellsInRow].value <= 0) && (this.elements[i - 1].value > 0)) {
            if (cellsInLoop.length === 1) {
              break;
            }
            //w 0
            //0
            if (prevDirection === 2) {
              //<-
              prevDirection = 3;
              i--;
            }
            else if (prevDirection === 0) {
              //^
              prevDirection = 1;
              i -= this.cellsInRow;
            }
          }
          else if ((this.elements[i + 1].value > 0) && (this.elements[i + this.cellsInRow].value > 0) && (this.elements[i - 1].value > 0) && (this.elements[i - this.cellsInRow].value > 0)) {
            //surr by white
            // console.log('surr by white');
            if (cellsInLoop.length === 1) {
              break;
            }
            switch (prevDirection) {
              case 0://->
                i -= this.cellsInRow;//^
                prevDirection = 1;
                break;
              case 1://^
                i--;//<-
                prevDirection = 3;
                break;
              case 2://v
                i++;//->
                prevDirection = 0;
                break;
              case 3://<-
                i += this.cellsInRow;//v
                prevDirection = 2;
                break;
              default:
              console.log('');
            }
          }
          else {
            // console.log('else');
            if (cellsInLoop.length === 1) {
              break;
            }
            switch (prevDirection) {
              case 0://->
                i++;//->
                break;
              case 1://^
                i -= this.cellsInRow;//^
                break;
              case 2://v
                i += this.cellsInRow;//v
                break;
              case 3://<-
                i--;//<-
                break;
              default:
              console.log('');
            }
          }
        }
      }
    }

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
        this.elements[k].value = -1;//starting cell
        this.elements[k - this.cellsInRow].value = -1;//top first
        this.elements[k - 2 * this.cellsInRow].value = 0;//top second
        this.elements[k + 1].value = -1;//right cell
        this.elements[k - this.cellsInRow + 1].value = -1;//right top first
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
        this.elements[k].value = -1;//starting cell
        this.elements[k - this.cellsInRow].value = -1;//top first
        this.elements[k - 2 * this.cellsInRow].value = 0;//top second
      }
    }
  }

  createWall_squareColumn = (i) => {
    if ((i - 3 * this.cellsInRow >= 0) && (i+1 % this.cellsInRow != 0) && (i+1 < this.cellsTotal)) {

      for (let j=0; j<2; j++) {
        k = i + j;
        this.elements[k].value = -1;//starting cell
        this.elements[k - this.cellsInRow].value = -1;//top first
        this.elements[k - 2 * this.cellsInRow].value = 0;//top second
        this.elements[k - 3 * this.cellsInRow].value = 0;//top third
      }
    }
  }

  createWall_corner = () => {
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
          cell.highlighted = true;
          path.push(cell);
          // assign the next variable to the parent of the final cell
          let next = cell.parent;
          // continue up the chain of parents until we run out
          while (next) {
            // add to path
            next.highlighted = true;
            path.push(next);
            // reassign next to parent
            next = next.parent;
            if (path.length > 150) {
              break;
            }
          }
          // log the path
          // console.log(path);
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
      // console.log('path is unreachable');
    }
    // this.setState({ redraw: !this.state.redraw });
    setTimeout(this.resetGrid, 50);
    // console.log(path.length - 1);
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
    // console.log('human space: ', cell);
  }

  assignMonsterStart = () => {
    let cell = this.getRandomCell();
    let distance = this.findShortestPath(cell, this.humanSpace);
    while (cell.value < 1 || distance < 30) {
      cell = this.getRandomCell();
      distance = this.findShortestPath(cell, this.humanSpace);
    }
    cell.hasMonster = true;
    this.monsterSpace = cell;
    // console.log('monster space: ', cell);
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

  getRandomCell = () => (this.elements[Math.floor(Math.random() * this.cellsTotal)])

  resetGrid = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].highlighted = false;
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
        cell.highlighted = true;
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
        cell.highlighted = true;
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
        cell.highlighted = true;
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
        cell.highlighted = true;
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
    if (item.highlighted) {
      this.elements[this.humanSpace.name].hasHuman = false;
      item.hasHuman = true;
      this.humanSpace = item;
      this.resetGrid();
    } else {
      Alert.alert(
        'Uh-Oh',
        'Please select a highlighted space',
      );
    }
    this.setState({ redraw: !this.state.redraw });
  }

  getCellStyle = (item) => {
    if (this.state.isHuman) {
      if (item.isRevealed) {
        if (item.value === 0) {
          return {
            backgroundColor: "#000",
            borderWidth: 0.5,
            height: this.state.gridItemWidth,
          };
        } else if (item.value === -1) {
          return {
            backgroundColor: "#777",
            borderWidth: 0.5,
            height: this.state.gridItemWidth,
          };
        } else if (item.highlighted) {
          return {
            backgroundColor: '#ff00ff',
            borderWidth: 0.5,
            height: this.state.gridItemWidth,
          };
        } else {
          return {
            backgroundColor: "#fff",
            borderWidth: 0.5,
            height: this.state.gridItemWidth,
          };
        }
      } else {
        return {
          backgroundColor: "#000",
          borderWidth: 0.5,
          height: this.state.gridItemWidth,
        };
      }
    }
    if (item.value === 0) {
      return {
        backgroundColor: "#000",
        borderWidth: 0.5,
        height: this.state.gridItemWidth,
      };
    } else if (item.value === -1) {
      return {
        backgroundColor: "#777",
        borderWidth: 0.5,
        height: this.state.gridItemWidth,
      };
    } else if (item.highlighted) {
      return {
        backgroundColor: '#ff00ff',
        borderWidth: 0.5,
        height: this.state.gridItemWidth,
      };
    } else {
      return {
        backgroundColor: "#fff",
        borderWidth: 0.5,
        height: this.state.gridItemWidth,
      };
    }
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  handlePressGridItem = (item) => {
    if (this.counter === 0) {
      this.start = item;
      // console.log('start position: ', item);
      this.counter = 1;
    } else if (this.counter === 1) {
      this.end = item;
      // console.log('end position: ', item);
      this.findShortestPath(this.start, this.end);
      this.counter = 0;
    }
  };

  handleChangePlayer = () => {
    this.setState({ isHuman: !this.state.isHuman });
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
      <View style={{ marginBottom: 20, marginTop: 0 }}>
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
      <Container>
        {/* <ActivityIndicator size="large" color="#ff00ff" animating={this.state.isLoading} /> */}
        <Grid
          items={this.elements}
          onPress={this.moveHuman}
          header={this.renderHeader}
          footer={this.renderFooter}
          gridDimension={this.state.gridWidth}
          itemDimension={this.state.gridItemWidth}
          getCellStyle={this.getCellStyle}
        />

      </Container>
    );
  }
}


export default Game;


// node needs to know its "value" and its edges
