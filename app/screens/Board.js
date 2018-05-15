import React, { Component } from "react";
import { View, Dimensions, PanResponder, Animated } from "react-native";
import PropTypes from "prop-types";
import { autorun } from "mobx";
import { TileMap } from "react-game-kit/native";

import GameStore from "../data/GameStore";

function calcDistance(x1, y1, x2, y2) {
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calcCenter(x1, y1, x2, y2) {
  function middle(p1, p2) {
    return p1 > p2 ? p1 - (p1 - p2) / 2 : p2 - (p2 - p1) / 2;
  }

  return {
    x: middle(x1, x2),
    y: middle(y1, y2)
  };
}

function maxOffset(offset, windowDimension, imageDimension) {
  let max = windowDimension - imageDimension;
  if (max >= 0) {
    return 0;
  }
  return offset < max ? max : offset;
}

function calcOffsetByZoom(width, height, imageWidth, imageHeight, zoom) {
  let xDiff = imageWidth * zoom - width;
  let yDiff = imageHeight * zoom - height;
  return {
    left: -xDiff / 2,
    top: -yDiff / 2
  };
}

export default class Board extends Component {
  static contextTypes = {
    scale: PropTypes.number
  };
  static propTypes = {
    gameBoard: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 50;
    this.sourceWidth = 50;
    this.gameBoardWidth = this.tileWidth * 40;
    this.scale = 0.2;
    this.blackTilesMap = this.props.gameBoard.map(a => (a.value === 0 ? 1 : 0));
    this.floorTilesMap = this.props.gameBoard.map(a => (a.value > 0 ? 1 : 0));
    this.wallTilesMap = this.props.gameBoard.map(a => (a.value < 0 ? 1 : 0));
    this.state = {
      pan: new Animated.ValueXY(),
      zoom: null,
      minZoom: null,
      layoutKnown: false,
      isZooming: false,
      isMoving: false,
      initialDistance: null,
      initialX: null,
      initalY: null,
      offsetTop: 0,
      offsetLeft: 0,
      initialTop: 0,
      initialLeft: 0,
      initialTopWithoutZoom: 0,
      initialLeftWithoutZoom: 0,
      initialZoom: 1,
      top: 0,
      left: 0
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        console.log("on pan responder grant");
      },
      onPanResponderMove: (evt, gestureState) => {
        let touches = evt.nativeEvent.touches;
        if (touches.length == 2) {
          let touch1 = touches[0];
          let touch2 = touches[1];

          this.props.processPinch(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );
        } else if (touches.length == 1 && !this.state.isZooming) {
          this.processTouch(touches[0].pageX, touches[0].pageY);
        }
      },
      onPanResponderRelease: () => {
        console.log("on pan responder release");
        this.setState({
          isZooming: false,
          isMoving: false
        });
        this.props.releaseTouch();
      }
    });
  }

  processTouch(x, y) {
    if (!this.state.isMoving) {
      this.setState({
        isMoving: true,
        initialX: x,
        initialY: y,
        initialTop: this.state.top,
        initialLeft: this.state.left
      });
    } else {
      let left = this.state.initialLeft + x - this.state.initialX;
      let top = this.state.initialTop + y - this.state.initialY;

      this.setState({
        left:
          left > 0
            ? 0
            : maxOffset(
                left,
                this.state.width,
                this.gameBoardWidth * this.state.zoom
              ),
        top:
          top > 0
            ? 0
            : maxOffset(
                top,
                this.state.height,
                this.gameBoardWidth * this.state.zoom
              )
      });
    }
  }

  componentWillUnmount() {
    this.cameraWatcher();
    this.state.pan.x.removeAllListeners();
    this.state.pan.y.removeAllListeners();
  }

  render() {
    console.log("opacitiy?");
    return (
      <View
        style={{
          position: "absolute",
          top: this.state.offsetTop + this.state.top,
          left: this.state.offsetLeft + this.state.left,
          width: this.gameBoardWidth * this.state.zoom,
          height: this.gameBoardWidth * this.state.zoom
        }}
        {...this._panResponder.panHandlers}
      >
        <TileMap
          src={require("../data/images/Black_square.jpeg")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.sourceWidth}
          layers={[this.blackTilesMap]}
          scale={this.context.scale}
        />
        <TileMap
          src={require("../data/images/Magenta-square_100px.gif")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.sourceWidth}
          layers={[this.wallTilesMap]}
          scale={this.context.scale}
        />
        <TileMap
          src={require("../data/images/Cyan-square.png")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.sourceWidth}
          layers={[this.floorTilesMap]}
          scale={this.context.scale}
        />
      </View>
    );
  }
}
