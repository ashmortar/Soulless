import PropTypes from 'prop-types';
import React from 'react';
import { View, Text } from 'react-native';

import styles from './styles';

const Header = ({ text }) => (
  <View style={styles.container}>
    <Text style={styles.headerText}>{text}</Text>
  </View>
);

Header.propTypes = {
  text: PropTypes.string,
};

export default Header;
