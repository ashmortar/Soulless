import React from "react";
import { Animated, Text, View } from "react-native";

 export default class AnimatedGridITem extends React.Component {
  state = {
    fadeAnim: new Animated.Value(0), // Initial value for opacity: 0
  };

  componentDidMount() {
    // console.log('animated grid item', this.props);
    Animated.timing(
      // Animate over time
      this.state.fadeAnim, // The animated value to drive
      {
        toValue: 1, // Animate to opacity: 1 (opaque)
        duration: 500 // Make it take a while
      }
    ).start(); // Starts the animation
  }

  componentDidUpdate() {
    console.log('__item updated___', this.props.zoom, this.props.itemDimension, this.props.gridDimension);

  }

  render() {
    let { fadeAnim } = this.state;

    return (
      <Animated.View // Special animatable View
        style={{
          width: 50,
          height: 50,
          borderWidth: 2,
          backgroundColor: '#000',
          opacity: fadeAnim, // Bind opacity to animated value
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
