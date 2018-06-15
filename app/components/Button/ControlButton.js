import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableWithoutFeedback, View } from 'react-native';

export default class ControlButton extends Component {
  static propTypes = {
    source1: PropTypes.number,
    source2: PropTypes.number,
    onPress: PropTypes.func,
    tileWidth: PropTypes.number,
  }
  constructor(props) {
    super(props);
    this.state = {
      source: this.props.source1,
    };
  }

  _onPressIn = () => {
    this.setState({ source: this.props.source2 })
  }
  _onPressOut = () => {
    this.setState({ source: this.props.source1 })
    this.props.onPress();
  }

  render() {
    return (
      <TouchableWithoutFeedback
        style={{ width: this.props.tileWidth, height: this.props.tileWidth }}
        onPressIn={this._onPressIn}
        onPressOut={this._onPressOut}
      >
        <Image source={this.state.source} style={{ width: this.props.tileWidth, height: this.props.tileWidth}} />
      </TouchableWithoutFeedback>
    );
  }
}
