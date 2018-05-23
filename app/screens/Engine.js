import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, Image, View, PanResponder, TouchableOpacity, Animated } from "react-native";
import { Loop, Stage, TileMap, Sprite } from "react-game-kit/native";

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
    this.state = {
      playerSpace: this.props.playerSpace,
      playerX: this.playerX,
      playerY: this.playerY,
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
      spritePlaying: true,
      spriteScale: this.props.tileWidth / this.props.zoomedInValue,
      wasPouncedTileMap: this.wasPouncedTileMap,
      wasEchoedTileMap: this.wasEchoedTileMap,
    };
  }

  getCameraY = () => {
    if (this.props.isHuman) {
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
    } else if (this.props.turnCounter === 0 && this.wasEchoedTileMap.includes(1)) {
        for (let i = 0; i < this.props.gameBoard.length; i++) {
          if (this.props.gameBoard[i].wasEchoed) {
            this.feedbackSquare = this.props.gameBoard[i];
            return ((Math.floor(this.feedbackSquare.name / 40) * this.props.tileWidth) - (this.screenDimensions.height / 2));
          }
        }
    } else {
      return (this.playerY - (this.screenDimensions.height / 2));
    }
  }

  getCameraX = () => {
    if (this.props.isHuman) {
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
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      // onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {

      },
      onPanResponderMove: (evt, gestureState) => {
        let { touches } = evt.nativeEvent;
        // let { touches } = evt.nativeEvent;
        if (touches.length === 2 && (Math.abs(touches[0].pageX - touches[1].pageX) > 5)) {
          this.processPan(touches[0].pageX, touches[0].pageY);
        } else if (this.state.showHighlighted && touches.length === 1) {
          this.processMove(touches[0].pageX, touches[0].pageY);
        }
      },
      onPanResponderRelease: () => {
        // console.log("on pan responder release");
        this.setState({
          isMoving: false,
        });
      }
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
      Animated.timing(left, { toValue: -newX, duration: 2000}),
      Animated.timing(top, { toValue: -newY, duration: 2000}),
    ]).start();}.bind(this), 1000);
  }

  componentDidUpdate() {
    console.log('update', this.props.animationVisible);
    if (!this.props.animationVisible || (this.beginningX !== (this.playerX - (this.screenDimensions.width / 2))) || this.beginningY !== (this.playerY - (this.screenDimensions.height / 2))) {
      console.log('animate camera');
      this.animateCamera();
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
    let x = touchX - this.state.left._value;
    let y = touchY - this.state.top._value;
    // console.log("process move", this.highlightedTileRanges, touchX, touchY, x, y, this.state.left, this.state.top);
    for (let i = 0; i < this.highlightedTileRanges.length; i++) {
      if (
        x > this.highlightedTileRanges[i].xMin &&
        x < this.highlightedTileRanges[i].xMax &&
        y > this.highlightedTileRanges[i].yMin &&
        y < this.highlightedTileRanges[i].yMax
      ) {
        let newPlayerTile = this.getTileFromXY(x, y);
        this.props.move(newPlayerTile);
        this.props.incrementTurnCounter();
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

  renderSprite = () => {
    if (this.props.isHuman) {
      return (
        <Sprite
          offset={[0,0]}
          repeat={true}
          src={require("../data/images/Priest-static.png")}
          steps={[0]}
          state={0}
          onPlayStateChanged={this.handlePlayStateChanged}
          tileHeight={150}
          tileWidth={55}
          style={this.getSpriteStyle()}
        />
      );
    } else {
      return (
        <Sprite
          offset={[0,0]}
          repeat={true}
          src={require("../data/images/monsterMoveIdle.png")}
          steps={[11, 11, 11, 11]}
          state={0}
          onPlayStateChanged={this.handlePlayStateChanged}
          tileHeight={150}
          ticksPerFrame={10}
          tileWidth={150}
          style={this.getSpriteStyle()}
        />
      );
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
          <View style={{width: this.screenDimensions.width, height: this.screenDimensions.height, zIndex: 1}} {...this._panResponder.panHandlers}>
            <Animated.View style={{ position: 'absolute', left: this.state.left, top: this.state.top, width: this.gameBoardWidth, height: this.gameBoardWidth }} >
              <Board
                gameBoard={this.props.gameBoard}
                isHuman={this.props.isHuman}
                boardFinished={this.props.boardFinished}
                tileWidth={this.props.tileWidth}
              />

              {this.renderHighlighted()}
              {this.renderLastTurn()}
              {this.renderSprite()}

            </Animated.View>
          </View>
        </Stage>
      </Loop>
    );
  }

  getSpriteStyle = () => {
    if (this.props.isHuman) {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        // return ({ left: this.state.playerX - Math.ceil((this.props.tileWidth - 4)), top: this.state.playerY - ((this.props.tileWidth*2 + 4)), transform: [{scale: this.state.spriteScale}] });
        return ({ left: this.state.playerX, top: this.state.playerY - this.props.tileWidth*1.75, transform: [{scale: this.state.spriteScale*0.7}] });

      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return ({ left: this.state.playerX - this.props.tileWidth, top: this.state.playerY - this.props.tileWidth*4, transform: [{scale: this.state.spriteScale*0.7}] });
      }
    } else {
      if (this.props.tileWidth === this.props.zoomedInValue) {
        return ({ left: this.state.playerX - Math.ceil((this.props.tileWidth - 4)), top: this.state.playerY - ((this.props.tileWidth*2 + 4)), transform: [{scale: this.state.spriteScale}] });
      } else if (this.props.tileWidth === this.props.zoomedOutValue) {
        return ({ left: this.state.playerX - Math.ceil((this.props.tileWidth - 4)/(this.state.spriteScale/1.6)), top: this.state.playerY - (this.props.tileWidth*4.3), transform: [{scale: this.state.spriteScale}] });
      }
    }
  }

  handlePlayStateChanged = (state) => {
    this.setState({
      spritePlaying: state ? true : false,
    });
  }

}
