import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage, Image } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';


class HowTo extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  render() {
    return (
      <Container>
        <Header text="How to play a game" />

        <Blurb text={`As a young priest, your goal is to collect enough shrines to weaken the Evil, save your mentor and escape.

As the Evil, you need to find and kill your opponent, or collect enough shrines to fully possess the old priest.`} />


        <Image resizeMode="stretch" style={{ opacity: 1 }} source={require("../data/images/fog-e.gif")} />

        <NavButton onPress={this.handlePressNavButton} text="back" />
      </Container>
    );
  }
}

export default HowTo;
