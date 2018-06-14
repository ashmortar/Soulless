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

  getExplanationStyle = () => {
    return ({
      justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
      left: 25 * 4, marginTop: 5, width: Dimensions.get("window").width - 25 * 4, fontSize: 12,
    });
  }

  getBlockStyles = () => {
    return ({flex: 1, flexDirection: 'row'});
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
            tileHeight={64}
            ticksPerFrame={8}
            tileWidth={64}
            scale={0.4}

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
        height: Dimensions.get("window").height,
      }}>


        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 50,
          marginBottom: 30
        }}>
          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 38,
            alignItems: 'center',
            justifyContent: 'center',
          }}>How to play a game</Text>
        </View>




        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: Dimensions.get("window").width * 0.8,
          marginLeft: Dimensions.get("window").width * 0.1,
          marginBottom: 20,
        }}>
          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 12,
            textAlign: 'center',

          }} >{`As a young priest, your goal is to collect enough shrines to weaken the Evil, save your mentor and escape.

As the Evil, you need to find and kill your opponent, or collect enough shrines to fully possess the old priest.`}</Text>
        </View>



        <View style={[this.getBlockStyles(), { marginBottom: 40 }]}>
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
            <Text style={this.getExplanationStyle()} >Echo locate. Reveals the map in specified direction. (Young priest only.)</Text>
        </View>


        <View style={this.getBlockStyles()}>
          <View style={{ marginLeft: 25 }}>
            <ControlButton tileWidth={25} source1={require("../data/images/focusOut.png")} source2={require("../data/images/focusIn.png")} onPress={()=>{}} />
          </View>
          <Text style={this.getExplanationStyle()} >Focus. Gives you direction and distance to the target. (Evil only.)</Text>
        </View>


        <View style={{flex: 2, flexDirection: 'column'}}>
          <View style={this.getBlockStyles()}>
          <View style={{ marginLeft: 25 }}>
          <ControlButton tileWidth={25} source1={require("../data/images/targetPriestOut.png")} source2={require("../data/images/targetPriestIn.png")} onPress={()=>{}} />
          </View>
          <Text style={this.getExplanationStyle()} >Focus on priest.</Text>
          </View>

          <View style={this.getBlockStyles()}>
          <View style={{ marginLeft: 25 }}>
          <ControlButton tileWidth={25} source1={require("../data/images/targetShrineOut.png")} source2={require("../data/images/targetShrineIn.png")} onPress={()=>{}} />
          </View>
          <Text style={this.getExplanationStyle()} >Focus on a closest shrine.</Text>
          </View>
        </View>


        <View style={this.getBlockStyles()}>
          <View style={{}}>
          </View>
          {this.renderHeartBeat()}
          <Text style={this.getExplanationStyle()} >Heartbeat. The closer the opponent, the faster it beats.</Text>
        </View>


        <View style={this.getBlockStyles(), { marginTop: 10 }}>
          <Image
            style={{width: 50, height: 25, marginTop: 5, marginLeft: 14}}
            source={require("../data/images/barShrineScreenshot.png")}
            resizeMode="contain"
          />
          <Text style={this.getExplanationStyle()} >Shrine counter. Shows how many shrines you have collected.</Text>
        </View>


        <View style={{flexDirection: 'column', marginTop: 10}}>
          <Image
            style={{width: Dimensions.get("window").width* 0.6, height: 70, marginTop: 5, marginLeft: Dimensions.get("window").width* 0.2}}
            source={require("../data/images/barSanityLevelScreenshot2.png")}
            resizeMode="contain"
          />
          <Text style={{
            justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', textAlign: 'center', marginLeft: Dimensions.get("window").width* 0.05, marginTop: 5, width: Dimensions.get("window").width* 0.9, fontSize: 12,
          }} >Shows you how far the old priest is from being fully possessed. It goes down every time Evil finds a shrine. When sanity level turns zero the game is over for the priest.</Text>
        </View>



      </View>
    );
  }
}
// <NavButton onPress={this.handlePressNavButton} text="back" />

export default HowTo;
