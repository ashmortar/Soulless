import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage, Image, TouchableOpacity } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';

import { Linking } from 'react-native';


class About extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

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
          }}>About</Text>
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

          }} >{`This is a game, created as an internship project at EyeCue Lab over the course of 7 weeks. Written in JavaScript, React Native.`}</Text>
        </View>


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
          }}>Credits</Text>
        </View>


        <View>
          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 24,
            marginBottom: 15,
            marginLeft: Dimensions.get("window").width* 0.05,
          }} >Development</Text>

          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 13,
            marginLeft: Dimensions.get("window").width* 0.1,

          }} >Aaron Ross</Text>
          <View style={{flexDirection: 'row', marginBottom: 15}}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/aaronrosspdx/')}>
              <Image
                style={{width: 35, height: 35, marginTop: 15, marginLeft: Dimensions.get("window").width* 0.2}}
                source={require("../data/images/linkedin.png")}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://github.com/ashmortar')}>
              <Image
              style={{width: 45, height: 45, marginTop: 13, marginLeft: Dimensions.get("window").width* 0.05}}
                source={require("../data/images/github.png")}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>


          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 13,
            marginLeft: Dimensions.get("window").width* 0.1,

          }} >Natalia Telpukhova</Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/natalia-telpukhova/')}>
              <Image
                style={{width: 35, height: 35, marginTop: 15, marginLeft: Dimensions.get("window").width* 0.2}}
                source={require("../data/images/linkedin.png")}
                resizeMode="contain"
                onPress={() => Linking.openURL('http://google.com')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://github.com/telpuhova')}>
              <Image
                style={{width: 45, height: 45, marginTop: 13, marginLeft: Dimensions.get("window").width* 0.05}}
                source={require("../data/images/github.png")}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

        </View>



        <View>
          <Text style={{
            fontFamily: 'Perfect DOS VGA 437',
            color: '#fff',
            fontSize: 24,
            marginLeft: Dimensions.get("window").width* 0.05,
            marginTop: 20,

          }} >Art work</Text>
        </View>



      </View>

    );
  }
}

export default About;
