import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, Text, Modal, TouchableHighlight, ActivityIndicator, Dimensions, ImageBackground } from "react-native";

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
    this.auth_token = null;
    this.state = {
      inputsVisible: false,
      phone: null,
      code: null,
      numberVerified: false,
      modalVisible: false,
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
          this.setState({
            numberVerified: true,
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
      });
  }

  postLogin = (code) => {
    console.log('postLogin()');
      fetch("https://demonspell.herokuapp.com/api/login", {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          "code": code
        }),
      }).then(res => {
        console.log('hey');
        console.log("response");
        if (res.error) {
          console.log('error');
        }
        if (res.status===200) {
          console.log("posted");
          res.json().then(data => {
            let { auth_token } = data;
            this.auth_token = auth_token;
            console.log(this.auth_token);
            this.setState({
              numberVerified: true,
              modalVisible: true,
            });
          })
          // console.log("authtoken", res.json().then)
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
    this.postLogin(this.state.code);
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
        <NavButton onPress={this.handlePressPlayOnlineButton} text="Play online" />
        {this.renderInputs()}
        {this.renderConnectingModal()}
      </Container>
    );
  }
  // <NavButton onPress={this.handlePressWaitingButton} text="go to waiting screen" />
  // <NavButton onPress={this.handlePressConnectButton} text="go to connect screen" />
}

export default Home;
