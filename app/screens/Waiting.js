import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

class Waiting extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }


  handlePressNavButton = () => {
    this.props.navigation.navigate('Home');
  };

  componentDidMount() {
    console.log("waiting", this.props.navigation.state.params.auth_token, this.props.navigation.state.params.accessToken)
  }

  render() {
    return (
      <Container>
        <Header text="waiting screen" />
        <Blurb text="waiting for player to join.." />
        <NavButton onPress={this.handlePressNavButton} text="Back" />
      </Container>
    );
  }
}

export default Waiting;
