import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { Loop, Stage } from "react-game-kit/native";

import Board from './Board';

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    children: PropTypes.any,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool
  };
  constructor(props) {
    super(props);
    console.log("Engine");
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 100;
    this.sourceWidth = 100;
    this.gameBoardWidth = this.tileWidth * props.tilesInRow;
    this.scale = 0.2;
    this.state = {
      stageHeight: this.screenDimensions.height,
      stageWidth: this.screenDimensions.width,
    };
  }

  zoomIn = () => {
    console.log('zoomIn');
    this.setState({
      stageHeight: this.state.stageHeight / 2,
      stageWidth: this.state.stageWidth / 2,
    });
  }

  zoomOut = () => {
    console.log('zoomOut');
    this.setState({
      stageHeight: this.state.stageHeight * 2,
      stageWidth: this.state.stageWidth * 2,
    });
  }

  render() {
    console.log('engine render began');
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          width={this.state.stageWidth}
          height={this.state.stageHeight}
          style={{
            backgroundColor: "#515151"
            // width: Math.floor(this.screenDimensions.width * 0.98),
            // height: Math.floor(this.screenDimensions.height * 0.8),
            // marginLeft: Math.floor(this.screenDimensions.width * 0.01),
            // marginRight: Math.floor(this.screenDimensions.width * 0.01),
            // marginTop: Math.floor(this.screenDimensions.width * 0.01)
          }}
        >
          {this.props.boardFinished ?
            <Board gameBoard={this.props.gameBoard} />
          : null}
          <View style={{ flexDirection: 'column' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#fff', width: 50, height: 50 }}
              onPress={this.zoomIn}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#ccc', width: 50, height: 50 }}
              onPress={this.zoomOut}
            />
          </View>
        </Stage>
      </Loop>
    );
  }
}
