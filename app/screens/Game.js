import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Dimensions } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Grid } from '../components/Grid';


class Game extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  constructor() {
    super();
    this.gridWidth = Dimensions.get('window').width * 0.9;
    this.gridItemWidth = this.gridWidth / 10;
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  handlePressGridItem = (item) => {
    console.log('item pressed');
    console.log(item);
  };


  // renderHeader = () => {
  //   return (
  //     <Text>Header</Text>;
  //     <Text>game screen</Text>
  //     <Text>ghdhgfjhvklukhgvkh</Text>
  //   )
  // };
  //
  // renderFooter = () => {
  //   return(
  //     <Text>Footer</Text>;
  //     <NavButton onPress={this.handlePressNavButton} text="go to home screen" />
  //   )
  // };


  render() {
    const elements = [];
    for (let i = 0; i < 100; i++) {
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
