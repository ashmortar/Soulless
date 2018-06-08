import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions, Image, ImageBackground } from 'react-native';
import { Loop, Sprite } from 'react-game-kit/native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

import ProgressBarAnimated from 'react-native-progress-bar-animated';
// import ProgressBarClassic from 'react-native-progress-bar-classic';
// var ProgressBar = require('react-native-progress-bar');


class Bar extends Component {



  static propTypes = {
    isHuman: PropTypes.bool,
    outOfMoves: PropTypes.bool,
    onItemSelected: PropTypes.func,
    shrineAmount: PropTypes.number,
    shrinesUnclaimed: PropTypes.number,
    heartBeatTimer: PropTypes.number,
    humanShrinesToWin: PropTypes.number,
    monsterShrinesToWin: PropTypes.number,
    monsterSanityLevel: PropTypes.number,
    barActive: PropTypes.bool,
  }

  constructor() {
    super();
    this.barSectionHeight = 40;
    this.barHeight = this.barSectionHeight * 3;
    this.heartBeatSize = 64;
    this.heartBeatScale = 0.5;

  }

  renderHeartBeat = () => {
      return (
        <Loop>
          <Sprite
            offset={[0, 0]}
            repeat={true}
            src={require("../data/images/heartBeatsmall.png")}
            steps={[9]}
            state={0}
            tileHeight={this.heartBeatSize}
            ticksPerFrame={(this.props.heartBeatTimer)}
            tileWidth={this.heartBeatSize}
            scale={this.heartBeatScale}
      
          />
        </Loop>
      );
  }

  renderMenuButton = () => {

  }

  renderButton = () => {
    let marginLeft;
    if (this.props.isHuman) {
      marginLeft = Dimensions.get("window").width / 3 + 25;
    }
    else {
      marginLeft = Dimensions.get("window").width / 3 + 35;
    }
    if (this.props.outOfMoves) {
      return(
        <TouchableOpacity
          onPress={()=>{this.props.onItemSelected('endTurn');}}
          disabled={!this.props.outOfMoves}
          isVisible={this.props.outOfMoves}
        >
          <View style={{
            padding: 5,
            borderRadius: 25,
            borderColor: '#D57A66',
            borderWidth: 2,
            backgroundColor: '#343434',
            marginLeft: marginLeft,
          }}>
            <Text style={{ color: '#fff' }}>✓</Text>
          </View>
        </TouchableOpacity>
      );
    }
  }


  getBar = () => {
    if (this.props.barActive) {
      let text1;
      let shrines;
      let progress = 0.5;
      if (this.props.isHuman) {
        text1 = 'Priest';
        shrines = this.props.humanShrinesToWin;
      } else {
        text1 = 'Evil';
        shrines = this.props.monsterShrinesToWin;
      }
      let shrineAmount = this.props.shrineAmount;
      // let shrinesUnclaimed = this.props.shrinesUnclaimed;

      // let src={require("../data/images/shrine.png")}

      const progressCustomStyles = {
        backgroundColor: '#a30000',
        borderRadius: 0,
        borderColor: '#000',
        flex: 1,
        marginBottom: this.barHeight/2,
      };

      return(
        <ImageBackground style={{flexDirection: 'column', height: undefined, width: undefined, flex: 1 }} source={require("../data/images/mainWindow.png")} resizeMode="stretch" >
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, flex: 1}}>

            {/* <Text style={{color: '#fff', fontFamily: 'Perfect DOS VGA 437', fontSize: this.barSectionHeight/2.5, flex: 1,}}>{text1}</Text> */}

            <Image
              style={{flex: 1}}
              source={require("../data/images/shrineIconOnly.png")}
              resizeMode="contain"
            />

            <Text style={{color: '#fff', fontFamily: 'Perfect DOS VGA 437', fontSize: this.barSectionHeight/2, flex: 1}}>{shrineAmount}/{shrines}</Text>

            {this.renderHeartBeat()}

            {this.renderButton()}

          </View>
          <View style={{flexDirection: 'column', flex: 2, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{color: '#fff', fontFamily: 'Perfect DOS VGA 437', fontSize: this.barSectionHeight/2.5, flex: 1}}>{`Possessed priest's sanity level:`}</Text>
            <ProgressBarAnimated
              {...progressCustomStyles}
              width={Dimensions.get("window").width * 0.8}
              value={this.props.monsterSanityLevel}
            />

            {this.renderMenuButton()}
          </View>
        </ImageBackground>
      )
      // width={Dimensions.get("window").width - 35}
      // <View style={{flexDirection: 'row'}}>
    }
  }



  getBarWaitingForOpponent = () => {
    if (!this.props.barActive) {

      const progressCustomStyles = {
        backgroundColor: '#a30000',
        borderRadius: 0,
        borderColor: '#000',
      };

      return(
        <ImageBackground style={{flexDirection: 'column', height: undefined, width: undefined, flex: 1 }} source={require("../data/images/mainWindow.png")} resizeMode="stretch" >
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: this.barSectionHeight, padding: 5, marginTop: 5, marginLeft: 5}}>

            <Text style={{color: '#fff', marginLeft: Dimensions.get("window").width / 27, marginTop: Dimensions.get("window").height / 10, alignItems: 'center', justifyContent: 'center', fontFamily: 'Perfect DOS VGA 437', fontSize: 30}}>Waiting for opponent</Text>

          </View>
        </ImageBackground>
      )
      // <View style={{flexDirection: 'row'}}>
    }
  }



  render() {
    // console.log('heartbeat', this.props.heartBeatTimer)
    const barPlay = this.getBar();
    const barWait = this.getBarWaitingForOpponent();
    return (
      <View style={{position: "absolute", bottom: 5, left: 5, height: this.barHeight, width: Dimensions.get("window").width - 10 }}>
        {barPlay}
        {barWait}
      </View>
    );
  }
}

export default Bar;
