import React from "react";
import { Animated, Text, View } from "react-native";

import styles from './styles';

const ANIMATION_DURATION = 500;

 export default class AnimatedGridITem extends React.Component {
  state = {
    fadeAnim: new Animated.Value(0), // Initial value for opacity: 0
    itemDimension: new Animated.Value(this.props.zoomedInValue)
  };

  componentDidMount() {
    // console.log('value', this.props.index)
  }
  //   this.zoomIn = Animated.timing(
  //   this.state.itemDimension,
  //   {
  //     toValue: { zoomedInValue },
  //   },
  // );
  // this.zoomOut = Animated.timing(
  //   this.state.itemDimension,
  //   { toValue: { zoomedOutValue },
  //   },
  // );
  componentDidUpdate() {
    if (this.state.itemDimension._value === this.props.zoomedInValue && this.props.zoom === "far") {
      // console.log('__dimensions__', this.props.zoomedInValue, this.props.zoomedOutValue)
      // console.log('zoom out began');
      // console.log("__itemDimension__", this.state.itemDimension);
      Animated.timing(
        this.state.itemDimension,
        {
          toValue: this.props.zoomedOutValue,
          duration: ANIMATION_DURATION,
        }
      ).start();
      // console.log("zoom out ended?");
      // console.log('__itemDimension__', this.state.itemDimension);
    }
    if (this.state.itemDimension._value === this.props.zoomedOutValue && this.props.zoom === "close") {
      // console.log('zoom in began');
      // console.log('__itemDimension__', this.state.itemDimension);
      Animated.timing(
        this.state.itemDimension,
        {
          toValue: this.props.zoomedInValue,
          duration: ANIMATION_DURATION,
        }
      ).start();
      // console.log('zoom in ended?');
      // console.log('__itemDimension__', this.state.itemDimension);
    }
  }

  render() {
    let { itemDimension } = this.state;

    return (
      <Animated.View
        style={[
          { width: itemDimension, height: itemDimension },
          styles.cell,
          this.props.items[this.props.index].value === 0 ? styles.wallTop : null,
          this.props.items[this.props.index].value === -1 ? styles.wallFacing : null,
          this.props.items[this.props.index].value > 0 ? styles.space : null,
          this.props.items[this.props.index].isHighlighted ? styles.highlighted : null,
        ]}
      >
        { this.props.children }
      </Animated.View>
    );
  }
}
