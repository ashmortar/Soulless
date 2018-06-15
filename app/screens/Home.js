import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, TextInput, View, Text, Modal, Dimensions, ImageBackground, AsyncStorage, StatusBar } from "react-native";

import { Container } from '../components/Container';

import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';
import BackStoryCrawl from './BackStoryCrawl';
import WideButton from '../components/Button/WideButton';

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
    StatusBar.setHidden(true);
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
        <View style={{alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <View style={{flex: 2, justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#8F72AD" style={{padding: 10}}/>
            <Text style={{
              color: "#fff",
              textAlign: 'center',
              fontFamily: 'Perfect DOS VGA 437',
              padding: 5,
            }}>Communicating with the servers</Text>
          </View>
          <View style={{flex: 1}} >
            <WideButton onPress={() => this.setModalVisible(false)} text="cancel" />
          </View>
        </View>
      )
    }
    else if (this.state.auth_token !== null) {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center' }}>
          <View style={{flex: 2, justifyContent: 'space-evenly'}}>
            <Text style={{
              color: "#fff",
              textAlign: 'center',
              fontFamily: 'Perfect DOS VGA 437',
              padding: 5,
            }}>Click below to find a game!</Text>
          </View>
          <View style={{flex: 1}} >
            <WideButton onPress={this.goOnline} text="host/join" />
            <WideButton onPress={() => this.setModalVisible(false)} text="cancel" />
          </View>
        </View>
      );
    } else if (this.state.numberVerified) {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center' }}>
          <View style={{flex: 2, justifyContent: 'space-evenly'}}>
            <Text style={{
              color: "#fff",
              textAlign: 'center',
              fontFamily: 'Perfect DOS VGA 437',
              padding: 5,
            }}>Enter the code in your SMS</Text>
            <TextInput
              ref={input => {this.textInput = input}}
              keyboardType={"numeric"}
              style={{ textAlign: 'center', borderColor: 'gray', borderWidth: 1, backgroundColor: '#fff', height: 40, width: Dimensions.get("window").width*0.75, marginLeft: "auto", marginRight: "auto"}}
              onChangeText={(code) => this.setState({code})}
            />
          </View>
          <View style={{flex: 1}}>
            <WideButton onPress={this.handlePressLoginButton} text="login" />
            <WideButton onPress={() => this.setModalVisible(false)} text="cancel" />
          </View>
        </View>
      )
    } else {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center' }}>
          <View style={{flex: 2, justifyContent: 'space-evenly'}}>
            <Text style={{
              color: "#fff",
              textAlign: 'center',
              fontFamily: 'Perfect DOS VGA 437',
              padding: 5,
            }}>Enter you phone number and press the button below to receive an SMS code for verification</Text>
            <TextInput
              ref={input => {this.textInput = input}}
              keyboardType={"numeric"}
              style={{ textAlign: 'center', borderColor: 'gray', borderWidth: 1, backgroundColor: '#fff', height: 40, width: Dimensions.get("window").width*0.75, marginLeft: "auto", marginRight: "auto"}}
              onChangeText={(phone) => this.setState({phone})}

            />
          </View>
          <View style={{flex: 1}} >
            <WideButton onPress={this.handlePressGetCodeButton} text="get code" />
            <WideButton onPress={() => this.setModalVisible(false)} text="cancel" />
          </View>
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
        <View style={{width: Dimensions.get("window").width*0.8, height: Dimensions.get("window").height*0.4, marginLeft: "auto", marginRight: "auto"}} >
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'column',
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode="stretch"
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
    // this.props.navigation.navigate('GameOver', { priestWon: false });
    this.props.navigation.navigate('About');

  }

  getTitleStyle = () => {
    return (
      {
        color: "#fff",
        textAlign: 'center',
        fontFamily: 'Perfect DOS VGA 437',
        fontSize: 60,
        marginTop: '55%',
        borderBottomWidth: 5,
        width: Dimensions.get('window').width*0.8,
        borderColor: '#fff',
        marginLeft: 'auto',
        marginRight: 'auto'

      }
    )
  }

  render() {
    let text = "";
    if (this.state.auth_token !== null) {
      text = "play online";
    } else {
      text = "log in";
    }
    return (
      <Container>
        <ImageBackground style={{height: Dimensions.get("window").height, width: Dimensions.get("window").width}} source={require('../data/images/MainTitle.jpg')} resizeMode="stretch">
          <Text style={this.getTitleStyle()}>Soulless</Text>
          <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 128, width: 256, marginTop: '10%', marginLeft: (Dimensions.get("window").width - 256)/2}} >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64}}>
              <WideButton onPress={this.handlePressPlayLocallyButton} text="play locally" />
              <WideButton onPress={this.handlePressPlayOnlineButton} text={text} />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64}}>
              <WideButton onPress={this.handlePressHowToButton} text="how to play" />
              <WideButton onPress={this.handlePressAboutButton} text="about" />
            </View>
          </View>
          {this.renderBackStoryCrawl()}


          {this.renderConnectingModal()}
        </ImageBackground>
      </Container>
    );
  }
}

export default Home;
