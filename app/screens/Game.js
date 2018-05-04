import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Dimensions, View } from 'react-native';
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
    // this.gridWidth = Dimensions.get('window').width * 0.9;
    // this.gridItemWidth = this.gridWidth / 10;

    this.gridItemWidth = 40;
    this.gridWidth = this.gridItemWidth * 20;
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  handlePressGridItem = (item) => {
    console.log('item pressed');
    console.log(item);
  };


  renderHeader = () => {
    return (
      <View style={{marginBottom: 20, marginTop: 40}}>
        <Text>Game screen</Text>
        <Header text="game screen" />
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
    const elements = [];
    for (let i = 0; i < 400; i++) {
      elements.push(i);
    }
    return (
      <Container>



        <Grid
          itemDimension={this.gridItemWidth}
          gridDimension={this.gridWidth}
          items={elements}
          onPress={this.handlePressGridItem}
          header={this.renderHeader}
          footer={this.renderFooter}

        />



      </Container>
    );
  }
}


export default Game;
