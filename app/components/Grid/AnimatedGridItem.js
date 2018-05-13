import React from "react";
import PropTypes from 'prop-types';
import { Animated, Text, View } from "react-native";

import styles from './styles';

export default class AnimatedGridITem extends React.Component {
   static propTypes = {
     animatedViewDimension: PropTypes.object,
     index: PropTypes.number,
     items: PropTypes.array,
     itemDimension: PropTypes.number,
   }
  state = {
    itemDimension: this.props.animatedViewDimension,
    // possibly also adjust opacity when animating?
    // opacity: this.props.animatedOpacity,
  };

  render() {
    let { itemDimension } = this.state;
    // console.log('itemDimension', itemDimension._value)
    return (
      <Animated.View style={[{ width: itemDimension, height: itemDimension }, styles.cell, this.props.items[this.props.index].value === 0 ? styles.wallTop : null, this.props.items[this.props.index].value === -1 ? styles.wallFacing : null, this.props.items[this.props.index].value > 0 ? styles.space : null, this.props.items[this.props.index].isHighlighted ? styles.highlighted : null]}>
        <Text style={{ fontSize: this.props.itemDimension * 0.6, textAlign: 'center' }}>{this.props.items[this.props.index].hasHuman ? 'P' : null}{this.props.items[this.props.index].hasMonster ? 'D' : null}{this.props.items[this.props.index].hasCache ? 'S' : null}</Text>
      </Animated.View>
    );
  }
}
