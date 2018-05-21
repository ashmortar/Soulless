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
    return(
      <View>
        <Text style={{
          color: '#fff',
          fontWeight: '600',
          fontSize: 20,
        }}>Choose an action:</Text>

        <NavButton
          onPress={() => this.props.onItemSelected('move')}
          text={'move'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('sniff')}
          text={'sniff'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('listen')}
          text={'listen'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('pounce')}
          text={'pounce'}
        />

      </View>
    );
  }

  getHumanMenu = () => {
    return(
      <View>
        <Text style={{
          color: '#fff',
          fontWeight: '600',
          fontSize: 20,
        }}>Choose an action:</Text>

        <NavButton
          onPress={() => this.props.onItemSelected('move')}
          text={'move'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('echo')}
          text={'echo'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('listen')}
          text={'listen'}
        />

      </View>
    );
  }


  getSettingsMenu = () => {
    return(
      <View>
        <Text style={{
          color: '#fff',
          fontWeight: '600',
          fontSize: 20,
        }}>Settings</Text>

        <NavButton
          onPress={() => this.props.onItemSelected('endTurn')}
          text={'end turn'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('home')}
          text={'home'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('zoom')}
          text={'zoom'}
        />

        <NavButton
          onPress={() => this.props.onItemSelected('exit')}
          text={'exit'}
        />

      </View>
    );
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
