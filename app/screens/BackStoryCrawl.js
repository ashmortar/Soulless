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
    const { opacity } = this.state;
    Animated.timing(opacity, { toValue: 0.7, duration: this.animationTimer }).start();
  }

  componentDidMount() {
    const { opacity, top } = this.state;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.7, duration: this.animationTimer }),
      Animated.timing(top, { toValue: -this.screenDimensions.height, duration: this.textCrawlDuration }),
      Animated.timing(opacity, { toValue: 0, duration: this.animationTimer })
    ]).start((finished) => {
      if (finished.finished) {
        this.props.dismissCrawl();
      }
    });
  }

  animatedOpacity = () => ({ opacity: this.state.opacity })

  animatedCrawl = () => ({ top: this.state.top })


  render() {
      return (
        <TouchableWithoutFeedback onPress={this.props.dismissCrawl}>
          <Animated.View style={[styles.background, this.animatedOpacity()]}>
            <Animated.View style={[this.animatedCrawl()]}>
              <Text style={styles.text}>{text1}</Text>
              <Text style={styles.text}>{text2}</Text>
              <Text style={styles.text}>{text3}</Text>
              <Text style={styles.text}>{text4}</Text>
              <Text style={styles.text}>{text5}</Text>
              <Text style={styles.text}>{text6}</Text>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      );
    }
  }

const text1 = "In 1967, two priests, John, a seasoned exorcist, and his young apprentice, Levi were sent to a rural Mississippi town to investigate claims of demon possession.";

const text2 = "Once they arrived, things were not as they had expected. The townsfolk worshipped the demon and sabotaged their attempt to drive it from its altar. Levi barely escaped the battle losing his eyes in the process. John, however, was overwhelmed by the evil and that madness drove him deeper into the altar.";

const text3 = "Without the ability to see or help from townsfolk, Levi’s only choice was to re-enter the altar once more to free his colleague...";

const text4 = "...";

const text5 = "In order to weaken the evil’s grip on John, Levi needs to find and destroy 7 cursed shrines in the darkness.";

const text6 = "However, Levi must work quickly. John’s humanity is dwindling rapidly;  if Levi cannot find the shrines in time, he will lose John completely and become the next sacrifice.";

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
    fontFamily: 'Perfect DOS VGA 437 Win',
    opacity: 1,
    fontSize: 18,
    textAlign: 'center',
    margin: 5,
    padding: 10,
  },
});

