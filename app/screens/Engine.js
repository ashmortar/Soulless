import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, Image, View, PanResponder, TouchableOpacity } from "react-native";
import { Loop, Stage, TileMap } from "react-game-kit/native";

import Board from "./Board";

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool,
    playerSpace: PropTypes.object,
    isHuman: PropTypes.bool,
    move: PropTypes.func,
  };

  constructor(props) {
    super(props);
    // console.log("Engine");
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = Math.ceil(this.screenDimensions.height / this.props.tilesInRow);
    this.gameBoardWidth = this.tileWidth * 40;
    this.playerX = (props.playerSpace.name % 40) * this.tileWidth;
    this.playerY = Math.floor(props.playerSpace.name / 40) * this.tileWidth;
    this.highlightedTileRanges = [];
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
      showHighlighted: false,
      fogMap: this.props.gameBoard.map(a => a.isRevealed ? 0 : 1),
      finishedUpdatingFogMap: true,

    };
  }

  componentWillMount() {
    // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    // console.log(this.props.isHuman);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      // onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      // onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {},
      onPanResponderMove: (evt, gestureState) => {
        let { touches } = evt.nativeEvent;
        // let { touches } = evt.nativeEvent;
        if (touches.length === 2 && !this.state.isZooming) {
          this.processPan(touches[0].pageX, touches[0].pageY);
        }
        if (this.state.showHighlighted && touches.length === 1) {
          this.processMove(touches[0].pageX, touches[0].pageY);
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log('received props');
    let newHighlightedTileMap = nextProps.gameBoard.map(x => x.isHighlighted ? 1 : 0);
    let newFogMap = nextProps.gameBoard.map(x => x.isRevealed ? 0 : 1);
    if (this.props.playerSpace !== nextProps.playerSpace) {
      this.setState({
        playerX: (nextProps.playerSpace.name % 40) * this.tileWidth,
        playerY: Math.floor(nextProps.playerSpace.name / 40) * this.tileWidth,
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

  processMove(touchX, touchY) {
    let x = touchX - this.state.left;
    let y = touchY - this.state.top;
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
      }
    }
  }

  getTileFromXY(x, y) {
    y = Math.floor(y/this.tileWidth);
    x = Math.floor(x/this.tileWidth);
    let index = ((y * 40) + x);
    console.log(this.state.playerSpace.name, index);
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
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.tileWidth}
          layers={[this.state.highlightedTileMap]}
          renderTile={(tile, src, styles) => {
            this.highlightedTileRanges.push(this.getRangesFromTile(tile));
            return (
              <TouchableOpacity style={[styles]}>
                <Image
                  resizeMode="stretch"
                  style={[styles, { opacity: 0.25 }]}
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

  render() {
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          height={this.screenDimensions.height}
          width={this.screenDimensions.width}
          style={{ backgroundColor: "#515151" }}
          removeClippedSubviews={true}
        >
          <View style={{ position: 'absolute', left: this.state.left, top: this.state.top, overflow: 'hidden' }} {...this._panResponder.panHandlers} >
            <Board
              gameBoard={this.props.gameBoard}
              isHuman={this.props.isHuman}
            />
            <Image style={{ position: 'absolute', top: (this.state.playerY - this.tileWidth), left: this.state.playerX, height: (this.tileWidth * 2), width: this.tileWidth, resizeMode: 'contain' }} source={require("../data/images/human.png")} />

            {this.renderHighlighted()}
            
          </View>
        </Stage>
      </Loop>
    );
  }
}
