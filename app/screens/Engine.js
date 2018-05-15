import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions } from "react-native";
import { Loop, Stage } from "react-game-kit/native";

import Board from "./Board";

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

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool
  };

  constructor(props) {
    super(props);
    console.log("Engine");
    this._onLayout = this._onLayout.bind(this);
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 100;
    this.sourceWidth = 100;
    this.gameBoardWidth = this.tileWidth * props.tilesInRow;
    this.state = {
      stageHeight: this.screenDimensions.height,
      stageWidth: this.screenDimensions.width,
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
      left: 0
    };
  }

  releaseTouch = () => {
    this.setState({
      isZooming: false,
      isMoving: false
  });
  }

  processPinch = (x1, y1, x2, y2) => {
    console.log('process pinch');
    let distance = calcDistance(x1, y1, x2, y2);
    let center = calcCenter(x1, y1, x2, y2);

    if (!this.state.isZooming) {
      let offsetByZoom = calcOffsetByZoom(
        this.state.width,
        this.state.height,
        this.props.imageWidth,
        this.props.imageHeight,
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
        this.props.imageWidth,
        this.props.imageHeight,
        zoom
      );
      let left =
        this.state.initialLeftWithoutZoom * touchZoom + offsetByZoom.left;
      let top = this.state.initialTopWithoutZoom * touchZoom + offsetByZoom.top;
      console.log('zoom', zoom)
      this.setState({
        zoom: zoom,
        left: 0,
        top: 0,
        left:
          left > 0
            ? 0
            : maxOffset(left, this.state.width, this.props.imageWidth * zoom),
        top:
          top > 0
            ? 0
            : maxOffset(top, this.state.height, this.props.imageHeight * zoom)
      });
    }
  }

  _onLayout(event) {
    let layout = event.nativeEvent.layout;

    if (
      layout.width === this.state.width &&
      layout.height === this.state.height
    ) {
      return;
    }

    let zoom = layout.width / this.props.imageWidth;

    let offsetTop =
      layout.height > this.props.imageHeight * zoom
        ? (layout.height - this.props.imageHeight * zoom) / 2
        : 0;

    this.setState({
      layoutKnown: true,
      width: layout.width,
      height: layout.height,
      zoom: zoom,
      offsetTop: offsetTop,
      minZoom: zoom
    });
  }

  render() {
    const { left, top, zoom } = this.state;
    console.log("engine render began");
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          width={this.state.stageWidth / this.state.zoom}
          height={this.state.stageHeight / this.state.zoom}
          style={{ backgroundColor: "#515151" }}
        >
          {this.props.boardFinished ? (
            <Board
              gameBoard={this.props.gameBoard}
              processPinch={this.processPinch}
              releaseTouch={this.releaseTouch}
            />
          ) : null}
        </Stage>
      </Loop>
    );
  }
}
