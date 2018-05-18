import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, Image, View, PanResponder } from "react-native";
import { Loop, Stage, TileMap } from "react-game-kit/native";

import Board from "./Board";

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool,
    playerSpace: PropTypes.object,
    isHuman: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    // console.log("Engine");
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = Math.ceil(this.screenDimensions.height / 40);
    this.gameBoardWidth = this.tileWidth * 40;
    this.playerX = (props.playerSpace.name % 40) * this.tileWidth;
    this.playerY = Math.floor(props.playerSpace.name / 40) * this.tileWidth;
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
      top: 0,
      left: 0,
      highlightedTileMap: this.props.gameBoard.map(x => x.isHighlighted ? 1 : 0),

    };
  }

  componentWillMount() {
    // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    // console.log(this.props.isHuman);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        // console.log("on pan responder grant");
      },
      onPanResponderMove: (evt, gestureState) => {
        let { touches } = evt.nativeEvent;
        if (touches.length === 2 && !this.state.isZooming) {
          this.processTouch(touches[0].pageX, touches[0].pageY);
        }
      },
      onPanResponderRelease: () => {
        // console.log("on pan responder release");
        this.setState({
          isZooming: false,
          isMoving: false,
        });
      }
    });
  }

  UNSAFE_componentWillMount() {
  }

  processTouch(x, y) {
    if (!this.state.isMoving) {
      this.setState({
        isMoving: true,
        initialX: x,
        initialY: y,
        initialTop: this.state.top,
        initialLeft: this.state.left,
      });
    } else {
      let left = this.state.initialLeft + x - this.state.initialX;
      let top = this.state.initialTop + y - this.state.initialY;
      // console.log(left, this.gameBoardWidth);
      this.setState({
          left:
            left > 0
            ? 0
            : left < (-this.gameBoardWidth + this.screenDimensions.width)
              ? (-this.gameBoardWidth + this.screenDimensions.width)
              : left,
          top:
            top > 0
            ? 0
            : top < (-this.gameBoardWidth + this.screenDimensions.height)
            ? (-this.gameBoardWidth + this.screenDimensions.height)
            : top,
        });
    }
  }

  render() {
    console.log('render engine', this.state.playerX)
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          height={this.screenDimensions.height}
          width={this.screenDimensions.width}
          style={{ backgroundColor: "#515151" }}
        >
          <View style={{ position: 'absolute', left: this.state.left, top: this.state.top }} {...this._panResponder.panHandlers} >
            <Board
              gameBoard={this.props.gameBoard}
              isHuman={this.props.isHuman}
            />
            <TileMap
              src={require("../data/images/Magenta-square_100px.gif")}
              tileSize={this.tileWidth}
              columns={40}
              rows={40}
              sourceWidth={this.tileWidth}
              layers={[this.state.highlightedTileMap]}
            />
            <Image style={{ position: 'absolute', top: this.state.playerY - this.tileWidth, left: this.state.playerX, height: (this.tileWidth * 2), width: this.tileWidth, resizeMode: 'contain' }} source={require("../data/images/human.png")} />
          </View>
        </Stage>
      </Loop>
    );
  }
}
