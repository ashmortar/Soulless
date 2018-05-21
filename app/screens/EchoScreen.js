import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

const ANIMATION_TIMER = 2000;

export default class EchoScreen extends Component {
  static propTypes = {
    callback: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(0),
    };
  }
  
  animateIn = () => {
    const { opacity } = this.state;
    Animated.timing(opacity, { toValue: 1, duration: ANIMATION_TIMER/2, useNativeDriver: true }).start();
  }

  animateOut = () => {
    const {opacity } = this.state;
    Animated.timing(opacity, { toValue: 0, duration: ANIMATION_TIMER/2, useNativeDriver: true }).start();
    setTimeout(function() {
      this.props.showAnimationCallback()
    }.bind(this), ANIMATION_TIMER);
  }
  
  componentDidMount() {
    this.props.boardFinishedCallback();
    this.animateIn();
  }

  animatedOpacity = () => ({ opacity: this.state.opacity })

// animatedSize = () => ({ width: this.state.size })

  render() {
    return (
      <Animated.View style={[styles.background, this.animatedOpacity()]}>
        <TouchableOpacity onPress={this.animateOut}>
          <Animated.Image style={[{width: 150}, this.animatedOpacity()]} resizeMode="contain" source={require("../data/images/echo-hands.png")} />
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    flex: 1,
  },
  text: {
    color: '#f500f5',
    opacity: 0.6,
    fontWeight: 'bold',
    fontSize: 18,
    padding: 50,
  },
});
