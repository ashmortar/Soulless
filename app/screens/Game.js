import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Dimensions, View, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid } from '../components/Grid';
import { Header } from '../components/Header';


class Game extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  constructor() {
    super();
    // this.gridItemWidth = 40;
    // this.gridWidth = this.gridItemWidth * 20;

    this.scale = 0;

    this.elements = [];
    this.getGridLayout();


    // let gridWidth_default = Dimensions.get('window').width * 0.9;
    // let gridItemWidth_default = gridWidth_default / 20;

    let gridItemWidth_default = 20;
    let gridWidth_default = gridItemWidth_default * 20;

    this.state = {
      gridItemWidth: gridItemWidth_default,
      gridWidth: gridWidth_default
    }
  }


  getGridLayout = () => {
    for (let i = 0; i < 400; i++) {
      this.elements.push(Math.floor(Math.random() * 5));
    }
  }


  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  handlePressGridItem = (item) => {
    console.log('item pressed');
    console.log(item);
  };

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
      })
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
    )
  };

  renderFooter = () => {
    return(
      <View style={{marginBottom: 20, marginTop: 0}}>
        <NavButton onPress={this.handlePressNavButton} text="go to home screen" />
      </View>

    )
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
