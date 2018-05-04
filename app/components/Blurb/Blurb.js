import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';

const Blurb = ({ text }) => (
  <View style={styles.container}>
    <Text style={styles.blurbText}>{text}</Text>
  </View>
);

Blurb.propTypes = {
  text: PropTypes.string,
};

export default Blurb;
