import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions, BackAndroid, ImageBackground, Animated } from 'react-native';

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


  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(0),
    };
  }

  animateIn = () => {
    const { opacity } = this.state;
    Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true }).start();
  }



  componentDidMount() {
    this.animateIn();
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


  animatedOpacity = () => ({ opacity: this.state.opacity })


  render() {
    // const menu = this.getMenu();
    let src;
    if (this.props.navigation.state.params.priestWon) {
      src = require('../data/images/winScreen.png');
      return(
        <Container>
          <Animated.View style={this.animatedOpacity()}>


            <ImageBackground style={{height: Dimensions.get("window").height, width: Dimensions.get("window").width}} source={src} resizeMode="stretch">

          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: Dimensions.get("window").height/4,
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


          <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 192, width: 256, marginTop: Dimensions.get("window").height/6, marginLeft: (Dimensions.get("window").width - 256)/2}} >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64}}>
              <WideButton onPress={() => this.props.navigation.navigate('Home')} text="home" />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64}}>
              <WideButton onPress={() => BackAndroid.exitApp()} text="exit" />
            </View>
          </View>

          </ImageBackground>
          </Animated.View>
        </Container>
      );
    }
    else {
      src = require('../data/images/LoseScreen.jpg');
      return(
        <Container>
          <Animated.View style={this.animatedOpacity()}>


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
          </Animated.View>
        </Container>
      );
    }

  }
}

export default GameOver;
