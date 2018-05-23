import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

export default class AnimatedSplashScreen extends Component {
  static propTypes = {
    showAnimationCallback: PropTypes.func,
    boardFinishedCallback: PropTypes.func,
    animationType: PropTypes.string,
    touchable: PropTypes.bool,
    animationTimer: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(0),
    };
  }

  animateIn = () => {
    const { opacity } = this.state;
    Animated.timing(opacity, { toValue: 1, duration: this.props.animationTimer/2, useNativeDriver: true }).start();
  }

  animateOut = () => {
    const {opacity } = this.state;
    Animated.timing(opacity, { toValue: 0, duration: this.props.animationTimer/2, useNativeDriver: true }).start();
    setTimeout(function() {
      this.props.showAnimationCallback()
    }.bind(this), this.props.animationTimer);
  }

  componentDidMount() {
    setTimeout(function() {
      this.props.boardFinishedCallback()
    }.bind(this), this.props.animationTimer)
    this.animateIn();
    if (!this.props.touchable) {
      setTimeout(function() {
        this.animateOut();
      }.bind(this), this.props.animationTimer);
    }
  }

  animatedOpacity = () => ({ opacity: this.state.opacity })

  renderImage = () => {
    if (this.props.animationType === 'shrine') {
      return (<Animated.Image style={[{width: 150}, this.animatedOpacity()]} resizeMode="contain" source={require("../data/images/shrine.png")} />);
    } else if (this.props.animationType === 'hands') {
      return (<Animated.Image style={[{width: 150}, this.animatedOpacity()]} resizeMode="contain" source={require("../data/images/echo-hands.png")} />);
    }
  }

  render() {
    if (!this.props.touchable) {
      return (
        <Animated.View style={[styles.background, this.animatedOpacity()]}>
          {this.renderImage()}
        </Animated.View>
      );
    } else {
      return (
        <Animated.View style={[styles.background, this.animatedOpacity()]}>
          <TouchableOpacity onPress={this.animateOut}>
            {this.renderImage()}
          </TouchableOpacity>
        </Animated.View>
      );
    }
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
