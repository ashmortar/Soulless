import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { GameList } from '../components/GameList';

import testGames from '../data/testGames';

class Connect extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  handlePressNavButton = () => {
    this.props.navigation.navigate('Game');
  };

  render() {
    return (
      <Container>
        <Header text="Join a Game" />
        <GameList
          currentGames={testGames}
          onPress={this.handlePressNavButton}
        />
        <NavButton onPress={this.handlePressNavButton} text="connect to a game" />
      </Container>
    );
  }
}

export default Connect;
