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
      authorized: false,
      auth_token: null,
      accessToken: null,
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
        res.json();
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("successful");
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

  postLogin = (code) => {
      fetch("https://demonspell.herokuapp.com/api/login", {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          "code": code
        }),
      }).then(res => {
        res.json()
          .then((responseJSON) => {
             // do stuff with responseJSON here...
             this.setState({ auth_token: responseJSON.auth_token})
             console.log(this.state.auth_token);
          })
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("successful");
          this.setState({authorized: true})
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

  postGames = () => {//get access token
      fetch("https://demonspell.herokuapp.com/api/games", {
        headers: {
          'Content-Type': 'application/json',
          'auth_token': this.state.auth_token,
        },
        method: "POST",
      }).then(res => {
        res.json()
          .then((responseJSON) => {
            this.setState({ accessToken: responseJSON.accessToken})
            console.log(this.state.accessToken);
          })

        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("successful");
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




  handlePressPlayLocallyButton = () => {
    this.props.navigation.navigate('Game');
  };

  handlePressPlayOnlineButton = () => {
    this.setState({
      inputsVisible: true,
    })
  };

  handlePressLoginButton = () => {
    this.postLogin(this.state.code);
  }

  handlePressGetCodeButton = () => {
    if ((this.state.phone) && (this.state.phone.length === 10)) {
      this.postVerify(this.state.phone);
    }
  }

  handlePressHostJoinButton = () => {
    this.postGames();
  }


  renderInputs = () => {

    if (this.state.inputsVisible) {

      if (this.state.authorized) {
        return (
          <View
            style={{marginTop: 20, width: 150}}
          >


            <NavButton onPress={this.handlePressHostJoinButton} text="host/join" />
          </View>
        )
      }
      else if (this.state.numberVerified) {
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
    else {
      return (
        <NavButton onPress={this.handlePressPlayOnlineButton} text="Play online" />
      )
    }
  }


  render() {
    return (
      <Container>
        <Header text="Home Screen" />
        <Blurb text="This is a statement that tells you something fun, cool or interesting. I guess it could be rules. Who knows?" />
        <NavButton onPress={this.handlePressPlayLocallyButton} text="Play locally" />

        {this.renderInputs()}
      </Container>
    );
  }
}

export default Home;
