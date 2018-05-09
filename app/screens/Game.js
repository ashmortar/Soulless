import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Dimensions, View, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid } from '../components/Grid';
import Cell from '../data/Cell';

import WallTemplate from '../data/WallTemplate';


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

    this.cellsInRow = 40;
    this.cellsTotal = 1600;


    let gridItemWidth_default = 10;
    let gridWidth_default = gridItemWidth_default * this.cellsInRow;

    this.state = {
      gridItemWidth: gridItemWidth_default,
      gridWidth: gridWidth_default,
      redraw: false,
      player: 'human'
    }


  }

  componentDidMount() {
    console.log("componentDidMount");
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
        gridWidth: gridWidth_new
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
        gridWidth: gridWidth_new
      })
    }
  };

  getGridLayout = () => {

    for (let i = 0; i < this.cellsTotal; i++) {
      // this.elements.push(Math.floor(Math.random() * 5));
      this.elements.push(new Cell(i));
    }
    // console.log("initial elements: ", this.elements);
    for (let i = 0; i < 50; i++) {

      let rand = Math.floor(Math.random() * this.cellsTotal);

      console.log(WallTemplate[0]);
      console.log(WallTemplate[1]);
      console.log(WallTemplate[2]);

      if ((rand - 2 * this.cellsInRow >= -1) && ((rand + 1) % this.cellsInRow != 0)) {
        this.elements[rand].value = "";//starting cell
        this.elements[rand - this.cellsInRow].value = "";//top first
        this.elements[rand - 2 * this.cellsInRow].value = 0;//top second
        this.elements[rand + 1].value = "";//right cell
        this.elements[rand - this.cellsInRow + 1].value = "";//right top first
        this.elements[rand - 2 * this.cellsInRow + 1].value = 0;//right top second
      }


      // let typeOfWall = Math.floor(Math.random() * 3);

      let rand2 = rand + WallTemplate[0].x;
      if ((rand2 - 2 * this.cellsInRow >= -1) && ((rand2 + 1) % this.cellsInRow != 0)) {
        this.elements[rand2].value = "";//starting cell
        this.elements[rand2 - this.cellsInRow].value = "";//top first
        this.elements[rand2 - 2 * this.cellsInRow].value = 0;//top second
        this.elements[rand2 + 1].value = "";//right cell
        this.elements[rand2 - this.cellsInRow + 1].value = "";//right top first
        this.elements[rand2 - 2 * this.cellsInRow + 1].value = 0;//right top second
      }


      let rand3 = rand + WallTemplate[0].y;
      if ((rand3 - 2 * this.cellsInRow >= -1) && ((rand3 + 1) % this.cellsInRow != 0)) {
        this.elements[rand3].value = "";//starting cell
        this.elements[rand3 - this.cellsInRow].value = "";//top first
        this.elements[rand3 - 2 * this.cellsInRow].value = 0;//top second
        this.elements[rand3 + 1].value = "";//right cell
        this.elements[rand3 - this.cellsInRow + 1].value = "";//right top first
        this.elements[rand3 - 2 * this.cellsInRow + 1].value = 0;//right top second
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
          if (i - (this.cellsInRow - 1) > 0 && this.elements[i - (this.cellsInRow - 1)].value > 0) {
            this.elements[i].monsterEdges.push(this.elements[i - (this.cellsInRow - 1)]);
          }
          if (i + (this.cellsInRow + 1) < this.cellsTotal && this.elements[i + (this.cellsInRow + 1)].value > 0) {
            this.elements[i].monsterEdges.push(this.elements[i + (this.cellsInRow + 1)]);
          }
        }
        if ((i % this.cellsInRow > 0) && (this.elements[i - 1].value > 0)) {
          adjacent++;
          this.elements[i].humanEdges.push(this.elements[i - 1]);
          this.elements[i].monsterEdges.push(this.elements[i - 1]);
          if ((i - (this.cellsInRow + 1) > 0) && (this.elements[i - (this.cellsInRow + 1)].value > 0)) {
            this.elements[i].monsterEdges.push(this.elements[i - 21]);
          }
          if ((i + (this.cellsInRow - 1) < this.cellsTotal) && (this.elements[i + (this.cellsInRow - 1)].value > 0)) {
            this.elements[i].monsterEdges.push(this.elements[i + (this.cellsInRow - 1)]);
          }
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
        this.elements[i].value = adjacent;
      }
    }
    console.log("final elements: ", this.elements);
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
          }
          // log the path
          // console.log(path);
          // quit the function
          break;

        // if not the end find edges
        } else {
          // assign connections array as all edges from cell
          let connections;
          if (this.state.player == 'human') {
            connections = cell.humanEdges;
          }
          if (this.state.player == 'monster') {
            connections = cell.monsterEdges;
          }
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
    // for (let i = 0; i < path.length; i++) {
    //   console.log(path[i]);
    // }
    this.setState({ redraw: !this.state.redraw });
    setTimeout(this.resetGrid, 50);
  }

  resetGrid = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].highlighted = false;
      this.elements[i].parent = null;
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
    if (this.state.player == 'human') {
      this.setState({ player: 'monster' });
    }
    if (this.state.player == 'monster') {
      this.setState({ player: 'human' });
    }
  }

  renderHeader = () => {
    return (
      <View style={{marginBottom: 20, marginTop: 40}}>
        <Text>Game screen</Text>

        <TouchableOpacity onPress={this.onPressZoomIn} style={{width: 20}}>
          <View style={{
            backgroundColor: '#fff',
            alignItems: 'center',
            marginTop: 15,
            borderRadius: 10,
            borderColor: '#000',
            borderWidth: 1
          }}>
            <Text style={{fontWeight: 'bold'}}>+</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={this.onPressZoomOut} style={{width: 20}}>
          <View style={{
            backgroundColor: '#fff',
            alignItems: 'center',
            marginTop: 5,
            borderRadius: 10,
            borderColor: '#000',
            borderWidth: 1
          }}>
            <Text style={{fontWeight: 'bold'}}>-</Text>
          </View>
        </TouchableOpacity>

      </View>
    );
  };

  renderFooter = () => {
    return (
      <View style={{marginBottom: 20, marginTop: 0}}>
        <NavButton onPress={this.handleChangePlayer} text={this.state.player} />
        <NavButton onPress={this.handlePressNavButton} text="go to home screen" />
      </View>

    );
  };

  getCellStyle = (value) => {
    if (value === 0) {
      return {
        backgroundColor: "#000",
        borderWidth: 0.5,
        height: this.state.gridItemWidth
      }
    } else if (value === "") {
      return {
        backgroundColor: "#777",
        borderWidth: 0.5,
        height: this.state.gridItemWidth
      }
    } else {
      return {
        backgroundColor: "#fff",
        borderWidth: 0.5,
        height: this.state.gridItemWidth
      }
    }
  }

  render() {
    return (
      <Container>

        <Grid
          items={this.elements}
          onPress={this.handlePressGridItem}
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
