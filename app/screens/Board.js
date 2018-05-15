import React, { Component } from "react";
import { View, Dimensions, PanResponder, Animated } from "react-native";
import PropTypes from "prop-types";
import { autorun } from "mobx";
import { TileMap } from "react-game-kit/native";

function calcDistance(x1, y1, x2, y2) {
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  return Math.sqrt((dx ** 2) + (dy ** 2));
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
    scale: PropTypes.number,
    loop: PropTypes.object,

  };
  static propTypes = {
    gameBoard: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.counter = 0;
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 50;
    this.sourceWidth = 50;
    this.gameBoardWidth = this.tileWidth * 40;
    this.scale = 0.2;
    this.blackTilesMap = this.props.gameBoard.map(a => (a.value === 0 ? 1 : 0));
    this.floorTilesMap = this.props.gameBoard.map(a => (a.value > 0 ? 1 : 0));
    this.wallTilesMap = this.props.gameBoard.map(a => (a.value < 0 ? 1 : 0));
    this.state = {
      zoom: 1,
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
      left: 0,
      tileSize: 20,

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
        let {touches} = evt.nativeEvent;
        if (touches.length == 2) {
          let touch1 = touches[0];
          let touch2 = touches[1];

          this.processPinch(
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
          isMoving: false,
        });
      },
    });
  }

  componentDidMount() {
    this.context.loop.subscribe(this.update);
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.update);
  }

  processPinch = (x1, y1, x2, y2) => {
    console.log("process pinch");
    let distance = calcDistance(x1, y1, x2, y2);
    let center = calcCenter(x1, y1, x2, y2);
    console.log(`distance: ${distance}, center: ${center}`);

    if (!this.state.isZooming) {
      let offsetByZoom = calcOffsetByZoom(
        this.state.width,
        this.state.height,
        this.gameBoardWidth,
        this.gameBoardWidth,
        this.state.zoom
      );
      this.setState({
        isZooming: true,
        initialDistance: distance,
        initialX: center.x,
        initialY: center.y,
        initialTop: this.state.top,
        initialLeft: this.state.left,
        initialZoom: this.state.zoom,
        initialTopWithoutZoom: this.state.top - offsetByZoom.top,
        initialLeftWithoutZoom: this.state.left - offsetByZoom.left
      });
    } else {
      let touchZoom = distance / this.state.initialDistance;
      let zoom =
        touchZoom * this.state.initialZoom > this.state.minZoom
          ? touchZoom * this.state.initialZoom
          : this.state.minZoom;

      let offsetByZoom = calcOffsetByZoom(
        this.state.width,
        this.state.height,
        this.gameBoardWidth,
        this.gameBoardWidth,
        zoom
      );
      let left =
        this.state.initialLeftWithoutZoom * touchZoom + offsetByZoom.left;
      let top = this.state.initialTopWithoutZoom * touchZoom + offsetByZoom.top;
      console.log("zoom", zoom);
      this.setState({
        zoom: zoom,
        left: 0,
        top: 0,
        left:
          left > 0
            ? 0
            : maxOffset(left, this.state.width, this.gameBoardWidth * zoom),
        top:
          top > 0
            ? 0
            : maxOffset(top, this.state.height, this.gameBoardWidth * zoom)
      });
    }
  };

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

  update = () => {
    if (this.state.isMoving) {
      console.log(`update: ${this.counter}`);
      // this.props.zoom();
      this.counter += 1;
    }
  }

  render() {
    // Math.floor((this.tileWidth / this.state.zoom)/16)
    // Math.floor(100*this.state.zoom);
    let scale = this.state.tileSize;
    // console.log(`tileSize: ${scale}`);
    return (
      <View
        style={{
          position: "absolute",
          top: this.state.offsetTop + this.state.top,
          left: this.state.offsetLeft + this.state.left,
          // width: this.gameBoardWidth,
          // height: this.gameBoardWidth,
        }}
        {...this._panResponder.panHandlers}
      >
        <TileMap
          src={require("../data/images/Black_square.jpeg")}
          tileSize={scale}
          columns={40}
          rows={40}
          sourceWidth={scale}
          layers={[this.blackTilesMap]}
        />
        <TileMap
          src={require("../data/images/Magenta-square_100px.gif")}
          tileSize={scale}
          columns={40}
          rows={40}
          sourceWidth={scale}
          layers={[this.wallTilesMap]}
        />
        <TileMap
          src={require("../data/images/Cyan-square.png")}
          tileSize={scale}
          columns={40}
          rows={40}
          sourceWidth={scale}
          layers={[this.floorTilesMap]}
        />
      </View>
    );
  }
}
