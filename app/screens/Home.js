import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

class Home extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }


  handlePressWaitingButton = () => {
    this.props.navigation.navigate('Waiting');
  };

  handlePressConnectButton = () => {
    this.props.navigation.navigate('Connect');
  };


  render() {
    return (
      <Container>
        <Header text="Home Screen yyyy" />
        <Blurb text="This is a statement that tells you something fun, cool or interesting. I guess it could be rules.  Who knows?" />
        <NavButton onPress={this.handlePressWaitingButton} text="go to waiting screen" />
        <NavButton onPress={this.handlePressConnectButton} text="go to connect screen" />
      </Container>
    );
  }
}

export default Home;
