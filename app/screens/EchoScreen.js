import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Easing } from 'react-native';

const EXISTENCE_TIMER = 4000;
const ANIMATION_TIMER = EXISTENCE_TIMER;

export default class EchoScreen extends Component {
  static propTypes = {
    callback: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.small = 150;
    this.big = 175;
    this.state = {
      opacity: new Animated.Value(0),
      // size: new Animated.Value(this.small),
    };
  }
  
  startAnimation = () => {
    const { opacity, size } = this.state;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: ANIMATION_TIMER/2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: ANIMATION_TIMER/2, useNativeDriver: true }),
      ]),
      // Animated.timing(size, { toValue: this.big, duration: ANIMATION_TIMER, easing: Easing.bounce })
    ]).start();
// bug: for some reason values below ~ 2.5 sec are ignored and callback is invoked quickly
    setTimeout(function() {this.props.showAnimationCallback()}.bind(this), EXISTENCE_TIMER);
  }

  componentDidMount() {
    this.props.boardFinishedCallback();
    this.startAnimation();
  }

  animatedOpacity = () => ({ opacity: this.state.opacity })

// animatedSize = () => ({ width: this.state.size })

  render() {
    return (
      <Animated.View style={[styles.background, this.animatedOpacity()]}>
        <Animated.Image style={[{width: 150}, this.animatedOpacity()]} resizeMode="contain" source={require("../data/images/echo-hands.png")} />
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
