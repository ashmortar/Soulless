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
      isHuman: true,
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

    for (let i = 0; i < this.cellsTotal; i++) {
      if (this.elements[i].value === 0) {
        // console.log(i);
        this.fillGaps(i);
      }
    }
    // adding values to white cells
    this.addValuesToCells();
    // console.log("final elements: ", this.elements);
    this.assignHumanStart();
    this.assignMonsterStart();
    this.assignCacheLocations();
  }

  createWalls = () => {
    for (let i = 0; i < this.cellsTotal; i++) {
      // this.elements.push(Math.floor(Math.random() * 5));
      this.elements.push(new Cell(i));
    }
    // console.log("initial elements: ", this.elements);
    for (let i = 0; i < 50; i++) {

      let rand = Math.floor(Math.random() * this.cellsTotal);


      if ((rand - 2 * this.cellsInRow >= -1) && ((rand + 1) % this.cellsInRow != 0)) {
        this.elements[rand].value = -1; // starting cell
        this.elements[rand - this.cellsInRow].value = -1; // top first
        this.elements[rand - 2 * this.cellsInRow].value = 0; // top second
        this.elements[rand + 1].value = -1; // right cell
        this.elements[rand - this.cellsInRow + 1].value = -1; // right top first
        this.elements[rand - 2 * this.cellsInRow + 1].value = 0; // right top second


        let typeOfWall = Math.floor(Math.random() * 2);

        let rand2 = rand + WallTemplate[typeOfWall].x;
        if ((rand2 < this.cellsTotal) && ((rand2 + 1) % this.cellsInRow != 0)) {
          this.elements[rand2].value = -1; // starting cell
          this.elements[rand2 - this.cellsInRow].value = -1; // top first
          this.elements[rand2 - 2 * this.cellsInRow].value = 0; // top second
          if (typeOfWall != 1) {
            this.elements[rand2 + 1].value = -1; // right cell
            this.elements[rand2 - this.cellsInRow + 1].value = -1; // right top first
            this.elements[rand2 - 2 * this.cellsInRow + 1].value = 0; // right top second
          }

          let rand3 = rand + WallTemplate[typeOfWall].y;
          if ((rand3 < this.cellsTotal) && ((rand3 + 1) % this.cellsInRow != 0)) {
            this.elements[rand3].value = -1; // starting cell
            this.elements[rand3 - this.cellsInRow].value = -1; // top first
            this.elements[rand3 - 2 * this.cellsInRow].value = 0; // top second
            if (typeOfWall != 1) {
              this.elements[rand3 + 1].value = -1; // right cell
              this.elements[rand3 - this.cellsInRow + 1].value = -1; // right top first
              this.elements[rand3 - 2 * this.cellsInRow + 1].value = 0; // right top second
            }
          }
        }
      }

      // if (rand - 2 * this.cellsInRow >= 0) {
      // }
      //
      // if ((rand + 1) % this.cellsInRow != 0) {
      // }
      // if (((rand - this.cellsInRow + 1) % this.cellsInRow != 0) && (rand - this.cellsInRow + 1 >= 0)) {
      // }
      // if (((rand - 2 * this.cellsInRow + 1) % this.cellsInRow != 0) && (rand - 2 * this.cellsInRow + 1 >= 0)) {
      // }
    }
  }

  fillGaps = (i) => {
    let counter = 0;
    i += this.cellsInRow;
    while (true) {
      if (this.elements[i].value === 0) {
        // console.log("black");
        for (let c = 0; c < counter; c++) {
          i -= this.cellsInRow;
          this.elements[i].value = 0;
        }
        break;
      } else if ((this.elements[i].value === "") && (i + this.cellsInRow <= this.cellsTotal)) {
        // console.log("grey");
        i += this.cellsInRow;
        counter++;
      } else {
        // console.log("white");
        break;
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
      console.log('path is unreachable');
    }
    // this.setState({ redraw: !this.state.redraw });
    setTimeout(this.resetGrid, 50);
    console.log(path.length - 1);
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
    console.log('human space: ', cell);
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
    console.log('monster space: ', cell);
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
      console.log('start position: ', item);
      this.counter = 1;
    } else if (this.counter === 1) {
      this.end = item;
      console.log('end position: ', item);
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
