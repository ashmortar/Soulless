import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage, Image } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

import { Loop, Sprite } from 'react-game-kit/native';

import ControlButton from '../components/Button/ControlButton';



class HowTo extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };


  getPriestControlStyles = () => {
    return ({ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', flex: 1, width: 25 * 3 });
  }

  getControlButtonStyles = () => {
    return ({ height: 25, width: 25 * 3, flexDirection: 'row', justifyContent: 'center'});
  }

  getMonsterControlStyles = () => {}

  renderHeartBeat = () => {
      return (
        <Loop>
          <Sprite
            offset={[0, 0]}
            repeat={true}
            src={require("../data/images/heartBeatsmall.png")}
            steps={[9]}
            state={0}
            tileHeight={64}
            ticksPerFrame={8}
            tileWidth={64}
            scale={0.5}

          />
        </Loop>
      );
  }

  render() {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#212121',
        flexDirection: 'column',
        justifyContent: 'flex-start', alignItems: 'flex-start',
        height: Dimensions.get("window").height,
      }}>


        <Text style={{
          fontFamily: 'Perfect DOS VGA 437',
          color: '#fff',
          fontSize: 38,
          alignItems: 'center',
          justifyContent: 'center',

          height: 100,

        }}>How to play a game</Text>



        <Text style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Perfect DOS VGA 437', width: Dimensions.get("window").width * 0.8
        }} >{`As a young priest, your goal is to collect enough shrines to weaken the Evil, save your mentor and escape.

As the Evil, you need to find and kill your opponent, or collect enough shrines to fully possess the old priest.`}</Text>



        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: 25 * 12, marginTop: 20 }}>
            <View style={this.getPriestControlStyles()}>
              <View style={this.getControlButtonStyles()}>
                <ControlButton tileWidth={25} source1={require("../data/images/echoNorthOut.png")} source2={require("../data/images/echoNorthIn.png")} onPress={()=>{}} />
              </View>
              <View style={this.getControlButtonStyles()}>
                <ControlButton tileWidth={25} source1={require("../data/images/echoWestOut.png")} source2={require("../data/images/echoWestIn.png")} onPress={()=>{}} />
                <ControlButton tileWidth={25} source1={require("../data/images/echoBurstOut.png")} source2={require("../data/images/echoBurstIn.png")} onPress={()=>{}} />
                <ControlButton tileWidth={25} source1={require("../data/images/echoEastOut.png")} source2={require("../data/images/echoEastIn.png")} onPress={()=>{}} />
              </View>
              <View style={this.getControlButtonStyles()}>
                <ControlButton tileWidth={25} source1={require("../data/images/echoSouthOut.png")} source2={require("../data/images/echoSouthIn.png")} onPress={()=>{}} />
              </View>
            </View>
            <Text style={{
              flex: 1, justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
              left: 25 * 4, width: Dimensions.get("window").width - 25 * 5
            }} >Echo locate. Reveals the map in specified direction. (Young priest only.)</Text>
        </View>


        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: 25 * 12 }}>
          <View style={this.getMonsterControlStyles()} >
            <ControlButton tileWidth={25} source1={require("../data/images/focusOut.png")} source2={require("../data/images/focusIn.png")} onPress={()=>{}} />
          </View>
          <Text style={{
            flex: 1, justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
            left: 25 * 4, width: Dimensions.get("window").width - 25 * 5
          }} >Focus. Gives you direction and distance to the target. (Evil only.)</Text>
        </View>

        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <ControlButton tileWidth={25} source1={require("../data/images/targetPriestOut.png")} source2={require("../data/images/targetPriestIn.png")} onPress={()=>{}} />
            <Text style={{
              flex: 1, justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
              left: 25 * 4, marginTop: 5, width: Dimensions.get("window").width - 25 * 5
            }} >Focus on priest.</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <ControlButton tileWidth={25} source1={require("../data/images/targetShrineOut.png")} source2={require("../data/images/targetShrineIn.png")} onPress={()=>{}} />
            <Text style={{
              flex: 1, justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
              left: 25 * 4, marginTop: 5, width: Dimensions.get("window").width - 25 * 5
            }} >Focus on a closest shrine.</Text>
          </View>
        </View>




        {this.renderHeartBeat()}



        <NavButton onPress={this.handlePressNavButton} text="back" />
      </View>
    );
  }
}

export default HowTo;
