import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions } from "react-native";
import { Loop, Stage } from "react-game-kit/native";

import Board from "./Board";

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool
  };

  constructor(props) {
    super(props);
    console.log("Engine");
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 80;
    this.sourceWidth = 80;
    this.gameBoardWidth = this.tileWidth * 40;
    this.state = {
      stageHeight: this.screenDimensions.height,
      stageWidth: this.screenDimensions.width,
    };
  }

  render() {
    const { stageHeight, stageWidth } = this.state;
    console.log("engine render began");
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          height={this.screenDimensions.height}
          width={this.screenDimensions.width}
          style={{ backgroundColor: "#515151" }}
        >
          {this.props.boardFinished ? (
            <Board
              gameBoard={this.props.gameBoard}
              processPinch={this.processPinch}
              releaseTouch={this.releaseTouch}
              zoom={this.zoom}
            />
          ) : null}
        </Stage>
      </Loop>
    );
  }
}
