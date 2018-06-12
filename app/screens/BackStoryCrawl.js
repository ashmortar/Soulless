import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, TouchableWithoutFeedback, Text, Dimensions } from 'react-native';

export default class BackStoryCrawl extends Component {
  static propTypes = {
    dismissCrawl: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.screenDimensions = Dimensions.get("window");
    this.animationTimer = 2000;
    this.textCrawlDuration = 40000;
    this.state = {
      opacity: new Animated.Value(0),
      top: new Animated.Value(this.screenDimensions.height),
    };
  }

  animateIn = () => {
    Animated.timing(opacity, { toValue: 0.7, duration: this.animationTimer }).start();
  }

  componentDidMount() {
    const { opacity, top } = this.state;
    Animated.sequence([
      Animated.timing(opacity, {toValue: 0.7, duration: this.animationTimer }),
      Animated.timing(top, {toValue: -this.screenDimensions.height, duration: this.textCrawlDuration}),
      Animated.timing(opacity, {toValue: 0, duration: this.animationTimer})
    ]).start((finished) => {
      if (finished.finished) {
        this.props.dismissCrawl();
      }
    });
  }

  animatedOpacity = () => ({ opacity: this.state.opacity })

  animatedCrawl = () => ({ top: this.state.top })


  render() {
    const paragraph1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam et turpis non massa iaculis luctus eget eu nulla. Pellentesque euismod finibus dui ut porta. In ac luctus ante, eu pretium mi. Nam ultricies eros quis eros accumsan facilisis. Nam molestie, urna aliquet sollicitudin cursus, nunc nunc blandit tellus, et viverra diam nisi in turpis. Donec sem mi, sodales vel ipsum at, interdum sodales purus. Vivamus laoreet, odio sed venenatis porttitor, est tellus facilisis felis, a accumsan leo ante non mauris. Aliquam placerat lectus eu nisl sollicitudin pharetra. Nunc aliquet sapien et lorem congue laoreet. Quisque eros neque, luctus ac sagittis sit amet, vulputate vel justo. Nunc pellentesque lorem ut diam viverra, non vestibulum nulla sagittis. Mauris sit amet luctus ipsum. Nunc in molestie metus.";
    const paragraph2 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam et turpis non massa iaculis luctus eget eu nulla. Pellentesque euismod finibus dui ut porta. In ac luctus ante, eu pretium mi. Nam ultricies eros quis eros accumsan facilisis. Nam molestie, urna aliquet sollicitudin cursus, nunc nunc blandit tellus, et viverra diam nisi in turpis. Donec sem mi, sodales vel ipsum at, interdum sodales purus. Vivamus laoreet, odio sed venenatis porttitor, est tellus facilisis felis, a accumsan leo ante non mauris. Aliquam placerat lectus eu nisl sollicitudin pharetra. Nunc aliquet sapien et lorem congue laoreet. Quisque eros neque, luctus ac sagittis sit amet, vulputate vel justo. Nunc pellentesque lorem ut diam viverra, non vestibulum nulla sagittis. Mauris sit amet luctus ipsum. Nunc in molestie metus.";
      return (
        <TouchableWithoutFeedback onPress={this.props.dismissCrawl}>
          <Animated.View style={[styles.background, this.animatedOpacity()]}>
            <Animated.View style={[this.animatedCrawl()]}>
              <Text style={styles.text}>{paragraph1}</Text>
              <Text style={styles.text}>{paragraph2}</Text>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      );
    }
  }


const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    zIndex: 5,
  },
  text: {
    color: '#fff',
    fontFamily: 'Perfect DOS VGA 437',
    opacity: 1,
    fontSize: 18,
    textAlign: 'center',
    margin: 5,
    padding: 10,
  },
});

