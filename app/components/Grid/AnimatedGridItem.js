import React from "react";
import PropTypes from 'prop-types';
import { Animated, Text, View, TouchableOpacity } from "react-native";

import styles from './styles';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default class AnimatedGridITem extends React.Component {
   static propTypes = {
     itemDimension: PropTypes.object,
     index: PropTypes.number,
     items: PropTypes.array,
     zoomedInValue: PropTypes.number,
     zoomedOutValue: PropTypes.number,
     isZoomedIn: PropTypes.bool,
     children: PropTypes.any,
     alterZoom: PropTypes.func,
   }
  state = {
    itemDimension: this.props.itemDimension,
    // possibly also adjust opacity when animating?
    // opacity: this.props.animatedOpacity,
  };

  render() {
    let { itemDimension } = this.state;
    // console.log('itemDimension', itemDimension._value)
    return (
      <TouchableOpacity onLongPress={this.props.alterZoom} >
        <Animated.View style={[{ 
                        width: itemDimension, height: itemDimension },
                        styles.cell,
                        this.props.items[this.props.index].value === 0 ? styles.wallTop : null,
                        this.props.items[this.props.index].value === -1 ? styles.wallFacing : null,
                        this.props.items[this.props.index].value > 0 ? styles.space : null,
                        this.props.items[this.props.index].isHighlighted ? styles.highlighted : null,
                        ]}>
            <Text style={[
            this.props.isZoomedIn ? { fontSize: 20 } : { fontSize: 8 },
            { textAlign: 'center' }]}>
              {this.props.items[this.props.index].hasHuman ? 'P' : null}
              {this.props.items[this.props.index].hasMonster ? 'D' : null}
              {this.props.items[this.props.index].hasCache ? 'S' : null}
            </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}
