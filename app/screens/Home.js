import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, TouchableHighlight, ActivityIndicator, Dimensions, ImageBackground } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

var io = require('socket.io-client');

class Home extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.auth_token = null;
    this.state = {
      inputsVisible: false,
      phone: null,
      code: null,
      numberVerified: false,
      modalVisible: false,
      authorized: false,
      connectedToGame: false,
      auth_token: null,
      accessToken: null,
    }
  }


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
      });
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
            this.launchSocket();
          })

        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("successful");
          this.setState({connectedToGame: true})
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

  postEvent = () => {
      fetch("https://demonspell.herokuapp.com/api/games/" + this.state.accessToken + "/events", {
        headers: {
          'Content-Type': 'application/json',
          'auth_token': this.state.auth_token,
        },
        method: "POST",
        body: JSON.stringify({
          "data": "sample data"
        }),
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
          this.setState({connectedToGame: true})
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

  handlePressSendDataButton = () => {
    this.postEvent();
  }



  renderInputs = () => {

    if (this.state.inputsVisible) {

      if (this.state.connectedToGame) {
        return (
          <View
          style={{marginTop: 20, width: 150}}
          >
          <NavButton onPress={this.handlePressSendDataButton} text="send mock data" />
          </View>
        )
      }
      else if (this.state.authorized) {
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
              keyboardType={"numeric"}
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
              keyboardType={"numeric"}
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

  setModalVisible = () => {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  renderConnectingModal= () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {
          alert('Modal has been closed.');
        }}>
        <View style={{width: Dimensions.get("window").width*0.8, height: Dimensions.get("window").height*0.6, marginLeft: "auto", marginRight: "auto"}} >
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode="contain"
          >
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437'}}>searching for a partner ...</Text>
            <ActivityIndicator size={"large"}/>
            <NavButton onPress={this.setModalVisible} text='cancel search' />
          </ImageBackground>
        </View>
      </Modal>
    );
  }


  render() {
    return (
      <Container>
        <Header text="Home Screen" />
        <Blurb text="This is a statement that tells you something fun, cool or interesting. I guess it could be rules. Who knows?" />
        <NavButton onPress={this.handlePressPlayLocallyButton} text="Play locally" />

        {this.renderInputs()}
        {this.renderConnectingModal()}
      </Container>
    );
  }
}

export default Home;
