import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SideMenu from 'react-native-side-menu';
import Modal from "react-native-modal";
import { AsyncStorage, View, Dimensions, Text, ImageBackground, BackAndroid } from 'react-native';
import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';
import BoardGenerator from '../Services/BoardGenerator';
import WallTemplate from '../data/WallTemplate';
import Cell from '../data/Cell';
import Engine from './Engine';
import Menu from './Menu';
import AnimatedSplashScreen from './AnimatedSplashScreen';
import Bar from './Bar';

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
    this.elements = null;
    this.boardReady = false;
    this.generator = new BoardGenerator();
    this.humanSpace = null;
    this.monsterSpace = null;
    this.cacheTotal = 13;
    this.cellsInRow = 40;
    this.cellsTotal = 1600;
    this.viewPortHeight = Dimensions.get("window").height;
    this.zoomedInValue = 50;
    this.zoomedOutValue = Math.ceil(this.viewPortHeight / this.cellsInRow);
    this.userWon = null;
    this.humanShrinesToWin = 7;
    this.monsterShrinesToWin = 7;
    this.animationCallback = this.showAnimationCallback;
    this.boardPieceCounter = 0;
    this.state = {
      readyToBeginPlaying: false,
      redraw: false,
      isHuman: true,
      tileWidth: this.zoomedInValue,
      playerSpace: { name: 0 },
      boardFinished: true,
      animationType: 'hands',
      animationTouchable: true,
      animationVisible: false,
      animationTimer: 1000,
      modal: 0,
      modalLeft: 0,
      modalDialogOnly: 0,
      modalPounce: 0,
      modalAlert: 0,
      turnCounter: 0,
      turn: 0,
      outOfMoves: false,
      shrinesUnclaimed: this.cacheTotal,
      shrinesBlessed: 0,
      shrinesDesecrated: 0,
      monsterSanityLevel: 100,
      heartBeatTimer: 8,
      opponentVisible: false,
    }
    //turn: odd - priest; even - evil
  }

  makeBoard = async () => {
    let array = await this.generator.generateBoard();
    this.boardReady = true;
    this.elements = array;
    // console.log("board complete", this.elements);
  }

  setHeartRate = () => {
    const distanceMin = 0;
    const distanceMax = 40;
    const heartRateMin = 0;
    const heartRateMax = 8;
    let distance = this.findShortestPath(this.monsterSpace, this.humanSpace);
    let heartRate = heartRateMin + (((heartRateMax - heartRateMin) * (distance - distanceMin)) / (distanceMax-distanceMin));
    this.setState({
      heartBeatTimer: Math.floor(heartRate),
    });
  }

  assignImageFogKeys = () => {

    for (let i = 0; i < this.elements.length; i++) {
      if ((this.elements[i].isRevealed)) {

        if (this.elements[i].imageFogKey) { this.elements[i].imageFogKey = 0; }

        if ((i % this.cellsInRow > 0) && (i - this.cellsInRow >= 0)) {
          if ((!this.elements[i - 1].isRevealed) && (!this.elements[i - this.cellsInRow].isRevealed)) {
              this.elements[i - this.cellsInRow - 1].imageFogKey = 1;//nw
          }
          if ((this.elements[i - 1].isRevealed) && (this.elements[i - this.cellsInRow].isRevealed) && (!this.elements[i - 1 - this.cellsInRow].isRevealed)) {
              this.elements[i - 1 - this.cellsInRow].imageFogKey = 9;
          }
        }

        if ((i + 1 < this.cellsTotal) && (i + 1 % this.cellsInRow != 0) && (i - this.cellsInRow >= 0)) {
          if ((!this.elements[i + 1].isRevealed) && (!this.elements[i - this.cellsInRow].isRevealed)) {
              this.elements[i - this.cellsInRow + 1].imageFogKey = 3;//ne
          }
          if ((this.elements[i + 1].isRevealed) && (this.elements[i - this.cellsInRow].isRevealed) && (!this.elements[i + 1 - this.cellsInRow].isRevealed)) {
              this.elements[i + 1 - this.cellsInRow].imageFogKey = 9;
          }
        }

        if ((i % this.cellsInRow > 0) && (i + this.cellsInRow < this.cellsTotal)) {
          if ((!this.elements[i - 1].isRevealed) && (!this.elements[i + this.cellsInRow].isRevealed)) {
              this.elements[i + this.cellsInRow - 1].imageFogKey = 7;//sw
          }
          if ((this.elements[i - 1].isRevealed) && (this.elements[i + this.cellsInRow].isRevealed) && (!this.elements[i - 1 + this.cellsInRow].isRevealed)) {
              this.elements[i - 1 + this.cellsInRow].imageFogKey = 9;
          }
        }

        if ((i + 1 < this.cellsTotal) && (i + 1 % this.cellsInRow != 0) && (i + this.cellsInRow < this.cellsTotal)) {
          if ((!this.elements[i + 1].isRevealed) && (!this.elements[i + this.cellsInRow].isRevealed)) {
              this.elements[i + this.cellsInRow + 1].imageFogKey = 5;//se
          }
          if ((this.elements[i + 1].isRevealed) && (this.elements[i + this.cellsInRow].isRevealed) && (!this.elements[i + 1 + this.cellsInRow].isRevealed)) {
              this.elements[i + 1 + this.cellsInRow].imageFogKey = 9;
          }
        }

        if (i % this.cellsInRow > 0) {
          if ((!this.elements[i - 1].isRevealed) && (this.elements[i - 1].imageFogKey != 9)) {//w
              this.elements[i - 1].imageFogKey = 8;
          }
        }
        if ((i + 1 < this.cellsTotal) && (i + 1 % this.cellsInRow != 0)) {
          if ((!this.elements[i + 1].isRevealed) && (this.elements[i + 1].imageFogKey != 9)) {//e
              this.elements[i + 1].imageFogKey = 4;
          }
        }
        if (i - this.cellsInRow >= 0) {
          if ((!this.elements[i - this.cellsInRow].isRevealed) && (this.elements[i - this.cellsInRow].imageFogKey != 9)) {//n
              this.elements[i - this.cellsInRow].imageFogKey = 2;
          }
        }
        if (i + this.cellsInRow < this.cellsTotal) {
          if ((!this.elements[i + this.cellsInRow].isRevealed) && (this.elements[i + this.cellsInRow].imageFogKey != 9)) {//s
              this.elements[i + this.cellsInRow].imageFogKey = 6;
          }
        }
      }
    }

    for (let i = 0; i < this.cellsTotal; i++) {
      if (this.elements[i].imageFogKey > 0) {
        this.elements[i].isSemiRevealed = true;
      }
    }
  }

  findShortestPath(start, end) {
    if (start.value < 1 || end.value < 1) {
      return -1;
    }
    let queue = [];
    let visited = [];
    visited.push(start);
    queue.push(start);
    while (queue.length > 0) {
      let cell = queue.shift();
      if (cell === end) {
        break;
      }
      let neighbors = [];
      for (i = 0; i < cell.monsterEdges.length; i++) {
        neighbors.push(this.elements[cell.monsterEdges[i]]);
      }
      for ( let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (!visited.includes(neighbor)) {
          neighbor.parent = cell;
          visited.push(neighbor);
          queue.push(neighbor);
        }
      }
    }
    let path = [];
    let next = end;
    while (next != null) {
      path.push(next);
      next = next.parent;
    }
    this.resetParents()
    return (path.length - 1);
  }

  resetParents = () => {
    for (i = 0; i < this.elements.length; i++) {
      this.elements[i].parent = null;
    }
  }

  resetHighlighted = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].isHighlighted = false;
    }
  }

  resetWasPounced = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].wasPounced = false;
    }
  }

  resetWasEchoed = () => {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].wasEchoed = false;
    }
  }

  echoLocate = (direction) => {
    const splashScreenTimer = 500;
    const index = this.humanSpace.name;
    let { topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight } = this.getNeighboringCells(index);
    switch (direction) {

      case 'initial':

        topLeft.isRevealed = true;
        top.isRevealed = true;
        topRight.isRevealed = true;
        left.isRevealed = true;
        right.isRevealed = true;
        bottomLeft.isRevealed = true;
        bottom.isRevealed = true;
        bottomRight.isRevealed = true;
        break;

      case 'north':

        if (index - this.cellsInRow < 0 || this.elements[index - this.cellsInRow].value < 1) {
          this.setState({ modalAlert: 1 });
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index - this.cellsInRow];
          while (cell.value !== 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if (cell.name - this.cellsInRow > 0) {
              cell = this.elements[cell.name - this.cellsInRow];
            } else {
              break;
            }
          }
          cell.isRevealed = true;
        }
        break;

      case 'east':

        if (index % this.cellsInRow === (this.cellsInRow - 1) || this.elements[index + 1].value < 1) {
          this.setState({ modalAlert: 1 });
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index + 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if ((cell.name + 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name + 1];
            }
          }
          cell.isRevealed = true;
        }
        break;

      case 'south':

        if (index + this.cellsInRow > this.cellsTotal || this.elements[index + this.cellsInRow].value < 1) {
          this.setState({ modalAlert: 1 });
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index + this.cellsInRow];
          while (cell.value !== 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if (cell.name + this.cellsInRow < this.cellsTotal) {
              cell = this.elements[cell.name + this.cellsInRow];
            } else {
              break;
            }
          }
          cell.isRevealed = true;
        }
        break;

      case 'west':

        if (index % this.cellsInRow === 0 || (this.elements[index-1].value < 1)) {
          this.setState({ modalAlert: 1 });
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false, splashScreenTimer);
          let cell = this.elements[index - 1];
          while (cell.value > 0) {
            cell.isRevealed = true;
            if (cell.hasMonster) {
              this.setState({
                opponentVisible: true,
              });
            }
            if ((cell.name - 1) % this.cellsInRow === 0) {
              break;
            } else {
              cell = this.elements[cell.name - 1];
            }
          }
          cell.isRevealed = true;
        }
        break;

      case 'radius':

        if (topLeft.isRevealed && top.isRevealed && topRight.isRevealed && left.isRevealed && right.isRevealed && bottomLeft.isRevealed && bottom.isRevealed && bottomRight.isRevealed) {
          this.setState({ modalAlert: 1 });
        } else {
          this.humanSpace.wasEchoed = true;
          this.incrementTurnCounter();
          this.showSplashScreen('hands', false, splashScreenTimer);
          topLeft.isRevealed = true;
          top.isRevealed = true;
          topRight.isRevealed = true;
          left.isRevealed = true;
          right.isRevealed = true;
          bottomLeft.isRevealed = true;
          bottom.isRevealed = true;
          bottomRight.isRevealed = true;
          break;
        }

      default:
        break;
    }
    this.assignImageFogKeys();
    // this.adjustFog();
    this.setState({ redraw: !this.state.redraw });
  }

  generateCustomAlert = () => {
    let text1 = "Uh-oh."
    let text2 = "Can't echo locate in that direction."
    return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text2}</Text>
            <NavButton onPress={() => this.setState({ modalAlert: 0})} text='OK' />
          </ImageBackground>
        </View>
    );
  }


  changePlayerMode = () => {//-------------------------------------------------------new
    for (let j = 0; j < 8; j++) {
      let array = [];
      // array.push(j);
      let arrayJSON;
      for (let i = 200 * j; i < 200 * (j+1); i++) {
        array.push(this.elements[i]);
      }
      arrayJSON = JSON.parse(JSON.stringify(array));
      this.postEvent({"endTurn": arrayJSON});
    }
    // this.setState({ turn: this.state.turn + 1 })
    // this.postEvent({"endTurn": "sample"});

  }

  onItemSelected = (item) => {
    // console.log('onItemSelected', item);
    switch (item) {
      case 'endTurn'://--------------------------------------------------------------endTurn
        if (this.state.outOfMoves) {
          if (this.state.isHuman) {
            this.resetWasPounced();
          } else {
            this.resetWasEchoed();
          }
          this.resetHighlighted();
          this.changePlayerMode();
          this.setState({ outOfMoves: false, turnCounter: 0, opponentVisible: false })
        }
        break;
      case 'home':
        this.resetHighlighted();
        this.setState({ modalLeft: 2 });
        break;
      case 'zoom':
        this.resetHighlighted();
        this.alterZoom();
        break;
      case 'exit':
        this.resetHighlighted();
        this.setState({ modalLeft: 1 });
        break;
      default:
        // console.log('');
    }
  }

  alterZoom = () => {
    if(this.state.tileWidth === this.zoomedInValue) {
      this.setState({
        tileWidth: this.zoomedOutValue,
      })
      this.showSplashScreen('hands', false, 100);
    } else {
      this.setState({
        tileWidth: this.zoomedInValue,
      })
      this.showSplashScreen('hands', false, 100);
    }
  }

  incrementTurnCounter = () => {
    this.setState({ turnCounter: this.state.turnCounter + 1 });
    if (this.state.turnCounter >= 1) {
      this.setState({ outOfMoves: true });
    }
  }

  findClosestShrine = () => {
    // note: this returns an object containing both the closest {shrine} as a cell object and the {distance} as an int
    let shrines = [];
    let distance = 400;
    let closest = null;
    for (let i = 0; i < this.elements.length; i++) {
      if(this.elements[i].hasCache) {
        shrines.push(this.elements[i]);
      }
    }
    for (let j = 0; j < shrines.length; j++) {
      let dist = this.findShortestPath(this.monsterSpace, shrines[j]);
      if (dist < distance) {
        distance = dist;
        closest = shrines[j];
      }
    }
    return {shrine: closest, distance: distance};
  }

  focus = (target) => {
    if (target === 'human') {
      this.setState({
        modalDialogOnly: 1,
      });
    } else {
      this.setState({
        modalDialogOnly: 2,
      })
    }
  }



  renderModalWaitForTurnContent = () => {//--------------------------------------------new
    let text1 = 'Waiting for the evil to make their move.';

    return (
      <View style={{
        backgroundColor: 'transparent',
        width: Dimensions.get("window").width*0.9,
        marginLeft: "auto",
        marginRight: "auto",
        height: 200,
      }}>
        <ImageBackground
          style={{
            height: undefined,
            width: undefined,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
            }}
          source={require("../data/images/tallWindow.png")}
          resizeMode={"stretch"}
          >

          <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text1}</Text>

        </ImageBackground>
      </View>
    )
  }

  renderModalContent = () => {
    if (this.state.modalDialogOnly === 1) { // focus on young priest
      let cell1;
      let cell2;
      if (this.state.isHuman) {
        cell1 = this.humanSpace.name;
        cell2 = this.monsterSpace.name;
      } else {
        cell1 = this.monsterSpace.name;
        cell2 = this.humanSpace.name;
      }
      let direction = '';
      if (Math.floor(cell2 / this.cellsInRow) > Math.floor(cell1 / this.cellsInRow)) {
        direction += 'S';
      } else if (Math.floor(cell2 / this.cellsInRow) < Math.floor(cell1 / this.cellsInRow)) {
        direction += 'N';
      }
      if (cell2 % this.cellsInRow > cell1 % this.cellsInRow) {
        direction += 'E';
      } else if (cell2 % this.cellsInRow < cell1 % this.cellsInRow) {
        direction += 'W';
      }
      let distance = this.findShortestPath(this.elements[cell1], this.elements[cell2]);

      let text1 = 'You focus on the Priest.';
      let text2 = `He is ${distance} squares away to the ${direction}`;

      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text2}</Text>
            <NavButton onPress={() => this.closeModalDialogOnly()} text='OK' />
          </ImageBackground>
        </View>
      )
    }

    else if (this.state.modalDialogOnly === 2) {//focus on closest shrine
      let monsterIndex = this.monsterSpace.name;
      let { shrine, distance } = this.findClosestShrine();
      let shrineIndex = shrine.name;
      let direction = '';
      if (Math.floor(shrineIndex / this.cellsInRow) > Math.floor(monsterIndex / this.cellsInRow)) {
        direction += 'S';
      } else if (Math.floor(shrineIndex / this.cellsInRow) < Math.floor(monsterIndex / this.cellsInRow)) {
        direction += 'N';
      }
      if (shrineIndex % this.cellsInRow > monsterIndex % this.cellsInRow) {
        direction += 'E';
      } else if (shrineIndex % this.cellsInRow < monsterIndex % this.cellsInRow) {
        direction += 'W';
      }

      let text1 = 'You focus on the nearest Shrine.';
      let text2 = `It is in ${distance} spaces away to the ${direction}.`;

      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text2}</Text>
            <NavButton onPress={() => this.closeModalDialogOnly()} text='OK' />
          </ImageBackground>
        </View>
      )
    }
    else if (this.state.modalPounce === 1) {//POUNCE
      let text1;
      let text2;
      text1 = 'You pounced.';
      text2 = 'There is nothing here.';
      return (
        <View style={{
          backgroundColor: 'transparent',
          width: Dimensions.get("window").width*0.9,
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
        }}>
          <ImageBackground
            style={{
              height: undefined,
              width: undefined,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
              }}
            source={require("../data/images/tallWindow.png")}
            resizeMode={"stretch"}
            >

            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text1}</Text>
            <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>{text2}</Text>
            <NavButton onPress={() => this.setState({modalPounce: 0})} text='OK' />
          </ImageBackground>
        </View>
      );
    }
    else if (this.state.modalLeft === 1) {//EXIT
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>Are you sure you want to exit?</Text>
          <NavButton onPress={() => BackAndroid.exitApp()} text='Yes' />
          <NavButton onPress={() => this.setState({ modalLeft: 0 })} text='No' />

        </View>
      );
    }
    else if (this.state.modalLeft === 2) {//HOME
      return (
        <View style={{

          borderWidth: 2,
          borderColor: "#000",

          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          backgroundColor: '#212121',
        }}>
          <Text style={{color:'#fff', fontFamily: 'Perfect DOS VGA 437',}}>Are you sure you want to exit?</Text>
          <NavButton onPress={() => {this.setState({ modalLeft: 0 }); this.props.navigation.navigate('Home');}} text='Yes' />
          <NavButton onPress={() => this.setState({ modalLeft: 0 })} text='No' />

        </View>
      );
    }
  }

  monsterProcessPounce = () => {
    this.resetHighlighted();
    let cellsAround = this.getIndexesOfAvailableCellsAround(this.monsterSpace.name, this.cellsInRow, this.cellsTotal, true);
    cellsAround.push(this.monsterSpace.name);
    let human = false;
    let shrine = false;
    let index = this.monsterSpace.name;
    cellsAround.forEach((i) => {
      if (this.elements[i].hasHuman) {
        human = true;
        // break;
      }
      else if (this.elements[i].hasCache) {
        this.elements[i].wasPounced = true;
        shrine = true;
        index = i;
      }
    });
    if (human) {
      //end game
      this.userWon = 'monster';
      this.gameOver();
    } else if (shrine) {
      this.collectShrine(this.elements[index]);
    }
  }


  gameOver = () => {
    this.animationCallback = () => {
      this.props.navigation.navigate('GameOver');
    }
    if (this.userWon === 'human') {
      this.showSplashScreen('priestWon', false, 2000);
    }
    else if (this.userWon === 'monster') {
      this.showSplashScreen('evilWon', false, 2000);
    }
  }

  collectShrine = (item) => {
    if (this.state.isHuman) {
      if (this.state.shrinesBlessed + 1 >= this.humanShrinesToWin) {
        this.userWon = 'human';
        this.gameOver();
      }

      item.hasBlessedCache = true;
      this.setState({ shrinesBlessed: this.state.shrinesBlessed + 1 });
      this.setState({ shrinesUnclaimed: this.state.shrinesUnclaimed - 1 });
    }
    else {
      if (this.state.shrinesDesecrated + 1 >= this.monsterShrinesToWin) {
        this.userWon = 'monster';
        this.gameOver();
      }

      item.hasDesecratedCache = true;
      this.state.monsterSanityLevel -= 15;
      this.setState({ shrinesDesecrated: this.state.shrinesDesecrated + 1 });
      this.setState({ shrinesUnclaimed: this.state.shrinesUnclaimed - 1 });
    }

    if (!this.userWon) {
      item.hasCache = false;
      this.showSplashScreen('shrine', false, 2000);
    }

  }


  showMonsterMoves = () => {
    let index = this.monsterSpace.name;
    let indexesOfAvailableCellsAround = this.getIndexesOfAvailableCellsAround(index, this.cellsInRow, this.cellsTotal, true);
    let cells = [];
    let cells2 = [];
    let cellsAll = [];
    let distance = null;
    cells.push(this.elements[index]);
    for (let s = 0; s < this.state.shrinesDesecrated + 1; s++) {
      cells.forEach((cell) => {
        indexesOfAvailableCellsAround = this.getIndexesOfAvailableCellsAround(cell.name, this.cellsInRow, this.cellsTotal, true);
        indexesOfAvailableCellsAround.forEach((i) => {
          if (!cellsAll.includes(this.elements[i])) {
            distance = this.findShortestPath(this.monsterSpace, this.elements[i]);
            if (this.elements[i].value > 0 && distance <= (this.state.shrinesDesecrated + 1)) {
              this.elements[i].isHighlighted = true;
            }
            cells2.push(this.elements[i]);
            cellsAll.push(this.elements[i]);
          }
        });
      })
      cells = cells2.slice();
    }


    this.setState({ redraw: !this.state.redraw })
  }

  moveMonster = (item) => {
    this.elements[this.monsterSpace.name].hasMonster = false;
    item.hasMonster = true;
    this.monsterSpace = item;
    this.setState({ playerSpace: item });
    this.resetHighlighted();
    this.setHeartRate();
    this.monsterProcessPounce();
    this.checkForVisiblePriest();
  }

  checkForVisiblePriest = () => {
    if (this.monsterSpace.name % this.cellsInRow === this.humanSpace.name % this.cellsInRow) {
      // they are in the same column, check to see if view is obstructed
      if (this.monsterSpace.name > this.humanSpace.name) {
        // north
        let cell = this.elements[this.monsterSpace.name - this.cellsInRow];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name + this.cellsInRow];
          }
        }
      } else if (this.monsterSpace.name < this.humanSpace.name) {
        // south
        let cell = this.elements[this.monsterSpace.name + this.cellsInRow];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name + this.cellsInRow];
          }
        }
      }
  } else if (Math.floor(this.monsterSpace.name / this.cellsInRow) === Math.floor(this.humanSpace.name / this.cellsInRow)) {
      // they are in the same row, check to see if view is obstructed
      if (this.monsterSpace.name > this.humanSpace.name) {
        // west
        let cell = this.elements[this.monsterSpace.name - 1];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name - 1];
          }
        }
      } else if (this.monsterSpace.name < this.humanSpace.name) {
        // east
        let cell = this.elements[this.monsterSpace.name + 1];
        while (cell.value > 0) {
          if (cell.hasHuman) {
            this.setState({ opponentVisible: true });
            break;
          } else {
            cell = this.elements[cell.name + 1];
          }
        }
      }
    }
  }

  showHumanMoves = () => {
    let i = this.humanSpace.name;
    // north
    if (i - this.cellsInRow > 0) {
      let cell = this.elements[i - this.cellsInRow];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if (cell.name - this.cellsInRow > 0) {
          cell = this.elements[cell.name - this.cellsInRow];
        } else {
          break;
        }
      }
    }
    // east
    if (i % this.cellsInRow !== (this.cellsInRow - 1)) {
      let cell = this.elements[i + 1];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if ((cell.name + 1) % this.cellsInRow === 0) {
          break;
        } else {
          cell = this.elements[cell.name + 1];
        }
      }
    }
    // south
    if (i + this.cellsInRow < this.cellsTotal) {
      let cell = this.elements[i + this.cellsInRow];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if (cell.name + this.cellsInRow < this.cellsTotal) {
          cell = this.elements[cell.name + this.cellsInRow];
        } else {
          break;
        }
      }
    }
    // west
    if (i % this.cellsInRow !== 0) {
      let cell = this.elements[i - 1];
      while (cell.value > 0 && cell.isRevealed) {
        cell.isHighlighted = true;
        if ((cell.name - 1) % this.cellsInRow === (this.cellsInRow - 1)) {
          break;
        } else {
          cell = this.elements[cell.name - 1];
        }
      }
    }
    this.setState({ redraw: !this.state.redraw})
  }

  moveHuman = (item) => {
    // player moves to the space
    // clear previous cell
    this.elements[this.humanSpace.name].hasHuman = false;
    // put human in new cell,
    item.hasHuman = true;
    // check if the space has a cache
    if (item.hasCache) {
      //take the cache
      this.collectShrine(item);
      // this.showSplashScreen('shrine', false);
      // console.log('shrine collected: ', this.state.shrinesHumanClaimed, this.state.shrinesMonsterClaimed, this.state.shrinesUnclaimed);
    }
    this.humanSpace = item;
    this.resetHighlighted();
    this.setState({ playerSpace: item });
    this.setHeartRate();
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



  closeModalDialogOnly = () => {
    this.setState({ modalDialogOnly: 0 });
    this.incrementTurnCounter();
  }

  getIndexesOfAvailableCellsAround = (index, row, total, monsterFlag) => {
    let result = [];

    let left = false;
    let right = false;
    let up = false;
    let down = false;

    if (index % row != 0) {
      result.push(index - 1);
      left = true;
    }
    if (index % row != row - 1) {
      result.push(index + 1);
      right = true;
    }
    if (index - row >= 0) {
      result.push(index - row);
      up = true;
    }
    if (index + row < total) {
      result.push(index + row);
      down = true;
    }
    if (monsterFlag) {
      if (left && up) {
        result.push(index - 1 - row);
      }
      if (left && down) {
        result.push(index - 1 + row);
      }
      if (right && up) {
        result.push(index + 1 - row);
      }
      if (right && down) {
        result.push(index + 1 + row);
      }
    }
    return result;
  }

  getNeighboringCells = (i) => {
    let top = null;
    let left = null;
    let right = null;
    let bottom = null;
    let bottomLeft = null;
    let bottomRight = null;
    let topLeft = null;
    let topRight = null;

    if((i - (this.cellsInRow + 1) >= 0) && (i % this.cellsInRow !== 0)) {
      topLeft = this.elements[i - (this.cellsInRow + 1)];
    }
    if (i - this.cellsInRow >= 0) {
      top = this.elements[i - this.cellsInRow];
    }
    if ((i - (this.cellsInRow - 1) >= 0) && (i % this.cellsInRow !== (this.cellsInRow - 1))) {
      topRight = this.elements[i - (this.cellsInRow - 1)];
    }
    if ((i - 1 >= 0) && (i % this.cellsInRow !== 0)) {
      left = this.elements[i - 1];
    }
    if ((i + 1 <= this.cellsTotal) && (i % this.cellsInRow !== (this.cellsInRow - 1))) {
      right = this.elements[i + 1];
    }
    if ((i + (this.cellsInRow - 1) <= this.cellsTotal) && ((i % this.cellsInRow !== 0))) {
      bottomLeft = this.elements[i + (this.cellsInRow - 1)];
    }
    if (i + this.cellsInRow <= this.cellsTotal) {
      bottom = this.elements[i + this.cellsInRow];
    }
    if ((i + (this.cellsInRow + 1) <= this.cellsTotal) && (i % this.cellInRow !== (this.cellsInRow - 1))) {
      bottomRight = this.elements[i + (this.cellsInRow + 1)];
    }
    return ({ top, left, right, bottom, bottomLeft, bottomRight, topLeft, topRight})
  }


  makeEmptyBoard = () => {
    let array = [];
    for (let i = 0; i < 1600; i++) {//note: array length hardcoded
      array.push(null);
    }
    this.elements = array;
  }


  componentDidMount() {
    console.log("waiting", this.props.navigation.state.params.auth_token, this.props.navigation.state.params.accessToken, this.props.navigation.state.params.phone);
    // AsyncStorage.getItem('auth_token').then((value) => console.log ("auth_token", value));


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
      this.makeBoard();
      // console.log("game prep", this.elements);
      //if board.done and player2.ready
      if (this.player2Ready) {
        //then post board event
        // this.postEvent({"board": this.elements});
      }
    }
    else if (this.player_number === 2) {
      this.makeEmptyBoard();
      //post event ready
      this.setState({
        isHuman: false,
      })
      this.postEvent({"ready": "player2"})
    }
    else {
      console.log('player_number is invalid. gamePrep');
    }
  }

  parseGameInfo = (data) => {
    let phoneCompare = this.phone;
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
        // console.log(responseJSON);
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
    console.log("this is the message", message);
    if (message.ready) {
      console.log('player2 ready!');
      this.player2Ready = true;
      if (this.player_number === 1) {

        for (let j = 0; j < 8; j++) {
          let array = [];
          // array.push(j);
          let arrayJSON;
          for (let i = 200 * j; i < 200 * (j+1); i++) {
            array.push(this.elements[i]);
          }
          arrayJSON = JSON.parse(JSON.stringify(array));
          this.postEvent({"board": arrayJSON});
        }

      }
    }
    else if (message.board) {
      if (this.player_number === 2) {
        this.setState({
          isHuman: false,
        })
        for (let i = 0; i < 200; i++) {
          this.elements[message.board[i].name] = message.board[i];
        }
      }

      this.boardPieceCounter++;
      if (this.boardPieceCounter >= 8) {
        for(i = 0; i < this.elements.length; i++) {
          if (this.elements[i].hasHuman) {
            this.humanSpace = this.elements[i];
          }
          if (this.elements[i].hasMonster) {
            this.monsterSpace = this.elements[i];
          }
        }
        if (this.state.isHuman) {
          this.setState({ playerSpace: this.humanSpace});
        } else {
          this.setState({ playerSpace: this.monsterSpace});
        }
        this.setState({ readyToBeginPlaying: true });
        console.log('***ready to play?');
        console.log(this.state.readyToBeginPlaying);
        this.boardPieceCounter = 0;
      }
    }
    else if (message.endTurn) {

      for (let i = 0; i < 200; i++) {
        this.elements[message.endTurn[i].name] = message.endTurn[i];
      }

      this.boardPieceCounter++;


      if (this.boardPieceCounter >= 8) {
        for(i = 0; i < this.elements.length; i++) {
          if (this.elements[i].hasHuman) {
            this.humanSpace = this.elements[i];
          }
          if (this.elements[i].hasMonster) {
            this.monsterSpace = this.elements[i];
          }
        }

        if (this.state.isHuman) {
          this.setState({ playerSpace: this.humanSpace});
        } else {
          this.setState({ playerSpace: this.monsterSpace});
        }
        this.boardPieceCounter = 0;
        this.setState({ turn: this.state.turn + 1 });
        this.showSplashScreen('hands', false, 100);
      }
    }
  }

  postEvent = (event) => {//event = {"data": "sample_data"}
    console.log('postEvent');
      fetch("https://demonspell.herokuapp.com/api/games/" + this.accessToken + "/events", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'auth_token': this.auth_token,
        },
        method: "POST",
        body: JSON.stringify(event),
      }).then(res => {
        res.json()
          .then((responseJSON) => {
            // console.log(responseJSON);
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
    // console.log("boardgeneration finished", this.elements, JSON.stringify(this.elements));
  };

  renderWaiting = () => {
    if (!this.state.readyToBeginPlaying) {
      return (
        <Container>
          <Header text="waiting screen" />
          <Blurb text="waiting for player to join.." />
          <NavButton onPress={this.handlePressNavButton} text="Back" />
        </Container>
      );
    }
  }

  renderGame = () => {
    if (this.state.readyToBeginPlaying) {
      return(
        <View style={{flex: 1, backgroundColor: "transparent"}}>
          {this.renderAnimator()}
          {this.renderEngine()}
        </View>
      )
    }
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

  renderEngine = () => {
    let disableGestures = this.state.outOfMoves;
    const menuRight = <Menu mode={this.state.isHuman ? 1 : 2} onItemSelected={this.onItemSelected}/>;
    const menuLeft = <Menu mode={0} onItemSelected={this.onItemSelected}/>;
    const bar = <Bar
      outOfMoves={this.state.outOfMoves}
      isHuman={this.state.isHuman}
      onItemSelected={this.onItemSelected}
      shrineAmount={this.state.isHuman ? this.state.shrinesBlessed : this.state.shrinesDesecrated}
      shrinesUnclaimed={this.state.shrinesUnclaimed}
      heartBeatTimer={this.state.heartBeatTimer}
      humanShrinesToWin={this.humanShrinesToWin}
      monsterShrinesToWin={this.monsterShrinesToWin}
      monsterSanityLevel={this.state.monsterSanityLevel}
      barActive={(this.state.isHuman == (this.state.turn % 2 === 0))}
    />;
    if (this.state.boardFinished) {
      return (
        <SideMenu
        menu={menuRight}
        menuPosition='right'
        disableGestures={disableGestures}
      >
      <SideMenu
        menu={menuLeft}
        menuPosition='left'
      >
        <Engine
          gameBoard={this.elements}
          tilesInRow={this.cellsInRow}
          boardFinished={this.state.boardFinished}
          isHuman={this.state.isHuman}
          playerSpace={this.state.playerSpace}
          monsterSpace={this.monsterSpace}
          humanSpace={this.humanSpace}
          move={this.state.isHuman ? this.moveHuman : this.moveMonster}
          echolocate={this.echoLocate}
          tileWidth={this.state.tileWidth}
          zoomedInValue={this.zoomedInValue}
          zoomedOutValue={this.zoomedOutValue}
          incrementTurnCounter={this.incrementTurnCounter}
          turnCounter={this.state.turnCounter}
          animationVisible={this.state.animationVisible}
          showHumanMoves={this.showHumanMoves}
          showMonsterMoves={this.showMonsterMoves}
          monsterProcessPounce={this.monsterProcessPounce}
          focus={this.focus}
          assignImageFogKeys={this.assignImageFogKeys}
          resetHighlighted={this.resetHighlighted}
          alterZoom={this.alterZoom}
          opponentVisible={this.state.opponentVisible}
          gameActive={(this.state.isHuman == (this.state.turn % 2 === 0))}
        />
        <Modal
          isVisible={this.state.modal != 0}
          onBackdropPress={() => this.setState({ modal: 0 })}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          onSwipe={() => this.setState({ modal: 0 })}
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>

        <Modal
          isVisible={this.state.modalAlert != 0}
          onBackdropPress={() => this.setState({ modalAlert: 0 })}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          onSwipe={() => this.setState({ modalAlert: 0 })}
          swipeDirection="right"
        >
          {this.generateCustomAlert()}
        </Modal>

        <Modal
          isVisible={this.state.modalDialogOnly != 0}
          onBackdropPress={() => this.closeModalDialogOnly()}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          onSwipe={() => this.closeModalDialogOnly()}
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>

        <Modal
          isVisible={this.state.modalPounce != 0}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>


        <Modal
          isVisible={this.state.modalLeft != 0}
          onBackdropPress={() => this.setState({ modalLeft: 0 })}
          animationIn="slideInRight"
          animationOut="slideOutLeft"
          onSwipe={() => this.setState({ modalLeft: 0 })}
          swipeDirection="right"
        >
          {this.renderModalContent()}
        </Modal>



        {bar}
      </SideMenu>
      </SideMenu>
      )
    }
  }
  // <Modal
  // isVisible={(this.state.isHuman == (this.state.turn % 2 === 1))}
  // animationIn="slideInRight"
  // animationOut="slideOutLeft"
  // >
  // {this.renderModalWaitForTurnContent()}
  // </Modal>
  //

  render() {
    return (
      <View style={{flex: 1, backgroundColor: "transparent"}}>
        {this.renderWaiting()}

        {this.renderGame()}
      </View>
    );
  }
}

export default Waiting;
