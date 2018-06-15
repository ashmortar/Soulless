import PropTypes from 'prop-types';
import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

export default class GridItem extends React.PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
    name: PropTypes.number,
    cellStyle: PropTypes.object,
    itemDimension: PropTypes.func,
    hasHuman: PropTypes.bool,
    hasMonster: PropTypes.bool,
    hasCache: PropTypes.bool,
  }

  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress(this.props.name)} style={{ width: this.props.itemDimension }}>
        <View style={this.props.cellStyle} >
          <Text style={{ fontSize: this.props.itemDimension * 0.6, textAlign: 'center', color: '#ff00ff' }}>{this.props.hasHuman ? 'H' : null}{this.props.hasMonster ? 'M' : null}{this.props.hasCache ? 'C' : null}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}
