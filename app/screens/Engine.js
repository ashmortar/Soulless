import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, Image, View, PanResponder, TouchableOpacity, Animated } from "react-native";
import { Loop, Stage, TileMap, Sprite } from "react-game-kit/native";

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
  };

  constructor(props) {
    super(props);
    this.screenDimensions = Dimensions.get("window");
    this.gameBoardWidth = this.props.tileWidth * 40;
    this.wasPouncedTileMap = this.props.gameBoard.map(a => a.wasPounced ? 1 : 0);
    this.wasEchoedTileMap = this.props.gameBoard.map(a => a.wasEchoed ? 1 : 0);
    this.highlightedTileRanges = [];
    this.xOffsetMax = this.gameBoardWidth - this.screenDimensions.width;
    this.yOffsetMax = this.gameBoardWidth - this.screenDimensions.height;
    this.playerX = (this.props.playerSpace.name % 40) * this.props.tileWidth;
    this.playerY = Math.floor(this.props.playerSpace.name / 40) * this.props.tileWidth;
    this.cameraX = this.getCameraX();
    this.cameraY = this.getCameraY();
    this.beginningX = this.getBeginningX();
    this.beginningY = this.getBeginningY();
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
      src: require("../data/images/priestIdle.png"),
    };
  }

  getInitialSpriteX = () => {

    // if (this.props.isHuman) {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return (this.playerX - this.props.tileWidth*0.1);
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return (this.playerX - this.props.tileWidth*0.8);
      }
    // this.setState({
    //   src: require("../data/images/priest-walk.png")
    // });
    // } else if (this.props.tileWidth === this.props.zoomedInValue) {
    //     return (this.playerX - Math.ceil((this.props.tileWidth - 4)));
    // } else if (this.props.tileWidth === this.props.zoomedOutValue) {
    //   return (this.playerX - this.props.tileWidth*3);
    // }
  }

  getNewSpriteX = () => {
    // if (this.props.isHuman) {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return (this.state.playerX - this.props.tileWidth*0.1);
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return (this.state.playerX - this.props.tileWidth*0.8);
      }
    // } else if (this.props.tileWidth === this.props.zoomedInValue) {
    //     return (this.state.playerX - Math.ceil((this.props.tileWidth - 4)));
    // } else if (this.props.tileWidth === this.props.zoomedOutValue) {
    //   return (this.state.playerX - this.props.tileWidth*3);
    // }
  }

  getInitialSpriteY = () => {
    // if (this.props.isHuman) {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return (this.playerY - this.props.tileWidth*1.5);
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return (this.playerY - this.props.tileWidth*3.5);
      }
    // } else if (this.props.tileWidth === this.props.zoomedInValue) {
    //   return (this.playerY - ((this.props.tileWidth*2 + 4)));
    // } else if (this.props.tileWidth === this.props.zoomedOutValue) {
    //   return (this.playerY - (this.props.tileWidth*4.3));
    // }
  }

  getNewSpriteY = () => {
    // if (this.props.isHuman) {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return (this.state.playerY - this.props.tileWidth*1.5);
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return (this.state.playerY - this.props.tileWidth*3.5);
      }
    // } else if (this.props.tileWidth === this.props.zoomedInValue) {
    //   return (this.state.playerY - ((this.props.tileWidth*2 + 4)));
    // } else if (this.props.tileWidth === this.props.zoomedOutValue) {
    //   return (this.state.playerY - (this.props.tileWidth*4.3));
    // }
  }

  getCameraY = () => {
    // if (this.props.isHuman) {
      if (this.props.turnCounter === 0 && this.wasPouncedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasPounced) {
            this.feedbackSquare = this.props.gameBoard[i + 41];
            return ((Math.floor(this.feedbackSquare.name / 40) * this.props.tileWidth) - (this.screenDimensions.height / 2));
          }
        }
      } else {
        return (this.playerY - (this.screenDimensions.height / 2));
      }
    // } else if (this.props.turnCounter === 0 && this.wasEchoedTileMap.includes(1)) {
    //     for (let i = 0; i < this.props.gameBoard.length; i++) {
    //       if (this.props.gameBoard[i].wasEchoed) {
    //         this.feedbackSquare = this.props.gameBoard[i];
    //         return ((Math.floor(this.feedbackSquare.name / 40) * this.props.tileWidth) - (this.screenDimensions.height / 2));
    //       }
    //     }
    // } else {
    //   return (this.playerY - (this.screenDimensions.height / 2));
    // }
  }

  getCameraX = () => {
    // if (this.props.isHuman) {
      if (this.props.turnCounter === 0 && this.wasPouncedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasPounced) {
            this.feedbackSquare = this.props.gameBoard[i + 41];
            return (((this.feedbackSquare.name % 40) * this.props.tileWidth) - (this.screenDimensions.width / 2));
          }
        }
      } else {
        return (this.playerX - (this.screenDimensions.width / 2));
      }
    // } else if (this.props.turnCounter === 0 && this.wasEchoedTileMap.includes(1)) {
    //     for (let i = 0; i < this.props.gameBoard.length; i++) {
    //       if (this.props.gameBoard[i].wasEchoed) {
    //         this.feedbackSquare = this.props.gameBoard[i];
    //         return (((this.feedbackSquare.name % 40) * this.props.tileWidth) - (this.screenDimensions.width / 2));
    //       }
    //     }
    // } else {
    //   return (this.playerX - (this.screenDimensions.width / 2));
    // }
  }

  getBeginningX = () => {
    if (this.cameraX < 0) {
      return 0;
    } else if (this.cameraX > this.xOffsetMax) {
      return -this.xOffsetMax;
    } else {
      return -this.cameraX;
    }
  }

  getBeginningY = () => {
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
        } else if (this.state.showHighlighted) {
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
    if (this.state.src != require("../data/images/priest-walk.png")) {
      this.setState({
        src: require("../data/images/priest-walk.png")
      });
    }
    Animated.parallel([
      Animated.timing(spriteX, { toValue: this.getNewSpriteX(), duration: 1000 }),
      Animated.timing(spriteY, { toValue: this.getNewSpriteY(), duration: 1000 })
    ]).start((finished) => {
      if (finished.finished) {
        if (this.state.src != require("../data/images/priestIdle.png")) {
          this.setState({
            src: require("../data/images/priestIdle.png")
          });
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
          // console.log('else');
          setTimeout(function() {
            if (!this.state.isMoving) {
              this.setState({
                showHighlighted: false,
              });
              this.props.resetHighlighted();
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
    // console.log('renderFogTile');
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
  // return <Image resizeMode="stretch" style={[styles, { opacity: 1 }, this.fixImageStyle()]} source={require("../data/images/fog-full.gif")} />;

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
    if (this.state.controlsVisible) {
      this.setState({
        controlsVisible: false,
        echoControlsVisible: false,
        targetPickerVisible: false,
      });


    } else {
      this.setState({
        controlsVisible: true,
      })
    }
  }


  renderSprite = () => {
    if (this.props.isHuman) {
      return (
        <TouchableSprite onStartShouldSetResponder={true} style={this.getPriestStyle()} onPress={this.controlSwitch}>
        <Sprite
        offset={[0, 0]}
        repeat={true}
        src={this.state.src}
        steps={[11]}
        state={0}
        onPlayStateChanged={this.handlePlayStateChanged}
        tileHeight={128}
        ticksPerFrame={10}
        tileWidth={64}
        />
        </TouchableSprite>
      );
    } else {
      return (
        <TouchableSprite style={this.getPriestStyle()} onPress={this.controlSwitch}>
          <Sprite
            offset={[0, 0]}
            repeat={true}
            src={require("../data/images/priestIdle-ghost.png")}
            steps={[11]}
            state={0}
            onPlayStateChanged={this.handlePlayStateChanged}
            tileHeight={128}
            ticksPerFrame={10}
            tileWidth={64}
          />
        </TouchableSprite>
      );
    }
   //  } else {
   //   return (
   //     <TouchableSprite style={this.getSpriteStyle()} onPress={this.controlSwitch}>
   //       <Sprite
   //         offset={[0, 0]}
   //         repeat={true}
   //         src={require("../data/images/monsterMoveIdle.png")}
   //         steps={[11, 11, 11, 11]}
   //         state={0}
   //         onPlayStateChanged={this.handlePlayStateChanged}
   //         tileHeight={150}
   //         ticksPerFrame={10}
   //         tileWidth={150}
   //       />
   //     </TouchableSprite>
   //   );
   // }
  }

  echoControlSwitch = () => {
    if (this.state.echoControlsVisible) {
      this.setState({
        controlsVisible: false,
        echoControlsVisible: false,
      })
    } else {
      this.setState({
        echoControlsVisible: true,
      });
    }
  }

  echoNorth = () => {
    this.props.echolocate('north');
  }
  echoEast = () => {
    this.props.echolocate('east');
  }
  echoBurst = () => {
    this.props.echolocate('radius');
  }

  echoWest = () => {
    this.props.echolocate('west');
  }
  echoSouth = () => {
    this.props.echolocate('south');
  }

  sniffTargetPicker = () => {
    this.setState({
      targetPicker: 'sniff',
      targetPickerVisible: true,
    });
  }

  listenTargetPicker = () => {
    this.setState({
      targetPicker: 'listen',
      targetPickerVisible: true,
    });
  }

  shrinePicked = () => {
    if (this.state.targetPicker === 'sniff') {
      this.props.sniff('shrine');
      this.setState({
        targetPicker: null,
        targetPickerVisible: false,
        controlsVisible: false,
      })
    } else if (this.state.targetPicker === 'listen') {
      this.props.listen('shrine');
      this.setState({
        targetPicker: null,
        targetPickerVisible: false,
        controlsVisible: false,
      })
    }
  }

  humanPicked = () => {
    if (this.state.targetPicker === 'sniff') {
      this.props.sniff('human');
      this.setState({
        targetPicker: null,
        targetPickerVisible: false,
        controlsVisible: false,
      });
    } else if (this.state.targetPicker === 'listen') {
      this.props.listen('human');
      this.setState({
        targetPicker: null,
        targetPickerVisible: false,
        controlsVisible: false,
      });
    }
  }

  movementSwitch = () => {
    this.controlSwitch();
    if (this.props.isHuman) {
      this.props.showHumanMoves();
    } else {
      this.props.showMonsterMoves();
    }
  }

  renderControls = () => {
    if (this.state.controlsVisible) {
      if (this.props.isHuman) {
        if (!this.state.echoControlsVisible) {
          return (
            <View style={[this.getPriestControlStyles(), {height: this.props.tileWidth, width: this.props.tileWidth * 3 }]}>
              <TouchableOpacity style={{ width: this.props.tileWidth}} onPress={this.movementSwitch}>
                <Image source={require('../data/images/move.png')} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.5 }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ width: this.props.tileWidth}} onPress={this.echoControlSwitch}>
                <Image source={require("../data/images/echoIcon.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.5 }} />
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <View style={this.getEchoControlStyles()} >
              <View style={{flexDirection: 'row', flex: 1}}>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth }} onPress={this.echoControlSwitch}>
                  <Image source={require("../data/images/cancel.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, opacity: 0.1 }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth }} onPress={this.echoNorth} >
                  <Image source={require("../data/images/echoArrow.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3, transform: [{ rotate: '90deg'}] }} />
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', flex: 1}}>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth }} onPress={this.echoWest}>
                  <Image source={require("../data/images/echoArrow.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3 }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth }} onPress={this.echoBurst}>
                  <Image source={require("../data/images/echoBurst.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3 }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth }} onPress={this.echoEast}>
                  <Image source={require("../data/images/echoArrow.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3, transform: [{ rotate: '180deg'}] }} />
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', flex: 1, justifyContent: 'center'}}>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth }} onPress={this.echoSouth}>
                  <Image source={require("../data/images/echoArrow.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3, transform: [{ rotate: '-90deg'}] }} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }
      } else {
        if (!this.state.targetPickerVisible) {
          return (
            <View style={this.getMonsterControlStyles()} >
              <View style={{zIndex: 1, height: this.props.tileWidth*5, width: this.props.tileWidth, flexDirection: 'column', justifyContent: 'space-between'}}>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth}} onPress={this.movementSwitch}>
                  <Image source={require("../data/images/move.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3 }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth}} onPress={this.props.monsterProcessPounce}>
                  <Image source={require("../data/images/pounceIcon.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3 }} />
                </TouchableOpacity>
              </View>
              <View style={{height: this.props.tileWidth*5, width: this.props.tileWidth, flexDirection: 'column', justifyContent: 'space-between'}}>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth}} onPress={this.sniffTargetPicker}>
                  <Image source={require("../data/images/sniffIcon.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3 }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: this.props.tileWidth, height: this.props.tileWidth}} onPress={this.listenTargetPicker}>
                  <Image source={require("../data/images/listenIcon.png")} style={{ width: this.props.tileWidth, height: this.props.tileWidth, backgroundColor: "#fff", opacity: 0.3 }} />
                </TouchableOpacity>
              </View>
            </View>
          )
        } else {
          return (
            <View style={this.getMonsterControlStyles()} >
              <TouchableOpacity style={{ height: this.props.tileWidth*2, width:this.props.tileWidth}} onPress={this.shrinePicked}>
                <Image source={require('../data/images/shrine.png')} style={{width: this.props.tileWidth, height: this.props.tileWidth*2, backgroundColor: "#fff", opacity: 0.3}} />
              </TouchableOpacity>
              <TouchableOpacity style={{ height: this.props.tileWidth*2, width: this.props.tileWidth}} onPress={this.humanPicked}>
                <Image source={require('../data/images/Priest-static.png')} style={{width: this.props.tileWidth, height: this.props.tileWidth*2, backgroundColor: "#fff", opacity: 0.3}} resizeMode='stretch'/>
              </TouchableOpacity>
            </View>
          )
        }
      }
    }
  }

  getMonsterControlStyles = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return ({ height: this.props.tileWidth*5, width: this.props.tileWidth*5, left: this.state.playerX - this.props.tileWidth*2, top: this.state.playerY - this.props.tileWidth*5.5, flexDirection: "row", justifyContent: 'space-between' });
    } else {
      return ({ height: this.props.tileWidth*5, width: this.props.tileWidth*5, left: this.state.playerX - this.props.tileWidth*2, top: this.state.playerY - this.props.tileWidth*10, flexDirection: "row", justifyContent: 'space-between' });
    }
  }

  getPriestControlStyles = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return ({ height: this.props.tileWidth, width: this.props.tileWidth * 3, left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*5, flexDirection: 'row', justifyContent: 'space-between' });
    } else {
      return ({height: this.props.tileWidth, width: this.props.tileWidth * 3, left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*9, flexDirection: 'row', justifyContent: 'space-between' });
    }
  }
  getEchoControlStyles = () => {
    if (this.props.tileWidth === this.props.zoomedInValue) {
      return ({ zIndex: 2, height: this.props.tileWidth * 3, width: this.props.tileWidth * 3, left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*5, flexDirection: 'column' });
    } else {
      return ({ zIndex: 2, height: this.props.tileWidth * 3, width: this.props.tileWidth * 3, left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*9, flexDirection: 'column' });
    }
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
              {this.renderControls()}

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

  handlePlayStateChanged = (state) => {
    this.setState({
      spritePlaying: state ? true : false,
    });
  }
}
