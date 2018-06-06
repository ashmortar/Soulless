import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';
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

  parseGameEvent = (message) => {
    console.log('-----------------------------------');
    console.log(message);
  }



  launchSocket = () => {
    window.navigator.userAgent = 'ReactNative';
    const socket = io('http://demonspell.herokuapp.com', {
      transports: ['websocket']
    });
    // this.setState({ socket })
    socket.on('connect', () => {
      socket.emit('game', this.state.accessToken);
      socket.on('gameEvent', (message) => {
        this.parseGameEvent(message);
      });
      socket.on('disconnect', () => {
        this.renderEndGameDialog("USER_DISCONNECT");
      })
    });
  }

  componentWillMount = () => {
    console.log("stuff", this.props.navigation.state.params.auth_token, this.props.navigation.state.params.accessToken)
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
