import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Easing } from 'react-native';

const EXISTENCE_TIMER = 3000;
const ANIMATION_TIMER = EXISTENCE_TIMER - 2000;

export default class EchoScreen extends Component {
  static propTypes = {
    callback: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.small = 100;
    this.big = 115;
    this.state = {
      opacity: new Animated.Value(0),
      size: new Animated.Value(this.small),
    };
  }
  
  startAnimation = () => {
    const { opacity, size } = this.state;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: ANIMATION_TIMER/2 }),
        Animated.timing(opacity, { toValue: 0, duration: ANIMATION_TIMER/2 }),
      ]),
      Animated.timing(size, { toValue: this.big, duration: ANIMATION_TIMER, easing: Easing.linear })
    ]).start();
// bug: for some reason values below ~ 2.5 sec are ignored and callback is invoked quickly
    setTimeout(function() {this.props.callback()}.bind(this), EXISTENCE_TIMER);
  }

  componentDidMount() {
    this.startAnimation();
  }

  animatedOpacity = () => ({ opacity: this.state.opacity })

animatedSize = () => ({ width: this.state.size })

  render() {
    return (
      <Animated.View style={[styles.background, this.animatedOpacity()]}>
        <Animated.Image style={[this.animatedSize(), this.animatedOpacity()]} resizeMode="contain" source={require("../data/images/echo-hands.png")} />
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
    opacity: 0.9,
    fontWeight: 'bold',
    fontSize: 20,
  },
});
