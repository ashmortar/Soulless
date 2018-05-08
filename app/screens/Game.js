import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Dimensions, View, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid } from '../components/Grid';
import { Header } from '../components/Header';
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
    this.getGridLayout();
    this.counter = 0;

    let gridItemWidth_default = 20;
    let gridWidth_default = gridItemWidth_default * 20;

    this.state = {
      gridItemWidth: gridItemWidth_default,
      gridWidth: gridWidth_default
    }
  }

  onPressZoomIn = () => {
    console.log('ZOOM pressed');
    if (this.scale < 3) {
      let gridItemWidth_new = this.state.gridItemWidth * 2;
      let gridWidth_new = gridItemWidth_new * 20;
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
      let gridWidth_new = gridItemWidth_new * 20;
      this.scale--;
      console.log(this.state.gridItemWidth);
      this.setState({
        gridItemWidth: gridItemWidth_new,
        gridWidth: gridWidth_new
      })
    }
  };

  getGridLayout = () => {
    for (let i = 0; i < 400; i++) {
      // this.elements.push(Math.floor(Math.random() * 5));
      this.elements.push(new Cell(i));
    }
    console.log("initial elements: ", this.elements);
    for (let i = 0; i < 150; i++) {
      this.elements[Math.floor(Math.random() * 400)].value = 0;
    }
    for (let i = 0; i < 400; i++) {
      // left: i+1
      // right: i-1
      // top: i-20
      // bottom: i+20
      if (this.elements[i].value != 0) {
        let adjacent = 0;
        if ((i % 20 != 19) && (this.elements[i + 1].value != 0)) { adjacent++; this.elements[i].edges.push(this.elements[i + 1]); }
        if ((i % 20 != 0) && (this.elements[i - 1].value != 0)) { adjacent++; this.elements[i].edges.push(this.elements[i - 1]); }
        if ((i - 20 > 0) && (this.elements[i - 20].value != 0)) { adjacent++; this.elements[i].edges.push(this.elements[i - 20]); }
        if ((i + 20 < 400) && (this.elements[i + 20].value != 0)) { adjacent++; this.elements[i].edges.push(this.elements[i + 20]); }
        this.elements[i].value = adjacent;
      }
    }
    console.log("final elements: ", this.elements);
  }

  findShortestPath(start, end) {
    let queue = [];
    let visited = [];
    let path = [];
    queue.push(start);
    while (queue.length > 0) {
      let cell = queue.shift();
      if (!visited.includes(cell)) {
        if (cell == end) {
          path.push(cell);
          let next = cell.parent;
          while (next) {
            path.push(next);
            next = next.parent;
          }
          console.log(path);
          break;
        } else {
          let next = cell.edges;
          for (let i = 0; i < next.length; i++) {
            let adjacent = next[i];
            queue.push(adjacent);
            adjacent.parent = next[i];
          }
          visited.push(cell);
        }
      }
    }
    for (let i = 0; i < path.length; i++) {
      console.log(path[i]);
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
        <NavButton onPress={this.handlePressNavButton} text="go to home screen" />
      </View>

    );
  };


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
        />

      </Container>
    );
  }
}


export default Game;


// node needs to know its "value" and its edges