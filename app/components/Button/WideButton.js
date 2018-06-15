import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ImageBackground, TouchableWithoutFeedback, Text, View } from 'react-native';

const regularSRC = require('../../data/images/buttonWideOut.png');
const depressedSRC = require('../../data/images/buttonWideIn.png');

export default class WideButton extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    text: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      source: regularSRC,
    };
  }

  _onPressIn = () => {
    this.setState({ source: depressedSRC })
  }
  _onPressOut = () => {
    this.setState({ source: regularSRC })
    this.props.onPress();
  }

  getTextStyle = () => {
    return (
      {
        fontSize: 12,
        color: '#fff',
        fontFamily: 'Perfect DOS VGA 437 Win',
        padding: 20,
      }
    )
  }

  render() {
    return (
        <ImageBackground source={this.state.source} style={{ width: undefined, height: undefined, alignItems: 'center', justifyContent: 'center', flex: 1}} resizeMode="contain">
          <TouchableWithoutFeedback
            onPressIn={this._onPressIn}
            onPressOut={this._onPressOut}
          >
            <Text style={this.getTextStyle()}>{this.props.text}</Text>
          </TouchableWithoutFeedback>
        </ImageBackground>
    );
  }
}