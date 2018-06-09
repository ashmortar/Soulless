import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';


const NavButton = ({ text, onPress }) => (
  <View style={styles.wrapper}>
  <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
  </View>
);

NavButton.propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default NavButton;
