import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions, BackAndroid, ImageBackground } from 'react-native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

import WideButton from '../components/Button/WideButton';

class GameOver extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    priestWon: PropTypes.bool,
  }


  // getMenu = () => {
  //   return(
  //     <View>
  //       <Header text="%game_name%" />
  //
  //       <NavButton
  //         onPress={() => this.props.navigation.navigate('Game')}
  //         text={'new game'}
  //       />
  //
  //       <NavButton
  //       onPress={() => this.props.navigation.navigate('Home')}
  //       text={'home'}
  //       />
  //
  //       <NavButton
  //         onPress={() => BackAndroid.exitApp()}
  //         text={'exit'}
  //       />
  //
  //     </View>
  //   );
  // }



  render() {
    // const menu = this.getMenu();
    let src;
    if (this.props.priestWon) {
      src = require('../data/images/MainTitlePixel.png');//temporary
    }
    else {
      src = require('../data/images/LoseScreen.jpg');
    }
    return (

      <Container>
        <ImageBackground style={{height: Dimensions.get("window").height, width: Dimensions.get("window").width}} source={src} resizeMode="stretch">
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: Dimensions.get("window").height/3,
          marginBottom: 30
        }}>
          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 38,
            alignItems: 'center',
            justifyContent: 'center',
          }}>GAME OVER</Text>
        </View>


        <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 128, width: 256, marginTop: 25, marginLeft: (Dimensions.get("window").width - 256)/2}} >
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64}}>
            <WideButton onPress={() => this.props.navigation.navigate('Home')} text="home" />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64}}>
            <WideButton onPress={() => BackAndroid.exitApp()} text="exit" />
          </View>
        </View>

        </ImageBackground>
      </Container>
    );
  }
}

export default GameOver;
