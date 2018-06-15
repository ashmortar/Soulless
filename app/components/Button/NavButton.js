import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';


const NavButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
  <View style={styles.wrapper}>
      <Text style={styles.text}>{text}</Text>
  </View>
  </TouchableOpacity>
);

NavButton.propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default NavButton;
