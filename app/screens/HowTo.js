import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage, Image, ScrollView } from "react-native";

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
    return ({flex: 1, flexDirection: 'row', alignItems: 'center' });
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
      <ScrollView 
        contentContainerStyle={{ justifyContent: 'space-between'}}
        style={{
          flex: 1,
          backgroundColor: '#212121',
          flexDirection: 'column',
          height: Dimensions.get("window").height,
        }}
      >


        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 50,
          marginBottom: 30,
        }}>
          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 38,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>How to Play</Text>
        </View>
        <View style={[this.getBlockStyles(), {height: 20}]}>
          <Loop>
            <Sprite
              offset={[0, 0]}
              repeat={true}
              src={require("../data/images/priestIdle.png")}
              steps={[15]}
              state={0}
              tileHeight={128}
              ticksPerFrame={8}
              tileWidth={64}
              scale={0.4}
            />
          </Loop>
          <Text style={[this.getExplanationStyle()]} >{`Levi, the young priest.  Your goal is to bless enough shrines to weaken the Evil possessing your mentor John and escape.`} </Text>
        </View>
        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 20 }]}>
          <Loop>
            <Sprite
              offset={[0, 0]}
              repeat={true}
              src={require("../data/images/priestIdle-ghost.png")}
              steps={[11]}
              state={0}
              tileHeight={128}
              ticksPerFrame={8}
              tileWidth={64}
              scale={0.4}
            />
          </Loop>
          <Text style={this.getExplanationStyle()} >{`John, the possessed priest. As the Evil possessing him your goal is to find and kill Levi, or desecrate enough shrines to fully possess John. To kill Levi you need to approach within 1 square.`} </Text>
        </View>


        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 20 }]}>
          <Image
            style={{width: 50, height: 50, marginTop: 5, marginLeft: 14}}
            source={require("../data/images/shrineShort.png")}
            resizeMode="contain"
          />
          <Text style={this.getExplanationStyle()} >{`Shrine. As Levi the player must move onto a shrine's space to bless it. As John the player must move within 1 square fo the shrine to desecrate it. After desecrating a shrine John's sanity will decrease and Levi will come one step closers to losing.  Levi will also gain additional movement after desecrating a shrine`} </Text>
        </View>


        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 45, marginBottom: 10}}>
          <Text style={{
            justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Perfect DOS VGA 437', marginTop: 5, fontSize: 24,
          }}>Controls</Text>
        </View>

        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 5 }]}>
          <Image
            style={{width: 60, height: 60, marginTop: 5, marginLeft: 14}}
            source={require("../data/images/highlightedRoute_priest.png")}
            resizeMode="contain"
          />
          <Text style={{
            justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
            left: 25 * 4, marginTop: 5, width: Dimensions.get("window").width - 25 * 8, fontSize: 12,
          }} >Highlighted route. Tap your character to see a highlighted route, then choose the square and tap it to make a move. </Text>
          <Image
            style={{width: 60, height: 60, position: 'absolute',
            left: Dimensions.get("window").width - 25 * 3, marginTop: 5}}
            source={require("../data/images/highlightedRoute_evil.png")}
            resizeMode="contain"
          />
        </View>

        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 5 }]}>
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
            <Text style={{justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
            left: 25 * 4, marginTop: 25, width: Dimensions.get("window").width - 25 * 4, fontSize: 12,}} >Echo. Since losing his vision Levi must Echo to reveal the basement.  Tap a direction to echo in that direction or tap the center to echo in a burst around Levi.</Text>
        </View>


        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 5 }]}>
          <View style={{ marginLeft: 25 }}>
            <ControlButton tileWidth={25} source1={require("../data/images/focusOut.png")} source2={require("../data/images/focusIn.png")} onPress={()=>{}} />
          </View>
          <Text style={{
            justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
            left: 25 * 4, marginTop: 0, width: Dimensions.get("window").width - 25 * 4, fontSize: 12,
          }} >Focus. The Evil possessing John can focus its power to detect nearby shrines or Levi to reveal direction and distance</Text>
        </View>


        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 5 }]}>
          <View style={{ marginLeft: 25 }}>
            <ControlButton tileWidth={25} source1={require("../data/images/targetPriestOut.png")} source2={require("../data/images/targetPriestIn.png")} onPress={()=>{}} />
          </View>
          <Text style={this.getExplanationStyle()} >Focus on Levi.</Text>
        </View>

        <View style={[this.getBlockStyles(), { marginTop: 10, marginBottom: 5 }]}>
          <View style={{ marginLeft: 25 }}>
            <ControlButton tileWidth={25} source1={require("../data/images/targetShrineOut.png")} source2={require("../data/images/targetShrineIn.png")} onPress={()=>{}} />
          </View>
          <Text style={this.getExplanationStyle()} >Focus on the closest shrine.</Text>
        </View>
        

        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 45, marginBottom: 10}}>
          <Text style={{
            justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Perfect DOS VGA 437', marginTop: 5, fontSize: 24,
          }}>Status bar</Text>
        </View>


        <View style={this.getBlockStyles()}>
          <View style={{}}>
          </View>
          {this.renderHeartBeat()}
          <Text style={{justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
          left: 25 * 4, marginTop: 25, width: Dimensions.get("window").width - 25 * 4, fontSize: 12,}} >Heartbeat. The closer your opponent, the faster it beats.</Text>
        </View>


        <View style={[this.getBlockStyles(), { marginTop: 10 }]}>
          <Image
            style={{width: 50, height: 25, marginTop: 5, marginLeft: 14}}
            source={require("../data/images/barShrineScreenshot.png")}
            resizeMode="contain"
          />
          <Text style={this.getExplanationStyle()} >Shrine counter. Shows how many shrines you have collected versus how many you need to win the game.</Text>
        </View>


        <View style={{flexDirection: 'column', marginTop: 10}}>
          <Image
            style={{width: Dimensions.get("window").width* 0.6, height: 70, marginTop: 5, marginLeft: Dimensions.get("window").width* 0.2}}
            source={require("../data/images/barSanityLevelScreenshot2.png")}
            resizeMode="contain"
          />
          <Text style={{
            justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', textAlign: 'center', marginLeft: Dimensions.get("window").width* 0.05, marginTop: 5, width: Dimensions.get("window").width* 0.9, fontSize: 12,
          }} >{`The John's sanity level bar. Shows you how far he is from being fully possessed. It decreases whenever a shrine is desecrated. When it reaches zero the Evil wins`}</Text>
        </View>





        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 45, marginBottom: 10}}>
          <Text style={{
            justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: 'Perfect DOS VGA 437', marginTop: 5, fontSize: 24,
          }}>Other</Text>
        </View>



        <View style={this.getBlockStyles(), { marginTop: 10, marginBottom: 15 }}>
          <Image
            style={{width: 50, height: 50, marginTop: 0, marginLeft: 14}}
            source={require("../data/images/finderButton.png")}
            resizeMode="contain"
          />
          <Text style={{
            justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
            left: 25 * 4, marginTop: 20, width: Dimensions.get("window").width - 25 * 4, fontSize: 12,
          }} >Locate your character on map. </Text>
        </View>


        <View style={this.getBlockStyles()}>
          <Image
            style={{width: 60, height: 100, marginTop: 5, marginLeft: 5}}
            source={require("../data/images/Screenshot_zoomIn.png")}
            resizeMode="contain"
          />
          <Image
            style={{width: 60, height: 100, marginTop: 5, marginLeft: 5}}
            source={require("../data/images/Screenshot_zoomOut.png")}
            resizeMode="contain"
          />
          <Text style={{
            justifyContent: 'flex-start', color: '#fff', fontFamily: 'Perfect DOS VGA 437', position: 'absolute',
            left: 25 * 6, marginTop: 20, width: Dimensions.get("window").width - 25 * 4, fontSize: 12,
          }} >Double tap to zoom. </Text>

        </View>




      </ScrollView>
    );
  }
}
// <NavButton onPress={this.handlePressNavButton} text="back" />

export default HowTo;
