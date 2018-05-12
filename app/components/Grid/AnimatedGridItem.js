import React from "react";
import { Animated, Text, View } from "react-native";

import styles from './styles';

 export default class AnimatedGridITem extends React.Component {
  state = {
    itemDimension: this.props.animatedViewDimension,
  };

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
