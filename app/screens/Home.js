import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, TouchableHighlight, ActivityIndicator, Dimensions, ImageBackground, AsyncStorage } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';

var io = require('socket.io-client');
let socket = null;
class Home extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.textInput = null;
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
      findingGame: false,
    }
  }

  componentDidMount = () => {
    AsyncStorage.getItem('auth_token').then((value) => this.setState({ auth_token: value}));
  }

  setAuthToken = (auth_token) => {
    AsyncStorage.setItem('auth_token', auth_token);
    this.setState({ auth_token: auth_token });
  }


  parseGameEvent = (message) => {
    console.log('-----------------------------------');
    console.log(message);
  }



  launchSocket = (responseJSON) => {
    window.navigator.userAgent = 'ReactNative';
    socket = io('http://demonspell.herokuapp.com', {
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
          // console.log("successful");
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
             this.setAuthToken(responseJSON.auth_token);
             console.log("set", this.state.auth_token);
          })
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          // console.log("successful");
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
          if (res.error) {
            console.log('error');
          }
          if (res.status===200) {
            // console.log("successful");
            this.setState({connectedToGame: true})
            this.launchSocket();
            res.json()
            .then((responseJSON) => {
              let {id, accessToken, player1, player2 } = responseJSON;
              this.setState({ accessToken: accessToken})
              // console.log(this.state.accessToken);
              if (player2) {
                console.log("working?");
              }
            })
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

  postEvent = (data) => {
      fetch("https://demonspell.herokuapp.com/api/games/" + this.state.accessToken + "/events", {
        headers: {
          'Content-Type': 'application/json',
          'auth_token': this.state.auth_token,
        },
        method: "POST",
        body: JSON.stringify({
          data: data,
        }),
      }).then(res => {
        res.json()
          .then((responseJSON) => {
            // console.log(responseJSON);
          })
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("POST EVENT successful");
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
    this.setModalVisible(true);
  };

  handlePressLoginButton = () => {
    this.postLogin(this.state.code);
    this.textInput.clear();
  }

  handlePressGetCodeButton = () => {
    if ((this.state.phone) && (this.state.phone.length === 10)) {
      this.postVerify(this.state.phone);
      this.textInput.clear();
    }
  }

  handlePressHostJoinButton = () => {
    this.postGames();
  }

  handlePressSendDataButton = () => {
    console.log("data pressed")
    this.postEvent();
  }

  handleBeginGame = () => {
    this.setModalVisible(false);
    const { navigate } = this.props.navigation;
    navigate('Waiting', { auth_token: this.state.auth_token, accessToken: this.state.accessToken });
  }

  renderInputs = () => {
    if (this.state.connectedToGame) {
      return (
        <View>
          <Text style={{
            color: "#fff",
            textAlign: 'center',
            fontFamily: 'Perfect DOS VGA 437',
          }}>Game initiated, press below to begin</Text>

          <NavButton onPress={this.handleBeginGame} text="begin" />
          <NavButton onPress={() => this.setModalVisible(false)} text="cancel" />
        </View>
      )
    }
    if (this.state.auth_token !== null) {
      return (
        <View>
          <Text style={{
            color: "#fff",
            textAlign: 'center',
            fontFamily: 'Perfect DOS VGA 437',
          }}>Click below to find a game!</Text>

          <NavButton onPress={this.handlePressHostJoinButton} text="host/join" />
          <NavButton onPress={() => this.setModalVisible(false)} text="cancel" />

        </View>
      );
    } else if (this.state.numberVerified) {
      return (
        <View>
          <Text style={{
            color: "#fff",
            textAlign: 'center',
            fontFamily: 'Perfect DOS VGA 437',
          }}>Enter the code in your SMS</Text>
          <TextInput
            ref={input => {this.textInput = input}}
            keyboardType={"numeric"}
            style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: '#fff', width: 150, marginLeft: "auto", marginRight: "auto", marginTop: 10}}
            onChangeText={(code) => this.setState({code})}
          />

          <NavButton onPress={this.handlePressLoginButton} text="login" />
          <NavButton onPress={() => this.setModalVisible(false)} text="cancel" />

        </View>
      )
    } else {
      return (
        <View>
          <Text style={{
            color: "#fff",
            textAlign: 'center',
            fontFamily: 'Perfect DOS VGA 437',
          }}>Enter you phone number and press the button below to receive an SMS code for verification</Text>
          <TextInput
            ref={input => {this.textInput = input}}
            keyboardType={"numeric"}
            style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: '#fff', width: 150, marginLeft: "auto", marginRight: "auto", marginTop: 10}}
            onChangeText={(phone) => this.setState({phone})}

          />

          <NavButton onPress={this.handlePressGetCodeButton} text="get code" />
          <NavButton onPress={() => this.setModalVisible(false)} text="cancel" />

        </View>
      );
    }
    // if (this.state.inputsVisible) {

    //   if (this.state.connectedToGame) {
    //     return (
    //       <View
    //       style={{marginTop: 20, width: 150}}
    //       >
    //       <NavButton onPress={this.handlePressSendDataButton} text="send mock data" />
    //       </View>
    //     )
    //   }
    //   else if (this.state.authorized) {
    //     return (
    //       <View
    //       style={{marginTop: 20, width: 150}}
    //       >
    //       </View>
    //     )
    //   }
      // else if (this.state.numberVerified) {

      // }
    //   else {

    //   }

    // }
    // else {
    //   return (
    //     <NavButton onPress={this.handlePressPlayOnlineButton} text="Play online" />
    //   )
    // }
  }

  setModalVisible = (boolean) => {
    this.setState({modalVisible: boolean});
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
            {this.renderInputs()}
          </ImageBackground>
        </View>
      </Modal>
    );
  }


  render() {
    let text = "";
    if (this.state.auth_token !== null) {
      text = "find an online game";
    } else {
      text = "log in to play online";
    }
    return (
      <Container>
        <Header text="Home Screen" />
        <Blurb text="This is a statement that tells you something fun, cool or interesting. I guess it could be rules. Who knows?" />
        <NavButton onPress={this.handlePressPlayLocallyButton} text="Play locally" />
        <NavButton onPress={this.handlePressPlayOnlineButton} text={text} />

        {this.renderConnectingModal()}
      </Container>
    );
  }
}

export default Home;
