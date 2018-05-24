import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions, BackAndroid } from 'react-native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';


class GameOver extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }


  getMenu = () => {
    return(
      <View>
        <Header text="%game_name%" />

        <NavButton
          onPress={() => this.props.navigation.navigate('Game')}
          text={'new game'}
        />

        <NavButton
        onPress={() => this.props.navigation.navigate('Home')}
        text={'home'}
        />

        <NavButton
          onPress={() => BackAndroid.exitApp()}
          text={'exit'}
        />

      </View>
    );
  }



  render() {
    // const menu = this.getMenu();
    return (
      <Container>
        <Header text="%game_name%" />

        <NavButton
          onPress={() => this.props.navigation.navigate('Game')}
          text={'new game'}
        />

        <NavButton
        onPress={() => this.props.navigation.navigate('Home')}
        text={'home'}
        />

        <NavButton
          onPress={() => BackAndroid.exitApp()}
          text={'exit'}
        />
      </Container>
    );
  }
}

export default GameOver;
