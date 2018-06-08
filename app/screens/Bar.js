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
    this.heartBeatSize = 200;
    this.heartBeatScale = 0.15;

  }

  renderHeartBeat = () => {
      return (
        <Loop>
          <Sprite
            offset={[0, 0]}
            repeat={true}
            src={require("../data/images/heartBeatTwo.png")}
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
            paddingHorizontal: 9,
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
      };

      return(
        <ImageBackground style={{flexDirection: 'column', height: undefined, width: undefined, flex: 1 }} source={require("../data/images/mainWindow.png")} resizeMode="stretch" >
          <View style={{flexDirection: 'row', alignItems: 'center', height: this.barSectionHeight, padding: 5, marginTop: 5, marginLeft: 5}}>

            <Text style={{color: '#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text1}</Text>

            <Image
              style={{ height: 25, width: 25, marginLeft: Dimensions.get("window").width / 6 }}
              source={require("../data/images/targetShrineOut.png")}
            />

            <Text style={{color: '#fff', marginLeft: 10}}>{shrineAmount}/{shrines}</Text>

            {this.renderHeartBeat()}

            {this.renderButton()}

          </View>
          <View style={{flexDirection: 'column', padding: 5, marginTop: 5, marginLeft: 5 }}>
            <Text style={{color: '#fff', paddingVertical: 10, fontFamily: 'Perfect DOS VGA 437',}}>{`Possessed priest's sanity level:`}</Text>
            <ProgressBarAnimated
              {...progressCustomStyles}
              width={Dimensions.get("window").width - 120}
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

            <Text style={{color: '#fff', marginHorizontal: 10, marginTop: 70, alignItems: 'center', justifyContent: 'center', fontFamily: 'Perfect DOS VGA 437', fontSize: 30}}>Waiting for opponent</Text>

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
      <View style={{position: "absolute", left: 5, bottom: 5, height: this.barHeight + 10, width: Dimensions.get("window").width - 10 }}>
        {barPlay}
        {barWait}
      </View>
    );
  }
}

export default Bar;
