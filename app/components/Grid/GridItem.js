import PropTypes from 'prop-types';
import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

import styles from './styles';

const GridItem = ({
  text,
  onPress,
}) => (
  <TouchableHighlight onPress={onPress}>
    <View>
      <Text>{text}</Text>
    </View>
  </TouchableHighlight>
);

GridItem.propTypes = {
  text: PropTypes.text,
  onPress: PropTypes.func,
};

export default GridItem;
