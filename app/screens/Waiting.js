import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

var io = require('socket.io-client');


class Waiting extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.auth_token = null;
    this.accessToken = null;
    this.phone = null;
    this.player_id = 0;
    this.player_number = 0;
    this.player2Ready = false;
    this.state = {
    }
  }


  componentDidMount() {
    console.log("waiting", this.props.navigation.state.params.auth_token, this.props.navigation.state.params.accessToken);
    AsyncStorage.getItem('auth_token').then((value) => console.log ("auth_token", value));


    this.auth_token = this.props.navigation.state.params.auth_token;
    this.accessToken = this.props.navigation.state.params.accessToken;
    this.phone = this.props.navigation.state.params.phone;


    this.launchSocket(this.props.navigation.state.params.accessToken);
    // this.getGameInfo();
  }


  launchSocket = (accessToken) => {
    console.log('launchSocket');
    window.navigator.userAgent = 'ReactNative';
    const socket = io('http://demonspell.herokuapp.com', {
      transports: ['websocket']
    });
    // this.setState({ socket })
    socket.on('connect', () => {
      console.log('socket on connect');
      socket.emit('game', accessToken);
      this.getGameInfo();
      socket.on('gameEvent', (message) => {
        console.log('socket on game event');
        this.parseGameEvent(message);
      });
      socket.on('disconnect', () => {
        console.log('socket on disconnect');
        // this.renderEndGameDialog("USER_DISCONNECT");
      })
    });
  }





  gamePrep = () => {
    if (this.player_number === 1) {
      //generate board
      //if board.done and player2.ready
      //then post board event
    }
    else if (this.player_number === 2) {
      //post event ready
      this.postEvent({"ready": "player2"})
    }
    else {
      console.log('player_number is invalid. gamePrep');
    }
  }

  parseGameInfo = (data) => {
    let phoneCompare = "+1" + this.phone;
    if (data.accessToken === this.accessToken) {
      if (data.player1.phone == phoneCompare) {
        // this.setState({ player_number: 1 });
        this.player_number = 1;
        console.log('player_number:' + this.player_number);
        this.gamePrep();
      }
      else if ((data.hasOwnProperty('player2')) && (data.player2.phone == phoneCompare)) {
        // this.setState({ player_number: 2 });
        this.player_number = 2;
        console.log('player_number:' + this.player_number);
        this.gamePrep();
      }
      else {
        console.log("phone number doesn't match");
        console.log(phoneCompare);
        console.log(data.player1.phone);
      }
    }
    else {
      console.log('accessToken does not match');
    }
  }

  getGameInfo = () => {
    fetch("https://demonspell.herokuapp.com/api/games/" + this.accessToken, {
      headers: {
        'Content-Type': 'application/json',
        'auth_token': this.auth_token,
      },
      method: "GET",
    }).then(res => {
      res.json()
      .then((responseJSON) => {
        console.log('responseJSON in getGameInfo');
        console.log(responseJSON);
        this.parseGameInfo(responseJSON);
      })
      if (res.error) {
        console.log('error');
      }
      if (res.status===200) {
        console.log("successful");
      }
    })
    .catch((e)=>{
      console.log(e);
      if (e.error === "Unauthorized") {
        navigation.connectionLost("THERE WAS AN ERROR WITH YOUR ACCOUNT");
      } else {
        navigation.connectionLost(context.props.navigator);
      }
      throw e;
    })
  }




  parseGameEvent = (message) => {
    console.log('-----------------------------------');
    console.log(message);
    if (message.ready) {
      console.log('player2 ready!');
      this.player2Ready = true;
    }
  }

  postEvent = (event) => {//event = {"data": "sample_data"}
    console.log('postEvent');
      fetch("https://demonspell.herokuapp.com/api/games/" + this.accessToken + "/events", {
        headers: {
          'Content-Type': 'application/json',
          'auth_token': this.auth_token,
        },
        method: "POST",
        body: JSON.stringify(event),
      }).then(res => {
        res.json()
          .then((responseJSON) => {
            console.log(responseJSON);
          })
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("successful");
        }
      })
      .catch((e)=>{
        console.log(e);
        if (e.error === "Unauthorized") {
          navigation.connectionLost("THERE WAS AN ERROR WITH YOUR ACCOUNT");
        } else {
          navigation.connectionLost(context.props.navigator);
        }
        throw e;
      })
  }



  handlePressNavButton = () => {
    // this.props.navigation.navigate('Home');
    this.postEvent({"button": "PRESSED"})
  };

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
