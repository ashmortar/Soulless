import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

class Menu extends Component {
  static propTypes = {
    mode: PropTypes.number,//0 - settings, 1 - human, 2 - monster
    onItemSelected: PropTypes.func,
  }

  getMenu = () => {
    if (this.props.mode === 1) {
      return this.getHumanMenu();
    }
    else if (this.props.mode === 2) {
      return this.getMonsterMenu();
    }
    else {
      return this.getSettingsMenu();
    }
  }

  getMonsterMenu = () => {
    return(<Text>Monster menu</Text>);
  }

  getHumanMenu = () => {
    return(<Text>Human menu</Text>);
  }

  getSettingsMenu = () => {
    return(<Text>Settings menu</Text>);
  }



  render() {
    const menu = this.getMenu();
    return (
      <Container>
        {menu}
      </Container>
    );
  }
}

export default Menu;
