import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage } from "react-native";

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';
import BackStoryCrawl from './BackStoryCrawl';

import AnimatedSplashScreen from './AnimatedSplashScreen';

var io = require('socket.io-client');
let socket = null;
const BACKSTORYTIMEOUT = 10000;

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

      animationType: 'hands',
      animationTouchable: true,
      animationVisible: false,
      boardFinished: false,
      animationTimer: 1000,
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
    }.bind(this), BACKSTORYTIMEOUT);
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
    if (this.state.auth_token === null) {
      this.setModalVisible(true);
    } else {
      this.goOnline();
    }
  };

  goOnline = () => {
    this.setState({
      findingGame: true,
      modalVisible: true,
    });
    fetch("https://demonspell.herokuapp.com/api/games", {
      headers: {
        'Content-Type': 'application/json',
        'auth_token': this.state.auth_token,
      },
      method: "POST",
    }).then((res) => {
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          // console.log("successful");
          // this.launchSocket();
          res.json()
          .then((responseJSON) => {
            let {id, accessToken, player1, player2 } = responseJSON;
            this.setState({ accessToken: accessToken});
            // console.log(this.state.accessToken);
            if (player2) {
              console.log("working?");
            }
            this.handleBeginGame();
            this.setState({
              findingGame: false,
              modalVisible: false,
            });
          });
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
    console.log("data pressed");
    this.postEvent();
  }

  handleBeginGame = () => {
    this.setModalVisible(false);
    const { navigate } = this.props.navigation;
    navigate('Waiting', { auth_token: this.state.auth_token, accessToken: this.state.accessToken, phone: this.state.phone });
  }

  renderInputs = () => {
    if (this.state.findingGame) {
      return (
        <View>
          <ActivityIndicator size="large" color="#8F72AD" style={{padding: 10}}/>
          <Text style={{
            color: "#fff",
            textAlign: 'center',
            fontFamily: 'Perfect DOS VGA 437',
          }}>Communicating with the servers</Text>
          <NavButton onPress={() => this.setModalVisible(false)} text="cancel" />
        </View>
      )
    }
    else if (this.state.auth_token !== null) {
      return (
        <View>
          <Text style={{
            color: "#fff",
            textAlign: 'center',
            fontFamily: 'Perfect DOS VGA 437',
          }}>Click below to find a game!</Text>

          <NavButton onPress={this.goOnline} text="host/join" />
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
          this.setState({
            modalVisible: false,
          })
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
    clearInterval(this.timer);
    this.setState({
      crawlVisible: false,
    });
    this.timer = setInterval(function() {
      if (!this.state.crawlVisible) {
        this.setState({
          crawlVisible: true,
        })
      }
    }.bind(this), BACKSTORYTIMEOUT);
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



  boardFinishedCallback = () => (
    this.setState({
      boardFinished: true,
    })
  )

  showAnimationCallback = () => (
    this.setState({
      animationVisible: false,
      animateCamera: true,
    })
  )

  showSplashScreen = (image, touchable, duration) => {
    this.setState({
      animationType: image,
      animationTouchable: touchable,
      animationVisible: true,
      boardFinished: false,
      animationTimer: duration,
    })
  }

  renderAnimator = () => {
    if (this.state.animationVisible) {
      return(
        <View style={{ backgroundColor: '#000', flex: 1, zIndex: 2 }}>
          <AnimatedSplashScreen boardFinishedCallback={this.boardFinishedCallback} showAnimationCallback={this.animationCallback} animationType={this.state.animationType} touchable={this.state.animationTouchable} animationTimer={this.state.animationTimer} />
        </View>
      )
    }
  }

  handlePressHowToButton = () => {
    this.props.navigation.navigate('HowTo');

  }

  handlePressAboutButton = () => {
    this.props.navigation.navigate('About');

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

        <NavButton onPress={this.handlePressHowToButton} text="how to play" />
        <NavButton onPress={this.handlePressAboutButton} text="about" />

        {this.renderBackStoryCrawl()}


        {this.renderConnectingModal()}
      </Container>
    );
  }
}

export default Home;
