import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';
import BackStoryCrawl from './BackStoryCrawl';

var io = require('socket.io-client');
let socket = null;
class Home extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.textInput = null;
    this.timer = null;
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
      crawlVisible: false,
    }
  }

  componentDidMount = () => {
    AsyncStorage.getItem('auth_token').then((value) => this.setState({ auth_token: value}));
    AsyncStorage.getItem('phone').then((value) => this.setState({ phone: value}));
    AsyncStorage.getItem('id').then((value) => this.setState({ id: value}));
    this.timer = setInterval(function() {
      if (!this.state.crawlVisible) {
        this.setState({
          crawlVisible: true,
        })
      }
    }.bind(this), 5000);
  }

  componentWillUnmount = () => {
    clearInterval(this.timer);
  }

  setAuthToken = (auth_token) => {
    AsyncStorage.setItem('auth_token', auth_token);
    this.setState({ auth_token: auth_token });
  }

  setPhoneAndId = (phone, id) => {
    AsyncStorage.setItem('phone', phone);
    AsyncStorage.setItem('id', id);
    this.setState({
      phone: phone,
      id: id,
    });
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
        res.json().then((response) => {
          this.setPhoneAndId(response.phone, response.id);
          console.log("verify", this.state.phone, this.state.id)
        })
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
            // this.launchSocket();
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
    navigate('Waiting', { auth_token: this.state.auth_token, accessToken: this.state.accessToken, phone: this.state.phone });
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

  dismissCrawl = () => {
    this.setState({
      crawlVisible: false,
    })
  }

  renderBackStoryCrawl = () => {
    if (this.state.crawlVisible) {
      return (
        <BackStoryCrawl
          dismissCrawl={this.dismissCrawl}
        />
      )
    }
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
        {this.renderBackStoryCrawl()}

        {this.renderConnectingModal()}
      </Container>
    );
  }
}

export default Home;
