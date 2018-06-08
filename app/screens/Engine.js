import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, Image, View, PanResponder, TouchableOpacity, Animated } from "react-native";
import { Loop, Stage, TileMap, Sprite } from "react-game-kit/native";
import ControlButton from '../components/Button/ControlButton';

const TouchableSprite = Animated.createAnimatedComponent(TouchableOpacity);

import Board from "./Board";

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool,
    playerSpace: PropTypes.object,
    isHuman: PropTypes.bool,
    move: PropTypes.func,
    tileWidth: PropTypes.number,
    incrementTurnCounter: PropTypes.func,
    turnCounter: PropTypes.number,
    animationVisible: PropTypes.bool,
    assignImageFogKeys: PropTypes.func,
    showHumanMoves: PropTypes.func,
    gameActive: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.screenDimensions = Dimensions.get("window");
    this.gameBoardWidth = this.props.tileWidth * 40;
    this.wasPouncedTileMap = this.props.gameBoard.map(a => a.wasPounced ? 1 : 0);
    this.wasEchoedTileMap = this.props.gameBoard.map(a => a.wasEchoed ? 1 : 0);
    this.highlightedTileRanges = [];
    this.playerTileRanges = [];
    this.xOffsetMax = this.gameBoardWidth - this.screenDimensions.width;
    this.yOffsetMax = this.gameBoardWidth - this.screenDimensions.height;
    this.playerX = (this.props.playerSpace.name % 40) * this.props.tileWidth;
    this.playerY = Math.floor(this.props.playerSpace.name / 40) * this.props.tileWidth;
    this.cameraX = this.getCameraX();
    this.cameraY = this.getCameraY();
    this.beginningX = this.getBeginningX();
    this.beginningY = this.getBeginningY()
    this.feedbackSquare = null;
    this.previousTouchTimestamp = 0;
    this.state = {
      playerSpace: this.props.playerSpace,
      playerX: this.playerX,
      spriteX: new Animated.Value(this.getInitialSpriteX()),
      playerY: this.playerY,
      spriteY: new Animated.Value(this.getInitialSpriteY()),
      isZooming: false,
      isMoving: false,
      initialX: null,
      offsetLeft: 0,
      initialTop: 0,
      initialLeft: 0,
      top: new Animated.Value(this.beginningY),
      left: new Animated.Value(this.beginningX),
      highlightedTileMap: this.props.gameBoard.map(x => x.isHighlighted ? 1 : 0),
      showHighlighted: false,
      fogMap: this.props.gameBoard.map(a => a.isRevealed ? 0 : 1),
      tileFogMapArray: this.props.gameBoard.map(x => (this.props.isHuman) ? x.imageFogKey : 0),
      spritePlaying: true,
      spriteScale: this.props.tileWidth / this.props.zoomedInValue,
      wasPouncedTileMap: this.wasPouncedTileMap,
      wasEchoedTileMap: this.wasEchoedTileMap,
      controlsVisible: true,
      echoControlsVisible: false,
      targetPickerVisible: false,
      targetPicker: null,
      srcPriest: require("../data/images/priestIdle.png"),
      srcEvil: require("../data/images/priestIdle-ghost.png"),
      ticksPerFrame: 6,
      srcpounceOut: require("../data/images/pounceIcon.png"),
      srcpounceIn: require("../data/images/pounceIcon.png"),
      srcfocusOut: require("../data/images/focusOut.png"),
      srcfocusIn: require("../data/images/focusIn.png"),
      srcTargetPriestOut: require("../data/images/targetPriestOut.png"),
      srcTargetPriestIn: require("../data/images/targetPriestIn.png"),
      srcTargetShrineOut: require("../data/images/targetShrineOut.png"),
      srcTargetShrineIn: require("../data/images/targetShrineIn.png"),
    };
  }

  getInitialSpriteX = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return (this.playerX - this.props.tileWidth*0.1);
    } else if (this.props.tileWidth === this.props.zoomedOutValue) {
      return (this.playerX - this.props.tileWidth*0.8);
    }
  }

  getNewSpriteX = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return (this.state.playerX - this.props.tileWidth*0.1);
    } else if (this.props.tileWidth === this.props.zoomedOutValue) {
      return (this.state.playerX - this.props.tileWidth*0.8);
    }
  }

  getInitialSpriteY = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return (this.playerY - this.props.tileWidth*1.5);
    } else if (this.props.tileWidth === this.props.zoomedOutValue) {
      return (this.playerY - this.props.tileWidth*3.5);
    }
  }

  getNewSpriteY = () => {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return (this.state.playerY - this.props.tileWidth*1.5);
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return (this.state.playerY - this.props.tileWidth*3.5);
      }
  }

  getCameraY = () => {
      if (this.props.turnCounter === 0 && this.wasPouncedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasPounced) {
            this.feedbackSquare = this.props.gameBoard[i];
            return ((Math.floor(this.feedbackSquare.name / 40) * this.props.tileWidth) - (this.screenDimensions.height / 2));
          }
        }
      } else if (this.props.turnCounter === 0 && this.wasEchoedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasEchoed) {
            this.feedbackSquare = this.props.gameBoard[i];
            return ((Math.floor(this.feedbackSquare.name / 40) * this.props.tileWidth) - (this.screenDimensions.height / 2));          }
        }
      } else {
        return (this.playerY - (this.screenDimensions.height / 2));
      }
  }

  getCameraX = () => {
      if (this.props.turnCounter === 0 && this.wasPouncedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasPounced) {
            this.feedbackSquare = this.props.gameBoard[i];
            return (((this.feedbackSquare.name % 40) * this.props.tileWidth) - (this.screenDimensions.width / 2));
          }
        }
      } else if (this.props.turnCounter === 0 && this.wasEchoedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasEchoed) {
            this.feedbackSquare = this.props.gameBoard[i];
            return (((this.feedbackSquare.name % 40) * this.props.tileWidth) - (this.screenDimensions.width / 2));
          }
        }
      } else {
        return (this.playerX - (this.screenDimensions.width / 2));
      }
  }

  getBeginningX = () => {
    return -this.cameraX;
    if (this.cameraX < 0) {
      return 0;
    } else if (this.cameraX > this.xOffsetMax) {
      return -this.xOffsetMax;
    } else {
      return -this.cameraX;
    }
  }

  getBeginningY = () => {
    return -this.cameraY;
    if (this.cameraY < 0) {
      return 0;
    } else if (this.cameraY > this.yOffsetMax) {
      return -this.yOffsetMax;
    } else {
      return -this.cameraY;
    }
  }

  componentWillMount() {
    // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    // console.log(this.props.isHuman);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      // onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // console.log('evt', evt, 'gestureState', gestureState);
        if (this.state.showHighlighted || gestureState.dx > 10 || gestureState.dx < -10 || gestureState.dy > 10 || gestureState.dy < -10) {
          return true;
        } else {
          return false;
        }
      },
      // onMoveShouldSetPanResponderCapture: (evt, gestureState) => {},
      onPanResponderGrant: (evt, gestureState) => {
        let { touches } = evt.nativeEvent;
        if (touches[0].timestamp - this.previousTouchTimestamp < 200) {
          this.props.alterZoom();
        }
        this.previousTouchTimestamp = touches[0].timestamp;
      },
      onPanResponderMove: (evt, gestureState) => {
        let { touches } = evt.nativeEvent;
        if (gestureState.dx > 10 || gestureState.dx < -10  || gestureState.dy > 10 || gestureState.dy < -10) {
          this.processPan(touches[0].pageX, touches[0].pageY);
        } else if (this.state.showHighlighted && this.props.tileWidth === this.props.zoomedInValue) {
          this.processMove(touches[0].pageX, touches[0].pageY);
        }
      },
      onPanResponderRelease: () => {
        // console.log("on pan responder release");
        this.setState({
          isMoving: false,
        });
      },
    });
  }

  animateCamera = () => {
    const { left, top } = this.state;
    let newX = (this.state.playerX - this.screenDimensions.width/2);
    if (newX < 0) {
      newX = 0;
    } else if (newX > this.xOffsetMax) {
      newX = this.xOffsetMax;
    }
    let newY = (this.state.playerY - this.screenDimensions.height/2);
    if (newY < 0) {
      newY = 0;
    } else if (newY > this.yOffsetMax) {
      newY = this.yOffsetMax;
    }
    setTimeout(function() {Animated.parallel([
      Animated.timing(left, { toValue: -newX, duration: 1000}),
      Animated.timing(top, { toValue: -newY, duration: 1000}),
    ]).start()}.bind(this), 2500);
  }

  animateSpritePosition = () => {
    const { spriteX, spriteY } = this.state;

    if (this.props.isHuman) {
      // down
      if (this.getNewSpriteY() - spriteY._value > 0) {
        if (this.state.srcPriest != require("../data/images/priestWalkDown.png"))
        this.setState({
          srcPriest: require("../data/images/priestWalkDown.png")
        });
      }
      //up
      else if (this.getNewSpriteY() - spriteY._value < 0) {
        if (this.state.srcPriest != require("../data/images/priestWalkUp.png"))
        this.setState({
          srcPriest: require("../data/images/priestWalkUp.png")
        });
      }
      // left
      else if ((this.getNewSpriteX() - spriteX._value < 0))  {
        if (this.state.srcPriest != require("../data/images/priest-walk-left.png")) {
          this.setState({
            srcPriest: require("../data/images/priest-walk-left.png")
          });
        }
      }
      // right
      else {
        if (this.state.srcPriest != require("../data/images/priest-walk-right2.png")) {
          this.setState({
            srcPriest: require("../data/images/priest-walk-right2.png")
          });
        }
      }
    }

    else {
      if (this.getNewSpriteX() - spriteX._value < 0)  {
        if (this.state.srcEvil != require("../data/images/monster-move-left-dropped-down.png")) {
          this.setState({
            srcEvil: require("../data/images/monster-move-left-dropped-down.png")
          });
        }
      }
      else if (this.getNewSpriteX() - spriteX._value > 0) {
        if (this.state.srcEvil != require("../data/images/monster-move-right-dropped-down.png")) {
          this.setState({
            srcEvil: require("../data/images/monster-move-right-dropped-down.png")
          });
        }
      }
      else {
        if (this.getNewSpriteY() - spriteY._value > 0) {//down
          if (this.state.srcEvil != require("../data/images/monster-move-left-dropped-down.png")) {
            this.setState({
              srcEvil: require("../data/images/monster-move-left-dropped-down.png")
            });
          }
        }
        else if (this.getNewSpriteY() - spriteY._value < 0) {
          if (this.state.srcEvil != require("../data/images/monster-move-right-dropped-down.png")) {
            this.setState({
              srcEvil: require("../data/images/monster-move-right-dropped-down.png")
            });
          }
        }
      }
    }

    let distance = 10;
    if (Math.abs(this.getNewSpriteX() - spriteX._value) != 0) {
      distance = Math.abs(this.getNewSpriteX() - spriteX._value) / 50; //- cells to move
      if (distance > 10) {
        distance = 10;
      }
    }
    else if (Math.abs(this.getNewSpriteY() - spriteY._value) != 0) {
      distance = Math.abs(this.getNewSpriteY() - spriteY._value) / 50; //- cells to move
      if (distance > 10) {
        distance = 10;
      }
    }

    Animated.parallel([
      Animated.timing(spriteX, { toValue: this.getNewSpriteX(), duration: 1300 * distance }),
      Animated.timing(spriteY, { toValue: this.getNewSpriteY(), duration: 1300 * distance })
    ]).start((finished) => {
      if (finished.finished) {
        if (this.props.isHuman) {
          if (this.state.srcPriest != require("../data/images/priestIdle.png")) {
            this.setState({
              srcPriest: require("../data/images/priestIdle.png"),
            });
            this.setState({ controlsVisible: false });
            this.props.showHumanMoves();
          }
        }
        else {
          if (this.state.srcEvil != require("../data/images/priestIdle-ghost.png")) {
            this.setState({
              srcEvil: require("../data/images/priestIdle-ghost.png"),
            });
            this.setState({ controlsVisible: false });
            this.props.showMonsterMoves();
          }
        }
      }
    });
  }

  animateSpriteYPosition = () => {
    const {spriteY } = this.state;
    Animated.timing(spriteY, { toValue: (this.getSpriteY()), duration: 1000 }).start();
  }

  componentDidUpdate() {
    // console.log('update', this.state.spriteX._value, this.getInitialSpriteX(), this.getNewSpriteX());
    if (!this.props.animationVisible || (this.beginningX !== (this.playerX - (this.screenDimensions.width / 2))) || this.beginningY !== (this.playerY - (this.screenDimensions.height / 2))) {
      this.animateCamera();
    }
    if (this.props.boardFinished && (this.getNewSpriteX() !== this.state.spriteX._value || this.getNewSpriteY() !== this.state.spriteY._value)) {
      // console.log('animation should begin', this.state.playerX, this.state.spriteX._value);
      this.animateSpritePosition();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // console.log('engine received props');
    let newHighlightedTileMap = nextProps.gameBoard.map(x => x.isHighlighted ? 1 : 0);
    let newFogMap = nextProps.gameBoard.map(x => x.isRevealed ? 0 : 1);
    let newWasPouncedMap = nextProps.gameBoard.map(x => x.wasPounced ? 1 : 0);
    let newWasEchoedMap = nextProps.gameBoard.map(x => x.wasPounced ? 1 : 0);
    if (this.props.playerSpace !== nextProps.playerSpace) {
      // console.log("player space", this.props.playerSpace, nextProps.playerSpace)
      this.setState({
        playerSpace: nextProps.playerSpace,
        playerX: (nextProps.playerSpace.name % 40) * this.props.tileWidth,
        playerY: Math.floor(nextProps.playerSpace.name / 40) * this.props.tileWidth,
      });
    }
    if (JSON.stringify(this.state.highlightedTileMap !== newHighlightedTileMap)) {
      this.setState({
        highlightedTileMap: newHighlightedTileMap,
      });
      if (newHighlightedTileMap.includes(1)) {
        this.setState({
          showHighlighted: true,
        });
      } else {
        this.setState({
          showHighlighted: false,
        });
      }
    }
    if (JSON.stringify(this.state.fogMap) !== JSON.stringify(newFogMap)) {
      this.setState({
        finishedUpdatingFogMap: false,
        fogMap: newFogMap,
      });
    }
    if (JSON.stringify(this.state.wasPouncedTileMap) !== JSON.stringify(newWasPouncedMap)) {
      this.setState({
        wasPouncedTileMap: newWasPouncedMap,
      });
    }
    if (JSON.stringify(this.state.wasEchoedTileMap) !== JSON.stringify(newWasEchoedMap)) {
      this.setState({
        wasEchoedTileMap: newWasEchoedMap,
      })
    }
  }

  processPan(x, y) {
    if (!this.state.isMoving) {
      this.setState({
        isMoving: true,
        initialX: x,
        initialY: y,
        initialTop: this.state.top,
        initialLeft: this.state.left,
      });
    } else {
      let left = this.state.initialLeft._value + x - this.state.initialX;
      let top = this.state.initialTop._value + y - this.state.initialY;
      // console.log(left, this.gameBoardWidth);
      this.setState({
          left:
            left._value > 0 ?
            new Animated.Value(0) :
              left._value < (-this.gameBoardWidth + this.screenDimensions.width) ?
                (-this.gameBoardWidth + this.screenDimensions.width) :
                new Animated.Value(left),
          top:
            top._value > 0 ?
            new Animated.Value(0) :
              top._value < (-this.gameBoardWidth + this.screenDimensions.height) ?
                (-this.gameBoardWidth + this.screenDimensions.height) :
                new Animated.Value(top),
        });
    }
  }

  processMove(touchX, touchY) {
    if (!this.state.isMoving) {
      let x = touchX - this.state.left._value;
      let y = touchY - this.state.top._value;
      // console.log("process move", this.highlightedTileRanges, x, y);
      for (let i = 0; i < this.highlightedTileRanges.length; i++) {
        if (
          x > this.highlightedTileRanges[i].xMin &&
          x < this.highlightedTileRanges[i].xMax &&
          y > this.highlightedTileRanges[i].yMin &&
          y < this.highlightedTileRanges[i].yMax
        ) {
          this.setState({
            controlsVisible: false,
            echoControlsVisible: false,
            targetPickerVisible: false,
          });
          let newPlayerTile = this.getTileFromXY(x, y);
          this.props.move(newPlayerTile);
          this.props.incrementTurnCounter();
        } else {
          // console.log('check');
          setTimeout(function() {
            if (!this.state.isMoving || !this.state.showHighlighted) {
              this.setState({
                showHighlighted: false,
                controlsVisible: true,
              });
              this.props.resetHighlighted();
              //--------------------------------------------------------------------------------------------------------------
            }
          }.bind(this), 200);
        }
      }
    }
  }

  getTileFromXY(x, y) {
    y = Math.floor(y/this.props.tileWidth);
    x = Math.floor(x/this.props.tileWidth);
    let index = ((y * 40) + x);
    // console.log(this.state.playerSpace.name, index, this.state.playerX, this.state.playerY);
    return (this.props.gameBoard[index]);
  }

  getRangesFromTile = (tile) => {
    let { size, top, left } = tile;
    return ({ xMin: left, xMax: (left + size), yMin: top, yMax: (top + size) });
  }

  renderHighlighted = () => {
    if ((!this.props.gameActive) && (this.state.showHighlighted)) {
      this.setState({ showHighlighted: false })
    }
    if (this.state.showHighlighted) {
      return (
        <TileMap
          src={require("../data/images/Magenta-square_100px.gif")}
          tileSize={this.props.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.props.tileWidth}
          layers={[this.state.highlightedTileMap]}
          renderTile={(tile, src, styles) => {
            this.highlightedTileRanges.push(this.getRangesFromTile(tile));
            return (
              <TouchableOpacity style={[styles]}>
                <Image
                  resizeMode="stretch"
                  style={[styles, { opacity: 0.1 }]}
                  source={src}
                />
              </TouchableOpacity>
            );
            }
          }
        />
      );
    } else {
      this.highlightedTileRanges = [];
    }
  };

  renderFog = () => {
    if (this.props.isHuman) {
      return (
        <TileMap
        src={require("../data/images/fog-nw.gif")}
        tileSize={this.props.tileWidth}
        columns={40}
        rows={40}
        sourceWidth={this.props.tileWidth}
        layers={[this.state.tileFogMapArray]}
        renderTile={this.renderFogTile}
        />
      );
    }
  }

  fixImageStyle = (index, tile) => {
    return ({ left: ((index - 1) * this.props.tileWidth), overflow: 'hidden' });
  }

  renderFogTile = (tile, src, styles) => {
    switch (tile.index) {
      case 1://nw
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-nw.gif")} />;
        break;
      case 2://n
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-n.gif")} />;
        break;
      case 3://ne
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-ne.gif")} />;
        break;
      case 4://e
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-e.gif")} />;
        break;
      case 5://se
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-se.gif")} />;
        break;
      case 6://s
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-s.gif")} />;
        break;
      case 7://sw
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-sw.gif")} />;
        break;
      case 8://w
        return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-w.gif")} />;
        break;
      case 9://full
        break;
      default:
        console.log('the imageKey for this tile was not assigned correctly', tile);
        break;
    }
  }

  renderLastTurn = () => {
    if (this.props.isHuman) {
      return (
        <TileMap
          src={require("../data/images/greensquare.jpg")}
          tileSize={this.props.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.props.tileWidth}
          layers={[this.state.wasPouncedTileMap]}
          renderTile={(tile, src, styles) => {
            return (
              <TouchableOpacity style={[styles]}>
                <View
                  style={[styles, { opacity: 0.3, backgroundColor: 'red' }]}
                />
              </TouchableOpacity>
            );
            }
          }
        />
      );
    } else if (!this.props.isHuman) {
      return (
        <TileMap
          src={require("../data/images/greensquare.jpg")}
          tileSize={this.props.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.props.tileWidth}
          layers={[this.state.wasEchoedTileMap]}
          renderTile={(tile, src, styles) => {
            return (
              <TouchableOpacity style={[styles]}>
                <Image
                  resizeMode="stretch"
                  style={[styles, { opacity: 0.1 }]}
                  source={src}
                />
              </TouchableOpacity>
            );
            }
          }
        />
      );
    }
  }

  controlSwitch = () => {
    // console.log('switch')
    if (this.props.gameActive) {
      if (this.state.controlsVisible) {
        if (this.props.isHuman) {
          this.props.showHumanMoves();
          this.setState({
            controlsVisible: false,
          });
        } else {
          this.props.showMonsterMoves();
          this.setState({
            controlsVisible: false,
            targetPickerVisible: false,
          });
        }
      } else {
        this.setState({
          controlsVisible: true,
          targetPickerVisible: false,
          showHighlighted: false,
        });
      }
    }
  }


  renderSprite = () => {
    if (this.props.isHuman) {
      return (
        <TouchableSprite activeOpacity={1} onStartShouldSetResponder={true} style={this.getPriestStyle()} onPress={this.controlSwitch}>
        <Sprite
        offset={[0, 0]}
        repeat={true}
        src={this.state.srcPriest}
        steps={[11]}
        state={0}
        onPlayStateChanged={this.handlePlayStateChanged}
        tileHeight={128}
        ticksPerFrame={this.state.ticksPerFrame}
        tileWidth={64}
        />
        </TouchableSprite>
      );
    } else {
      return (
        <TouchableSprite activeOpacity={1} style={this.getPriestStyle()} onPress={this.controlSwitch}>
          <Sprite
            offset={[0, 0]}
            repeat={true}
            src={this.state.srcEvil}
            steps={[11]}
            state={0}
            onPlayStateChanged={this.handlePlayStateChanged}
            tileHeight={128}
            ticksPerFrame={this.state.ticksPerFrame}
            tileWidth={64}
          />
        </TouchableSprite>
      );
    }
  }

  renderOpponent = () => {
    if (this.props.opponentVisible) {
      if (this.props.isHuman) {
        return (
          <TouchableSprite activeOpacity={1} style={this.getOpponentStyle()}>
            <Sprite
              offset={[0, 0]}
              repeat={true}
              src={this.state.srcEvil}
              steps={[11]}
              state={0}
              onPlayStateChanged={this.handlePlayStateChanged}
              tileHeight={128}
              ticksPerFrame={this.state.ticksPerFrame}
              tileWidth={64}
            />
          </TouchableSprite>
        );
      } else {
        return (
          <TouchableSprite activeOpacity={1} onStartShouldSetResponder={true} style={this.getOpponentStyle()}>
          <Sprite
          offset={[0, 0]}
          repeat={true}
          src={this.state.srcPriest}
          steps={[11]}
          state={0}
          onPlayStateChanged={this.handlePlayStateChanged}
          tileHeight={128}
          ticksPerFrame={this.state.ticksPerFrame}
          tileWidth={64}
          />
          </TouchableSprite>
        );
      }
    }
  }

  echoNorth = () => {
    this.props.resetHighlighted();
    this.props.echolocate('north');
  }
  echoEast = () => {
    this.props.resetHighlighted();

    this.props.echolocate('east');
  }
  echoBurst = () => {
    this.props.resetHighlighted();
    this.props.echolocate('radius');
  }

  echoWest = () => {
    this.props.resetHighlighted();
    this.props.echolocate('west');
  }
  echoSouth = () => {
    this.props.resetHighlighted();
    this.props.echolocate('south');
  }

  pickTarget = () => {
    this.setState({
      controlsVisible: false,
      targetPickerVisible: true,
    });
  }

  shrinePicked = () => {
      this.props.focus('shrine');
      this.setState({
        targetPicker: null,
        targetPickerVisible: false,
        controlsVisible: false,
      })
  }

  humanPicked = () => {
    this.props.focus('human');
    this.setState({
      targetPicker: null,
      targetPickerVisible: false,
      controlsVisible: false,
    })
}

  movementSwitch = () => {
    if (this.props.isHuman) {
      this.props.showHumanMoves();
    } else {
      this.props.showMonsterMoves();
    }
  }

  renderControls = () => {
    if ((!this.props.gameActive) && (this.state.controlsVisible)) {
      this.setState({ controlsVisible: false })
    }
    if (this.state.controlsVisible && this.props.tileWidth === this.props.zoomedInValue) {
      if (this.props.isHuman) {
          return (
            <View style={this.getPriestControlStyles()}>
              <View style={this.getControlButtonStyles()}>
                <ControlButton tileWidth={this.props.tileWidth} source1={require("../data/images/echoNorthOut.png")} source2={require("../data/images/echoNorthIn.png")} onPress={this.echoNorth} />
              </View>
              <View style={this.getControlButtonStyles()}>
                <ControlButton tileWidth={this.props.tileWidth} source1={require("../data/images/echoWestOut.png")} source2={require("../data/images/echoWestIn.png")} onPress={this.echoWest} />
                <ControlButton tileWidth={this.props.tileWidth} source1={require("../data/images/echoBurstOut.png")} source2={require("../data/images/echoBurstIn.png")} onPress={this.echoBurst} />
                <ControlButton tileWidth={this.props.tileWidth} source1={require("../data/images/echoEastOut.png")} source2={require("../data/images/echoEastIn.png")} onPress={this.echoEast} />
              </View>
              <View style={this.getControlButtonStyles()}>
                <ControlButton tileWidth={this.props.tileWidth} source1={require("../data/images/echoSouthOut.png")} source2={require("../data/images/echoSouthIn.png")} onPress={this.echoSouth} />
              </View>
            </View>
          );
      } else {
          return (
            <View style={this.getMonsterControlStyles()} >
              <ControlButton tileWidth={this.props.tileWidth} source1={this.state.srcfocusOut} source2={this.state.srcfocusIn} onPress={this.pickTarget} />
            </View>
          );
        }
      }
    }

  renderTargetPicker = () => {
    if (this.state.targetPickerVisible) {
      return (
        <View style={this.getMonsterControlStyles()} >
          <ControlButton tileWidth={this.props.tileWidth} source1={this.state.srcTargetPriestOut} source2={this.state.srcTargetPriestIn} onPress={this.humanPicked} />
          <ControlButton tileWidth={this.props.tileWidth} source1={this.state.srcTargetShrineOut} source2={this.state.srcTargetShrineIn} onPress={this.shrinePicked} />
        </View>
      );
    }
  }

  getMonsterControlStyles = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return ({ height: this.props.tileWidth, width: this.props.tileWidth*3, left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*5, flexDirection: "row", justifyContent: 'space-between' });
    } else {
      return ({ height: this.props.tileWidth, width: this.props.tileWidth*3, left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*8, flexDirection: "row", justifyContent: 'space-between' });
    }
  }

  getPriestControlStyles = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return { height: this.props.tileWidth * 3, width: this.props.tileWidth * 3, flexDirection: 'column', left: this.state.playerX + this.props.tileWidth, top: this.state.playerY - (this.props.tileWidth*5) };
    } else {
      return { height: this.props.tileWidth * 3, width: this.props.tileWidth * 3, flexDirection: 'column', left: this.state.playerX + this.props.tileWidth, top: this.state.playerY - (this.props.tileWidth*8) };
    }
  }

  getControlButtonStyles = () => {
    return ({ height: this.props.tileWidth, width: this.props.tileWidth * 3, flexDirection: 'row', justifyContent: 'center', zIndex: 3 });
  }

  render() {
    return (
      <Loop>
        <Stage
          height={this.screenDimensions.height}
          width={this.screenDimensions.width}
          style={{ backgroundColor: "#000" }}
        >
          <View style={{width: this.screenDimensions.width, height: this.screenDimensions.height, zIndex: 1 }} {...this._panResponder.panHandlers}>
            <Animated.View style={{ position: 'absolute', left: this.state.left, top: this.state.top, width: this.gameBoardWidth, height: this.gameBoardWidth }} >
              <Board
                gameBoard={this.props.gameBoard}
                isHuman={this.props.isHuman}
                boardFinished={this.props.boardFinished}
                tileWidth={this.props.tileWidth}
              />

              {this.renderHighlighted()}
              {this.renderFog()}
              {this.renderLastTurn()}
              {this.renderSprite()}
              {this.renderOpponent()}
              {this.renderControls()}
              {this.renderTargetPicker()}

            </Animated.View>
          </View>
        </Stage>
      </Loop>
    );
  }

  getSpriteStyle = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return ({ zIndex: 1, left: this.state.spriteX, top: this.state.spriteY, width: this.props.tileWidth*3, transform: [{scale: this.state.spriteScale}] });
    } else if (this.props.tileWidth === this.props.zoomedOutValue) {
      return ({ zIndex: 1, left: this.state.spriteX, top: this.state.spriteY, width: this.props.tileWidth*7, transform: [{scale: this.state.spriteScale}] });
    }

  }

  getPriestStyle = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return ({zIndex: 1, height: this.props.tileWidth * 3, width: this.props.tileWidth, left: this.state.spriteX, top: this.state.spriteY });
    } else if (this.props.tileWidth === this.props.zoomedOutValue) {
      return ({zIndex: 1, left: this.state.spriteX, top: this.state.spriteY, width: this.props.tileWidth/this.state.spriteScale, transform: [{scale: this.state.spriteScale}] });
    }
  }

  // this.playerX = (this.props.playerSpace.name % 40) * this.props.tileWidth;
  // this.playerY = Math.floor(this.props.playerSpace.name / 40) * this.props.tileWidth;

  getOpponentStyle = () => {
    if (this.props.isHuman) {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return ({zIndex: 1, height: this.props.tileWidth * 3, width: this.props.tileWidth, left: ((this.props.monsterSpace.name % 40) * this.props.tileWidth), top: (Math.floor((this.props.monsterSpace.name / 40) * this.props.tileWidth) - this.props.tileWidth * 5) });
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return ({zIndex: 1, left: ((this.props.monsterSpace.name % 40) * this.props.tileWidth), top: (Math.floor(this.props.monsterSpace.name / 40) * this.props.tileWidth - (this.props.tileWidth*11)), width: this.props.tileWidth/this.state.spriteScale, transform: [{ scale: this.state.spriteScale }] });
      }
    } else {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return ({zIndex: 1, height: this.props.tileWidth * 3, width: this.props.tileWidth, left: ((this.props.humanSpace.name % 40) * this.props.tileWidth), top: (Math.floor((this.props.humanSpace.name / 40) * this.props.tileWidth) - this.props.tileWidth * 5) });
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return ({zIndex: 1, left: ((this.props.humanSpace.name % 40) * this.props.tileWidth - this.props.tileWidth), top: (Math.floor(this.props.humanSpace.name / 40) * this.props.tileWidth - (this.props.tileWidth*10)), width: this.props.tileWidth/this.state.spriteScale, transform: [{ scale: this.state.spriteScale }] });
      }
    }
  }

  handlePlayStateChanged = (state) => {
    this.setState({
      spritePlaying: state ? true : false,
    });
  }
}
