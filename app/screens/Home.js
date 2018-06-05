import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

class Home extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      inputsVisible: false,
      phone: null,
      code: null,
      numberVerified: false,
    }
  }


  postVerify = (phone) => {
      fetch("https://demonspell.herokuapp.com/api/verify", {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
        	"phone": phone
        }),
      }).then(res => {
        console.log('hey');
        res.json()
        console.log(res);
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("posted");
          this.setState({numberVerified: true})
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


  // handlePressWaitingButton = () => {
  //   this.props.navigation.navigate('Waiting');
  // };
  //
  // handlePressConnectButton = () => {
  //   this.props.navigation.navigate('Connect');
  // };

  handlePressPlayLocallyButton = () => {
    this.props.navigation.navigate('Game');
  };

  handlePressPlayOnlineButton = () => {
    this.setState({
      inputsVisible: true
    })
  };

  handlePressLoginButton = () => {
    console.log('login');
  }

  handlePressGetCodeButton = () => {
    if ((this.state.phone) && (this.state.phone.length === 10)) {
      this.postVerify(this.state.phone);
    }
  }


  renderInputs = () => {

    if (this.state.inputsVisible) {

      if (this.state.numberVerified) {
        return (
          <View
            style={{marginTop: 20, width: 150}}
          >
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: '#fff'}}
              onChangeText={(code) => this.setState({code})}
            />

            <NavButton onPress={this.handlePressLoginButton} text="login" />
          </View>
        )
      }
      else {
        return (
          <View
            style={{marginTop: 20, width: 150}}
          >
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: '#fff'}}
              onChangeText={(phone) => this.setState({phone})}
            />

            <NavButton onPress={this.handlePressGetCodeButton} text="get code" />
          </View>
        )
      }

    }
  }


  render() {
    return (
      <Container>
        <Header text="Home Screen" />
        <Blurb text="This is a statement that tells you something fun, cool or interesting. I guess it could be rules. Who knows?" />
        <NavButton onPress={this.handlePressPlayLocallyButton} text="Play locally" />
        <NavButton onPress={this.handlePressPlayOnlineButton} text="Play online" />
        {this.renderInputs()}
      </Container>
    );
  }
  // <NavButton onPress={this.handlePressWaitingButton} text="go to waiting screen" />
  // <NavButton onPress={this.handlePressConnectButton} text="go to connect screen" />
}

export default Home;
